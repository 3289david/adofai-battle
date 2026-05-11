import { getDb } from "./db";
import { v4 as uuid } from "uuid";

/**
 * ADOFAI.NET Anti-Cheat System
 *
 * Multi-layer validation for video-upload-based competition:
 *
 * Layer 1: Statistical Analysis
 *   - Accuracy vs difficulty plausibility
 *   - Score consistency across submissions
 *   - Suspicious patterns (identical scores, impossible combos)
 *
 * Layer 2: Cross-Reference
 *   - Compare claimed stats against ADOFAI.NET records API
 *   - Check if user's historical accuracy supports submitted score
 *   - Flag sudden massive improvement
 *
 * Layer 3: Community Reports
 *   - Players can flag suspicious submissions
 *   - Moderators review flagged submissions
 *
 * Layer 4: Moderator Review
 *   - Manual video verification queue
 *   - Moderators can verify, reject, or ban
 */

export interface AnticheatResult {
  status: "clean" | "flagged" | "suspicious" | "rejected";
  score: number; // 0-100, higher = more suspicious
  flags: string[];
}

export function analyzeSubmission(submission: {
  accuracy: number;
  maxCombo: number;
  perfectCount: number;
  greatCount: number;
  missCount: number;
  score: number;
  userId: string;
}): AnticheatResult {
  const flags: string[] = [];
  let suspicionScore = 0;

  // Flag 1: Perfect accuracy on any submission
  if (submission.accuracy >= 100 && submission.missCount === 0 && submission.greatCount === 0) {
    flags.push("PERFECT_SCORE");
    suspicionScore += 15;
  }

  // Flag 2: Impossibly high accuracy with misses reported
  if (submission.accuracy > 99.5 && submission.missCount > 0) {
    flags.push("ACCURACY_MISS_MISMATCH");
    suspicionScore += 25;
  }

  // Flag 3: Score total doesn't match judgment breakdown
  const totalInputs = submission.perfectCount + submission.greatCount + submission.missCount;
  if (totalInputs > 0) {
    const expectedAccuracy = (submission.perfectCount / totalInputs) * 100;
    if (Math.abs(expectedAccuracy - submission.accuracy) > 2) {
      flags.push("ACCURACY_CALCULATION_MISMATCH");
      suspicionScore += 30;
    }
  }

  // Flag 4: Zero inputs
  if (totalInputs === 0 && submission.accuracy > 0) {
    flags.push("NO_INPUT_DATA");
    suspicionScore += 40;
  }

  // Flag 5: Combo exceeds total inputs
  if (submission.maxCombo > totalInputs && totalInputs > 0) {
    flags.push("COMBO_EXCEEDS_INPUTS");
    suspicionScore += 50;
  }

  // Flag 6: Check historical performance
  const db = getDb();
  const history = db.prepare(
    `SELECT AVG(accuracy) as avg_acc, MAX(accuracy) as max_acc, COUNT(*) as count
     FROM submissions WHERE user_id = ? AND anticheat_status != 'rejected'`
  ).get(submission.userId) as { avg_acc: number | null; max_acc: number | null; count: number };

  if (history.count >= 3 && history.avg_acc !== null) {
    const improvement = submission.accuracy - history.avg_acc;
    if (improvement > 15) {
      flags.push("SUDDEN_IMPROVEMENT");
      suspicionScore += 20;
    }
  }

  // Determine status
  let status: AnticheatResult["status"] = "clean";
  if (suspicionScore >= 50) status = "rejected";
  else if (suspicionScore >= 30) status = "suspicious";
  else if (suspicionScore >= 10) status = "flagged";

  return { status, score: suspicionScore, flags };
}

export function createReport(
  submissionId: string,
  reporterId: string | null,
  reportType: "auto" | "player" | "moderator",
  reason: string,
  flags: string[]
): string {
  const db = getDb();
  const id = uuid();

  db.prepare(
    `INSERT INTO anticheat_reports (id, submission_id, reporter_id, report_type, reason, flags, status)
     VALUES (?, ?, ?, ?, ?, ?, 'pending')`
  ).run(id, submissionId, reporterId, reportType, reason, JSON.stringify(flags));

  return id;
}

export function reviewReport(
  reportId: string,
  reviewerId: string,
  action: "approve" | "reject" | "ban_player",
  note: string
) {
  const db = getDb();

  const report = db.prepare("SELECT * FROM anticheat_reports WHERE id = ?").get(reportId) as {
    id: string; submission_id: string;
  } | undefined;

  if (!report) return;

  db.prepare(
    `UPDATE anticheat_reports SET status = 'reviewed', reviewed_by = ?, review_note = ?, action_taken = ?, reviewed_at = datetime('now')
     WHERE id = ?`
  ).run(reviewerId, note, action, reportId);

  if (action === "reject") {
    db.prepare("UPDATE submissions SET anticheat_status = 'rejected', is_verified = 0 WHERE id = ?")
      .run(report.submission_id);
  } else if (action === "approve") {
    db.prepare("UPDATE submissions SET anticheat_status = 'clean', is_verified = 1, verified_by = ? WHERE id = ?")
      .run(reviewerId, report.submission_id);
  } else if (action === "ban_player") {
    const sub = db.prepare("SELECT user_id FROM submissions WHERE id = ?").get(report.submission_id) as { user_id: string };
    db.prepare("UPDATE submissions SET anticheat_status = 'rejected', is_verified = 0 WHERE id = ?")
      .run(report.submission_id);
    db.prepare("UPDATE users SET ban_status = 'banned', ban_reason = ? WHERE id = ?")
      .run(`Anti-cheat violation: ${note}`, sub.user_id);
  }

  // Log moderation action
  const sub = db.prepare("SELECT user_id FROM submissions WHERE id = ?").get(report.submission_id) as { user_id: string };
  db.prepare(
    `INSERT INTO moderation_log (id, moderator_id, target_user_id, target_submission_id, action, reason)
     VALUES (?, ?, ?, ?, ?, ?)`
  ).run(uuid(), reviewerId, sub.user_id, report.submission_id, action, note);
}

export async function crossReferenceWithAdofaiNet(
  username: string,
  claimedAccuracy: number
): Promise<{ plausible: boolean; adofaiNetBest: number | null; flags: string[] }> {
  const flags: string[] = [];

  try {
    const res = await fetch(`https://adofai.net/api/profile/${encodeURIComponent(username)}`);
    if (!res.ok) return { plausible: true, adofaiNetBest: null, flags: ["ADOFAI_NET_PROFILE_NOT_FOUND"] };

    const data = await res.json();
    const profile = data.user || data;

    if (profile.bestAccuracy && claimedAccuracy > profile.bestAccuracy + 5) {
      flags.push("EXCEEDS_ADOFAI_NET_BEST");
      return { plausible: false, adofaiNetBest: profile.bestAccuracy, flags };
    }

    return { plausible: true, adofaiNetBest: profile.bestAccuracy || null, flags };
  } catch {
    return { plausible: true, adofaiNetBest: null, flags: ["ADOFAI_NET_UNREACHABLE"] };
  }
}
