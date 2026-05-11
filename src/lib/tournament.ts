import { getDb, getRankForMMR } from "./db";
import { v4 as uuid } from "uuid";

/**
 * Valorant-style tournament engine.
 *
 * Format:
 *   1. Swiss Stage — all players, N rounds. Win/loss record determines advancement.
 *      Players with enough wins advance to playoffs. Too many losses = eliminated.
 *   2. Playoffs — single or double elimination bracket from Swiss qualifiers.
 *
 * Match flow:
 *   1. Match assigned (two players, a map or map veto)
 *   2. Both players play the map on their own time and upload video
 *   3. Results compared — higher accuracy wins
 *   4. Winner advances
 */

export function generateSwissRound(tournamentId: string, roundNumber: number): string {
  const db = getDb();

  const players = db.prepare(
    `SELECT tp.user_id, tp.swiss_wins, tp.swiss_losses, u.mmr
     FROM tournament_players tp
     JOIN users u ON tp.user_id = u.id
     WHERE tp.tournament_id = ? AND tp.eliminated = 0
     ORDER BY tp.swiss_wins DESC, u.mmr DESC`
  ).all(tournamentId) as { user_id: string; swiss_wins: number; swiss_losses: number; mmr: number }[];

  const roundId = uuid();
  db.prepare(
    `INSERT INTO tournament_rounds (id, tournament_id, round_number, round_type, status)
     VALUES (?, ?, ?, 'swiss', 'active')`
  ).run(roundId, tournamentId, roundNumber);

  const tournament = db.prepare("SELECT * FROM tournaments WHERE id = ?").get(tournamentId) as {
    maps: string; submission_deadline_hours: number;
  };
  const maps: string[] = JSON.parse(tournament.maps || "[]");

  const paired = new Set<string>();
  for (let i = 0; i < players.length; i++) {
    if (paired.has(players[i].user_id)) continue;

    let opponent: typeof players[number] | null = null;
    for (let j = i + 1; j < players.length; j++) {
      if (!paired.has(players[j].user_id)) {
        opponent = players[j];
        break;
      }
    }

    if (!opponent) {
      // Bye — auto-win
      db.prepare(
        "UPDATE tournament_players SET swiss_wins = swiss_wins + 1 WHERE tournament_id = ? AND user_id = ?"
      ).run(tournamentId, players[i].user_id);
      continue;
    }

    paired.add(players[i].user_id);
    paired.add(opponent.user_id);

    const mapName = maps.length > 0
      ? maps[(roundNumber - 1) % maps.length]
      : "TBD";

    const deadline = new Date(Date.now() + tournament.submission_deadline_hours * 60 * 60 * 1000).toISOString();

    const matchId = uuid();
    db.prepare(
      `INSERT INTO matches (id, tournament_id, round_id, player1_id, player2_id, map_name, status, submission_deadline)
       VALUES (?, ?, ?, ?, ?, ?, 'active', ?)`
    ).run(matchId, tournamentId, roundId, players[i].user_id, opponent.user_id, mapName, deadline);

    const gameId = uuid();
    db.prepare(
      `INSERT INTO match_games (id, match_id, game_number, map_name, status)
       VALUES (?, ?, 1, ?, 'active')`
    ).run(gameId, matchId, mapName);
  }

  return roundId;
}

export function resolveMatch(matchId: string) {
  const db = getDb();

  const match = db.prepare("SELECT * FROM matches WHERE id = ?").get(matchId) as {
    id: string; tournament_id: string; player1_id: string; player2_id: string; status: string;
  };
  if (!match || match.status !== "active") return;

  const games = db.prepare(
    "SELECT * FROM match_games WHERE match_id = ? ORDER BY game_number"
  ).all(matchId) as { id: string; game_number: number; winner_id: string | null }[];

  let p1Wins = 0;
  let p2Wins = 0;

  for (const game of games) {
    const subs = db.prepare(
      "SELECT user_id, accuracy, score FROM submissions WHERE game_id = ? ORDER BY accuracy DESC, score DESC"
    ).all(game.id) as { user_id: string; accuracy: number; score: number }[];

    if (subs.length < 2) continue;

    const winner = subs[0].user_id;
    db.prepare("UPDATE match_games SET winner_id = ?, status = 'completed' WHERE id = ?")
      .run(winner, game.id);

    if (winner === match.player1_id) p1Wins++;
    else p2Wins++;
  }

  const allGamesResolved = games.every(g => {
    const subCount = (db.prepare("SELECT COUNT(*) as c FROM submissions WHERE game_id = ?").get(g.id) as { c: number }).c;
    return subCount >= 2;
  });

  if (!allGamesResolved) return;

  const winnerId = p1Wins >= p2Wins ? match.player1_id : match.player2_id;
  const loserId = winnerId === match.player1_id ? match.player2_id : match.player1_id;

  db.prepare("UPDATE matches SET winner_id = ?, status = 'completed' WHERE id = ?")
    .run(winnerId, matchId);

  // Update Swiss records
  const round = db.prepare("SELECT round_type FROM tournament_rounds WHERE id = (SELECT round_id FROM matches WHERE id = ?)").get(matchId) as { round_type: string };

  if (round.round_type === "swiss") {
    db.prepare("UPDATE tournament_players SET swiss_wins = swiss_wins + 1 WHERE tournament_id = ? AND user_id = ?")
      .run(match.tournament_id, winnerId);
    db.prepare("UPDATE tournament_players SET swiss_losses = swiss_losses + 1 WHERE tournament_id = ? AND user_id = ?")
      .run(match.tournament_id, loserId);

    const tournament = db.prepare("SELECT swiss_rounds FROM tournaments WHERE id = ?").get(match.tournament_id) as { swiss_rounds: number };
    const loserRecord = db.prepare("SELECT swiss_losses FROM tournament_players WHERE tournament_id = ? AND user_id = ?")
      .get(match.tournament_id, loserId) as { swiss_losses: number };

    const maxLosses = Math.ceil(tournament.swiss_rounds / 2);
    if (loserRecord.swiss_losses >= maxLosses) {
      db.prepare("UPDATE tournament_players SET eliminated = 1 WHERE tournament_id = ? AND user_id = ?")
        .run(match.tournament_id, loserId);
    }
  } else if (round.round_type === "bracket") {
    db.prepare("UPDATE tournament_players SET eliminated = 1 WHERE tournament_id = ? AND user_id = ?")
      .run(match.tournament_id, loserId);
  }

  // Update user stats
  const winnerMmr = (db.prepare("SELECT mmr FROM users WHERE id = ?").get(winnerId) as { mmr: number }).mmr;
  const loserMmr = (db.prepare("SELECT mmr FROM users WHERE id = ?").get(loserId) as { mmr: number }).mmr;

  const mmrGain = Math.max(10, Math.round(25 + (loserMmr - winnerMmr) * 0.04));
  const mmrLoss = Math.max(5, Math.round(20 + (winnerMmr - loserMmr) * 0.04));

  const newWinnerMmr = winnerMmr + mmrGain;
  const newLoserMmr = Math.max(0, loserMmr - mmrLoss);

  db.prepare(
    `UPDATE users SET mmr = ?, rank = ?, total_matches = total_matches + 1, wins = wins + 1,
     peak_rank = CASE WHEN ? > mmr THEN ? ELSE peak_rank END, updated_at = datetime('now')
     WHERE id = ?`
  ).run(newWinnerMmr, getRankForMMR(newWinnerMmr), newWinnerMmr, getRankForMMR(newWinnerMmr), winnerId);

  db.prepare(
    `UPDATE users SET mmr = ?, rank = ?, total_matches = total_matches + 1, updated_at = datetime('now')
     WHERE id = ?`
  ).run(newLoserMmr, getRankForMMR(newLoserMmr), loserId);
}

export function generatePlayoffBracket(tournamentId: string): string {
  const db = getDb();

  const qualifiers = db.prepare(
    `SELECT tp.user_id, tp.swiss_wins, u.mmr
     FROM tournament_players tp JOIN users u ON tp.user_id = u.id
     WHERE tp.tournament_id = ? AND tp.eliminated = 0
     ORDER BY tp.swiss_wins DESC, u.mmr DESC`
  ).all(tournamentId) as { user_id: string; swiss_wins: number; mmr: number }[];

  // Seed players for bracket
  qualifiers.forEach((p, i) => {
    db.prepare("UPDATE tournament_players SET seed = ? WHERE tournament_id = ? AND user_id = ?")
      .run(i + 1, tournamentId, p.user_id);
  });

  const roundId = uuid();
  const roundNumber = (db.prepare(
    "SELECT COALESCE(MAX(round_number), 0) + 1 as n FROM tournament_rounds WHERE tournament_id = ?"
  ).get(tournamentId) as { n: number }).n;

  db.prepare(
    `INSERT INTO tournament_rounds (id, tournament_id, round_number, round_type, status)
     VALUES (?, ?, ?, 'bracket', 'active')`
  ).run(roundId, tournamentId, roundNumber);

  const tournament = db.prepare("SELECT maps, submission_deadline_hours FROM tournaments WHERE id = ?")
    .get(tournamentId) as { maps: string; submission_deadline_hours: number };
  const maps: string[] = JSON.parse(tournament.maps || "[]");
  const deadline = new Date(Date.now() + tournament.submission_deadline_hours * 60 * 60 * 1000).toISOString();

  // Standard bracket seeding: 1v8, 2v7, 3v6, 4v5...
  for (let i = 0; i < Math.floor(qualifiers.length / 2); i++) {
    const p1 = qualifiers[i];
    const p2 = qualifiers[qualifiers.length - 1 - i];
    const mapName = maps.length > 0 ? maps[i % maps.length] : "TBD";

    const matchId = uuid();
    db.prepare(
      `INSERT INTO matches (id, tournament_id, round_id, player1_id, player2_id, map_name, best_of, status, bracket_position, submission_deadline)
       VALUES (?, ?, ?, ?, ?, ?, 3, 'active', ?, ?)`
    ).run(matchId, tournamentId, roundId, p1.user_id, p2.user_id, mapName, `QF-${i + 1}`, deadline);

    for (let g = 1; g <= 3; g++) {
      const gameId = uuid();
      const gameMap = maps.length > 0 ? maps[(i + g - 1) % maps.length] : mapName;
      db.prepare(
        `INSERT INTO match_games (id, match_id, game_number, map_name, status)
         VALUES (?, ?, ?, ?, 'active')`
      ).run(gameId, matchId, g, gameMap);
    }
  }

  return roundId;
}
