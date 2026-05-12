import { cookies } from "next/headers";
import { getDb } from "./db";
import { v4 as uuid } from "uuid";

const SESSION_COOKIE = "adofai_battle_session";
const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export interface SessionUser {
  id: string;
  adofai_net_id: string | null;
  username: string;
  avatar_url: string | null;
  role: string;
  mmr: number;
  rank: string;
  peak_rank: string;
  peak_mmr: number;
  total_matches: number;
  wins: number;
  losses: number;
  best_accuracy: number;
  best_combo: number;
  tournaments_won: number;
  tournaments_played: number;
  ban_status: string;
  clan_id: string | null;
  title: string;
  follower_count: number;
  following_count: number;
  total_xp: number;
  level: number;
}

/**
 * Deprecated: password login to adofai.net. Use OAuth via `finalizeOAuthAndCreateSession`.
 */
export async function loginWithAdofaiNet(
  email: string,
  password: string
): Promise<{ user?: SessionUser; error?: string; adofaiToken?: string }> {
  try {
    const res = await fetch("https://adofai.net/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      if (data.error === "EMAIL_NOT_VERIFIED") {
        return { error: "Your ADOFAI.NET email is not verified. Check your inbox." };
      }
      return { error: data.error || data.message || "Invalid ADOFAI.NET credentials" };
    }

    const loginData = await res.json();

    // Extract the auth_token cookie from the response
    const setCookieHeader = res.headers.get("set-cookie");
    let adofaiToken: string | undefined;
    if (setCookieHeader) {
      const match = setCookieHeader.match(/auth_token=([^;]+)/);
      if (match) adofaiToken = match[1];
    }

    // Fetch full profile using the token
    const meHeaders: Record<string, string> = {};
    if (adofaiToken) {
      meHeaders["Cookie"] = `auth_token=${adofaiToken}`;
    } else if (setCookieHeader) {
      meHeaders["Cookie"] = setCookieHeader;
    }

    const meRes = await fetch("https://adofai.net/api/auth/me", { headers: meHeaders });

    // Use login response data if /me fails (login already returns user info)
    const adofaiUser = meRes.ok ? await meRes.json() : loginData;

    const db = getDb();
    const adofaiNetId = String(adofaiUser.id || loginData.id || email);
    const displayName = adofaiUser.username || loginData.username || email.split("@")[0];
    const avatarUrl = adofaiUser.avatar || loginData.avatar || null;

    // Find or create local user
    let localUser = db.prepare("SELECT * FROM users WHERE adofai_net_id = ?").get(adofaiNetId) as Record<string, unknown> | undefined;

    if (!localUser) {
      // Check by username
      localUser = db.prepare("SELECT * FROM users WHERE username = ?").get(displayName) as Record<string, unknown> | undefined;

      if (localUser) {
        // Link existing account
        db.prepare("UPDATE users SET adofai_net_id = ?, avatar_url = ?, updated_at = datetime('now') WHERE id = ?")
          .run(adofaiNetId, avatarUrl, localUser.id);
      } else {
        // Create new user
        const id = uuid();
        db.prepare(
          `INSERT INTO users (id, adofai_net_id, username, avatar_url)
           VALUES (?, ?, ?, ?)`
        ).run(id, adofaiNetId, displayName, avatarUrl);
        localUser = db.prepare("SELECT * FROM users WHERE id = ?").get(id) as Record<string, unknown>;
      }
    } else {
      db.prepare("UPDATE users SET avatar_url = ?, updated_at = datetime('now') WHERE id = ?")
        .run(avatarUrl, localUser.id);
    }

    if ((localUser.ban_status as string) === "banned") {
      return { error: "Your account is banned: " + (localUser.ban_reason || "Contact moderator") };
    }

    const sessionUser = rowToSessionUser(localUser);
    await createSession(sessionUser.id, adofaiToken);

    return { user: sessionUser, adofaiToken };
  } catch (e) {
    return { error: "Failed to connect to ADOFAI.NET" };
  }
}

export type IdpUserInfo = {
  sub: string;
  email?: string;
  preferred_username?: string;
  username?: string;
};

/** After OAuth token exchange + userinfo — link local SQLite row and set session cookie. */
export async function finalizeOAuthAndCreateSession(
  profile: IdpUserInfo
): Promise<{ user: SessionUser } | { error: string }> {
  try {
    const db = getDb();
    const adofaiNetId = String(profile.sub);
    const displayName =
      profile.preferred_username || profile.username || profile.email?.split("@")[0] || "player";
    const avatarUrl: string | null = null;

    let localUser = db.prepare("SELECT * FROM users WHERE adofai_net_id = ?").get(adofaiNetId) as Record<string, unknown> | undefined;

    if (!localUser) {
      localUser = db.prepare("SELECT * FROM users WHERE username = ?").get(displayName) as Record<string, unknown> | undefined;

      if (localUser) {
        db.prepare("UPDATE users SET adofai_net_id = ?, avatar_url = ?, updated_at = datetime('now') WHERE id = ?")
          .run(adofaiNetId, avatarUrl, localUser.id);
      } else {
        const id = uuid();
        db.prepare(`INSERT INTO users (id, adofai_net_id, username, avatar_url) VALUES (?, ?, ?, ?)`).run(
          id,
          adofaiNetId,
          displayName,
          avatarUrl
        );
        localUser = db.prepare("SELECT * FROM users WHERE id = ?").get(id) as Record<string, unknown>;
      }
    } else {
      db.prepare("UPDATE users SET avatar_url = ?, updated_at = datetime('now') WHERE id = ?").run(avatarUrl, localUser.id);
    }

    if ((localUser.ban_status as string) === "banned") {
      return { error: "Your account is banned: " + ((localUser.ban_reason as string) || "Contact moderator") };
    }

    const sessionUser = rowToSessionUser(localUser);
    await createSession(sessionUser.id, undefined);
    return { user: sessionUser };
  } catch {
    return { error: "OAuth session failed." };
  }
}

export async function createSession(userId: string, adofaiToken?: string): Promise<string> {
  const db = getDb();
  const sessionId = uuid();
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS).toISOString();

  db.prepare(
    "INSERT INTO sessions (id, user_id, adofai_net_token, expires_at) VALUES (?, ?, ?, ?)"
  ).run(sessionId, userId, adofaiToken || null, expiresAt);

  const jar = await cookies();
  jar.set(SESSION_COOKIE, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION_MS / 1000,
  });

  return sessionId;
}

export async function getSession(): Promise<SessionUser | null> {
  const jar = await cookies();
  const sessionId = jar.get(SESSION_COOKIE)?.value;
  if (!sessionId) return null;

  const db = getDb();
  const row = db
    .prepare(
      `SELECT u.* FROM sessions s JOIN users u ON s.user_id = u.id
       WHERE s.id = ? AND s.expires_at > datetime('now')`
    )
    .get(sessionId) as Record<string, unknown> | undefined;

  if (!row) return null;
  return rowToSessionUser(row);
}

export async function destroySession(): Promise<void> {
  const jar = await cookies();
  const sessionId = jar.get(SESSION_COOKIE)?.value;
  if (sessionId) {
    const db = getDb();
    db.prepare("DELETE FROM sessions WHERE id = ?").run(sessionId);
  }
  jar.delete(SESSION_COOKIE);
}

function rowToSessionUser(row: Record<string, unknown>): SessionUser {
  return {
    id: row.id as string,
    adofai_net_id: row.adofai_net_id as string | null,
    username: row.username as string,
    avatar_url: row.avatar_url as string | null,
    role: row.role as string,
    mmr: row.mmr as number,
    rank: row.rank as string,
    peak_rank: row.peak_rank as string,
    peak_mmr: row.peak_mmr as number,
    total_matches: row.total_matches as number,
    wins: row.wins as number,
    losses: row.losses as number,
    best_accuracy: row.best_accuracy as number,
    best_combo: row.best_combo as number,
    tournaments_won: row.tournaments_won as number,
    tournaments_played: row.tournaments_played as number,
    ban_status: row.ban_status as string,
    clan_id: (row.clan_id as string | null) ?? null,
    title: (row.title as string) ?? "",
    follower_count: (row.follower_count as number) ?? 0,
    following_count: (row.following_count as number) ?? 0,
    total_xp: (row.total_xp as number) ?? 0,
    level: (row.level as number) ?? 1,
  };
}
