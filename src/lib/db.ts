import Database from "better-sqlite3";
import path from "path";

const DB_PATH = path.join(process.cwd(), "adofai.db");

let _db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!_db) {
    _db = new Database(DB_PATH);
    _db.pragma("journal_mode = WAL");
    _db.pragma("foreign_keys = ON");
    initDb(_db);
  }
  return _db;
}

function initDb(db: Database.Database) {
  db.exec(`
    -- Users linked to ADOFAI.NET accounts
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      adofai_net_id TEXT UNIQUE,
      username TEXT UNIQUE NOT NULL,
      avatar_url TEXT,
      role TEXT NOT NULL DEFAULT 'player',
      mmr INTEGER NOT NULL DEFAULT 1000,
      rank TEXT NOT NULL DEFAULT 'Bronze',
      peak_rank TEXT NOT NULL DEFAULT 'Bronze',
      peak_mmr INTEGER NOT NULL DEFAULT 1000,
      total_matches INTEGER NOT NULL DEFAULT 0,
      wins INTEGER NOT NULL DEFAULT 0,
      losses INTEGER NOT NULL DEFAULT 0,
      best_accuracy REAL NOT NULL DEFAULT 0,
      best_combo INTEGER NOT NULL DEFAULT 0,
      tournaments_won INTEGER NOT NULL DEFAULT 0,
      tournaments_played INTEGER NOT NULL DEFAULT 0,
      daily_challenge_streak INTEGER NOT NULL DEFAULT 0,
      badges TEXT NOT NULL DEFAULT '[]',
      clan_id TEXT REFERENCES clans(id),
      title TEXT NOT NULL DEFAULT '',
      follower_count INTEGER NOT NULL DEFAULT 0,
      following_count INTEGER NOT NULL DEFAULT 0,
      total_xp INTEGER NOT NULL DEFAULT 0,
      level INTEGER NOT NULL DEFAULT 1,
      ban_status TEXT NOT NULL DEFAULT 'none',
      ban_reason TEXT,
      ban_expires_at TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Sessions (ADOFAI.NET JWT-backed)
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      adofai_net_token TEXT,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Tournament types: daily, weekly, monthly, season, annual (auto-created)
    CREATE TABLE IF NOT EXISTS tournaments (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      tournament_type TEXT NOT NULL DEFAULT 'daily',
      difficulty_tier TEXT NOT NULL DEFAULT 'beginner',
      mode TEXT NOT NULL DEFAULT 'accuracy',
      format TEXT NOT NULL DEFAULT 'swiss_bracket',
      status TEXT NOT NULL DEFAULT 'registration',
      max_players INTEGER NOT NULL DEFAULT 16,
      min_players INTEGER NOT NULL DEFAULT 2,
      maps TEXT NOT NULL DEFAULT '[]',
      map_pool_source TEXT NOT NULL DEFAULT 'adofai_net',
      rules TEXT NOT NULL DEFAULT '{}',
      prize_description TEXT NOT NULL DEFAULT '',
      prize_mmr_bonus INTEGER NOT NULL DEFAULT 0,
      swiss_rounds INTEGER NOT NULL DEFAULT 3,
      bracket_type TEXT NOT NULL DEFAULT 'single_elimination',
      best_of_swiss INTEGER NOT NULL DEFAULT 1,
      best_of_playoffs INTEGER NOT NULL DEFAULT 3,
      submission_deadline_hours INTEGER NOT NULL DEFAULT 24,
      min_mmr INTEGER NOT NULL DEFAULT 0,
      max_mmr INTEGER NOT NULL DEFAULT 99999,
      allow_map_veto INTEGER NOT NULL DEFAULT 1,
      auto_start INTEGER NOT NULL DEFAULT 0,
      recurrence TEXT,
      season_number INTEGER,
      created_by TEXT NOT NULL REFERENCES users(id),
      starts_at TEXT,
      ends_at TEXT,
      next_occurrence TEXT,
      featured INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Tournament registrations
    CREATE TABLE IF NOT EXISTS tournament_players (
      tournament_id TEXT NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
      user_id TEXT NOT NULL REFERENCES users(id),
      seed INTEGER,
      swiss_wins INTEGER NOT NULL DEFAULT 0,
      swiss_losses INTEGER NOT NULL DEFAULT 0,
      eliminated INTEGER NOT NULL DEFAULT 0,
      placement INTEGER,
      mmr_change INTEGER NOT NULL DEFAULT 0,
      registered_at TEXT NOT NULL DEFAULT (datetime('now')),
      PRIMARY KEY (tournament_id, user_id)
    );

    -- Tournament rounds
    CREATE TABLE IF NOT EXISTS tournament_rounds (
      id TEXT PRIMARY KEY,
      tournament_id TEXT NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
      round_number INTEGER NOT NULL,
      round_type TEXT NOT NULL DEFAULT 'swiss',
      status TEXT NOT NULL DEFAULT 'pending',
      deadline TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Matches within rounds
    CREATE TABLE IF NOT EXISTS matches (
      id TEXT PRIMARY KEY,
      tournament_id TEXT NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
      round_id TEXT NOT NULL REFERENCES tournament_rounds(id) ON DELETE CASCADE,
      player1_id TEXT REFERENCES users(id),
      player2_id TEXT REFERENCES users(id),
      map_name TEXT NOT NULL DEFAULT '',
      best_of INTEGER NOT NULL DEFAULT 1,
      status TEXT NOT NULL DEFAULT 'pending',
      winner_id TEXT REFERENCES users(id),
      bracket_position TEXT,
      submission_deadline TEXT,
      forfeit_reason TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Map pick/ban (Valorant-style veto)
    CREATE TABLE IF NOT EXISTS match_map_veto (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      match_id TEXT NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
      user_id TEXT NOT NULL REFERENCES users(id),
      map_name TEXT NOT NULL,
      action TEXT NOT NULL DEFAULT 'ban',
      pick_order INTEGER NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Individual games within Bo3/Bo5 matches
    CREATE TABLE IF NOT EXISTS match_games (
      id TEXT PRIMARY KEY,
      match_id TEXT NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
      game_number INTEGER NOT NULL,
      map_name TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      winner_id TEXT REFERENCES users(id),
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Video/replay submissions
    CREATE TABLE IF NOT EXISTS submissions (
      id TEXT PRIMARY KEY,
      game_id TEXT NOT NULL REFERENCES match_games(id) ON DELETE CASCADE,
      match_id TEXT NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
      user_id TEXT NOT NULL REFERENCES users(id),
      video_url TEXT NOT NULL,
      video_filename TEXT NOT NULL DEFAULT '',
      accuracy REAL,
      max_combo INTEGER,
      perfect_count INTEGER NOT NULL DEFAULT 0,
      great_count INTEGER NOT NULL DEFAULT 0,
      miss_count INTEGER NOT NULL DEFAULT 0,
      early_count INTEGER NOT NULL DEFAULT 0,
      late_count INTEGER NOT NULL DEFAULT 0,
      score INTEGER NOT NULL DEFAULT 0,
      speed_multiplier REAL NOT NULL DEFAULT 1.0,
      is_verified INTEGER NOT NULL DEFAULT 0,
      verified_by TEXT,
      anticheat_status TEXT NOT NULL DEFAULT 'pending',
      anticheat_flags TEXT NOT NULL DEFAULT '[]',
      anticheat_score REAL NOT NULL DEFAULT 0,
      submitted_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Anti-cheat reports and moderation
    CREATE TABLE IF NOT EXISTS anticheat_reports (
      id TEXT PRIMARY KEY,
      submission_id TEXT NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
      reporter_id TEXT REFERENCES users(id),
      report_type TEXT NOT NULL DEFAULT 'auto',
      reason TEXT NOT NULL DEFAULT '',
      flags TEXT NOT NULL DEFAULT '[]',
      status TEXT NOT NULL DEFAULT 'pending',
      reviewed_by TEXT REFERENCES users(id),
      review_note TEXT,
      action_taken TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      reviewed_at TEXT
    );

    -- Moderation log
    CREATE TABLE IF NOT EXISTS moderation_log (
      id TEXT PRIMARY KEY,
      moderator_id TEXT NOT NULL REFERENCES users(id),
      target_user_id TEXT REFERENCES users(id),
      target_submission_id TEXT REFERENCES submissions(id),
      target_tournament_id TEXT REFERENCES tournaments(id),
      action TEXT NOT NULL,
      reason TEXT NOT NULL DEFAULT '',
      details TEXT NOT NULL DEFAULT '{}',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Achievements / badges
    CREATE TABLE IF NOT EXISTS achievements (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      icon TEXT NOT NULL DEFAULT '🏆',
      category TEXT NOT NULL DEFAULT 'general',
      requirement TEXT NOT NULL DEFAULT '{}',
      rarity TEXT NOT NULL DEFAULT 'common'
    );

    CREATE TABLE IF NOT EXISTS user_achievements (
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      achievement_id TEXT NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
      earned_at TEXT NOT NULL DEFAULT (datetime('now')),
      PRIMARY KEY (user_id, achievement_id)
    );

    -- Season tracking
    CREATE TABLE IF NOT EXISTS seasons (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      season_number INTEGER NOT NULL UNIQUE,
      starts_at TEXT NOT NULL,
      ends_at TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'upcoming',
      rewards TEXT NOT NULL DEFAULT '{}',
      division_thresholds TEXT NOT NULL DEFAULT '{}',
      pass_levels INTEGER NOT NULL DEFAULT 50,
      theme TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS season_standings (
      season_id TEXT NOT NULL REFERENCES seasons(id) ON DELETE CASCADE,
      user_id TEXT NOT NULL REFERENCES users(id),
      season_mmr INTEGER NOT NULL DEFAULT 1000,
      season_wins INTEGER NOT NULL DEFAULT 0,
      season_losses INTEGER NOT NULL DEFAULT 0,
      tournaments_played INTEGER NOT NULL DEFAULT 0,
      final_placement INTEGER,
      rewards_claimed INTEGER NOT NULL DEFAULT 0,
      PRIMARY KEY (season_id, user_id)
    );

    -- Clans / Teams
    CREATE TABLE IF NOT EXISTS clans (
      id TEXT PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      tag TEXT UNIQUE NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      avatar_url TEXT,
      owner_id TEXT NOT NULL REFERENCES users(id),
      mmr INTEGER NOT NULL DEFAULT 1000,
      total_wins INTEGER NOT NULL DEFAULT 0,
      total_losses INTEGER NOT NULL DEFAULT 0,
      member_count INTEGER NOT NULL DEFAULT 1,
      max_members INTEGER NOT NULL DEFAULT 50,
      is_recruiting INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS clan_members (
      clan_id TEXT NOT NULL REFERENCES clans(id) ON DELETE CASCADE,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      role TEXT NOT NULL DEFAULT 'member',
      joined_at TEXT NOT NULL DEFAULT (datetime('now')),
      PRIMARY KEY (clan_id, user_id)
    );

    -- Map of the Day
    CREATE TABLE IF NOT EXISTS daily_maps (
      id TEXT PRIMARY KEY,
      map_title TEXT NOT NULL,
      map_artist TEXT NOT NULL,
      difficulty REAL NOT NULL,
      date TEXT NOT NULL UNIQUE,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS daily_map_scores (
      id TEXT PRIMARY KEY,
      daily_map_id TEXT NOT NULL REFERENCES daily_maps(id) ON DELETE CASCADE,
      user_id TEXT NOT NULL REFERENCES users(id),
      accuracy REAL NOT NULL,
      max_combo INTEGER NOT NULL DEFAULT 0,
      score INTEGER NOT NULL DEFAULT 0,
      video_url TEXT,
      submitted_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(daily_map_id, user_id)
    );

    -- Challenge Mode
    CREATE TABLE IF NOT EXISTS challenges (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      challenge_type TEXT NOT NULL DEFAULT 'accuracy',
      target_value REAL NOT NULL DEFAULT 95.0,
      map_title TEXT NOT NULL,
      map_artist TEXT NOT NULL DEFAULT '',
      difficulty REAL NOT NULL DEFAULT 1,
      reward_mmr INTEGER NOT NULL DEFAULT 50,
      reward_badge TEXT,
      expires_at TEXT,
      status TEXT NOT NULL DEFAULT 'active',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS challenge_completions (
      challenge_id TEXT NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
      user_id TEXT NOT NULL REFERENCES users(id),
      achieved_value REAL NOT NULL,
      video_url TEXT,
      completed_at TEXT NOT NULL DEFAULT (datetime('now')),
      PRIMARY KEY (challenge_id, user_id)
    );

    -- Follow system
    CREATE TABLE IF NOT EXISTS follows (
      follower_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      following_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      PRIMARY KEY (follower_id, following_id)
    );

    -- Activity feed
    CREATE TABLE IF NOT EXISTS activity_feed (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      activity_type TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      metadata TEXT NOT NULL DEFAULT '{}',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Notifications
    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      notification_type TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL DEFAULT '',
      link TEXT,
      is_read INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Head-to-head records
    CREATE TABLE IF NOT EXISTS head_to_head (
      player1_id TEXT NOT NULL REFERENCES users(id),
      player2_id TEXT NOT NULL REFERENCES users(id),
      player1_wins INTEGER NOT NULL DEFAULT 0,
      player2_wins INTEGER NOT NULL DEFAULT 0,
      total_matches INTEGER NOT NULL DEFAULT 0,
      last_match_at TEXT,
      PRIMARY KEY (player1_id, player2_id)
    );

    -- MMR history for rating graph
    CREATE TABLE IF NOT EXISTS mmr_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      mmr INTEGER NOT NULL,
      change INTEGER NOT NULL DEFAULT 0,
      reason TEXT NOT NULL DEFAULT '',
      recorded_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Season pass / progression
    CREATE TABLE IF NOT EXISTS season_pass_levels (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      season_id TEXT NOT NULL REFERENCES seasons(id) ON DELETE CASCADE,
      level_number INTEGER NOT NULL,
      xp_required INTEGER NOT NULL DEFAULT 100,
      reward_type TEXT NOT NULL DEFAULT 'badge',
      reward_value TEXT NOT NULL DEFAULT '',
      reward_name TEXT NOT NULL DEFAULT '',
      reward_icon TEXT NOT NULL DEFAULT '',
      UNIQUE(season_id, level_number)
    );

    CREATE TABLE IF NOT EXISTS user_season_progress (
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      season_id TEXT NOT NULL REFERENCES seasons(id) ON DELETE CASCADE,
      current_level INTEGER NOT NULL DEFAULT 0,
      current_xp INTEGER NOT NULL DEFAULT 0,
      total_xp INTEGER NOT NULL DEFAULT 0,
      division TEXT NOT NULL DEFAULT 'unranked',
      placement_matches_played INTEGER NOT NULL DEFAULT 0,
      placement_matches_won INTEGER NOT NULL DEFAULT 0,
      is_placed INTEGER NOT NULL DEFAULT 0,
      promotion_wins INTEGER NOT NULL DEFAULT 0,
      demotion_losses INTEGER NOT NULL DEFAULT 0,
      PRIMARY KEY (user_id, season_id)
    );

    CREATE INDEX IF NOT EXISTS idx_tournament_players_user ON tournament_players(user_id);
    CREATE INDEX IF NOT EXISTS idx_matches_tournament ON matches(tournament_id);
    CREATE INDEX IF NOT EXISTS idx_matches_round ON matches(round_id);
    CREATE INDEX IF NOT EXISTS idx_submissions_game ON submissions(game_id);
    CREATE INDEX IF NOT EXISTS idx_submissions_user ON submissions(user_id);
    CREATE INDEX IF NOT EXISTS idx_users_mmr ON users(mmr DESC);
    CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
    CREATE INDEX IF NOT EXISTS idx_tournaments_status ON tournaments(status);
    CREATE INDEX IF NOT EXISTS idx_tournaments_type ON tournaments(tournament_type);
    CREATE INDEX IF NOT EXISTS idx_anticheat_reports_status ON anticheat_reports(status);
    CREATE INDEX IF NOT EXISTS idx_season_standings_mmr ON season_standings(season_mmr DESC);
    CREATE INDEX IF NOT EXISTS idx_clan_members_user ON clan_members(user_id);
    CREATE INDEX IF NOT EXISTS idx_daily_map_scores_map ON daily_map_scores(daily_map_id);
    CREATE INDEX IF NOT EXISTS idx_daily_map_scores_user ON daily_map_scores(user_id);
    CREATE INDEX IF NOT EXISTS idx_challenge_completions_user ON challenge_completions(user_id);
    CREATE INDEX IF NOT EXISTS idx_follows_following ON follows(following_id);
    CREATE INDEX IF NOT EXISTS idx_activity_feed_user ON activity_feed(user_id);
    CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
    CREATE INDEX IF NOT EXISTS idx_mmr_history_user ON mmr_history(user_id);
    CREATE INDEX IF NOT EXISTS idx_user_season_progress_season ON user_season_progress(season_id);
  `);

  seedAchievements(db);
  seedSeasonPassLevels(db);
}

function seedAchievements(db: Database.Database) {
  const count = (db.prepare("SELECT COUNT(*) as c FROM achievements").get() as { c: number }).c;
  if (count > 0) return;

  const achievements = [
    { id: "first_blood", name: "First Blood", description: "Win your first tournament match", icon: "⚔️", category: "combat", rarity: "common" },
    { id: "perfect_game", name: "Perfect Game", description: "Submit a play with 100% accuracy", icon: "💎", category: "accuracy", rarity: "legendary" },
    { id: "tournament_winner", name: "Tournament Champion", description: "Win a tournament", icon: "🏆", category: "tournament", rarity: "epic" },
    { id: "ten_wins", name: "Veteran", description: "Win 10 tournament matches", icon: "🎖️", category: "combat", rarity: "uncommon" },
    { id: "fifty_wins", name: "War Machine", description: "Win 50 tournament matches", icon: "🔥", category: "combat", rarity: "rare" },
    { id: "daily_grinder", name: "Daily Grinder", description: "Complete 7 daily challenges in a row", icon: "📅", category: "dedication", rarity: "uncommon" },
    { id: "weekly_warrior", name: "Weekly Warrior", description: "Win a weekly tournament", icon: "📆", category: "tournament", rarity: "rare" },
    { id: "monthly_master", name: "Monthly Master", description: "Win a monthly tournament", icon: "🗓️", category: "tournament", rarity: "epic" },
    { id: "season_champion", name: "Season Champion", description: "Finish #1 in a season", icon: "👑", category: "tournament", rarity: "legendary" },
    { id: "gold_rank", name: "Gold Tier", description: "Reach Gold rank", icon: "🥇", category: "rank", rarity: "common" },
    { id: "diamond_rank", name: "Diamond Tier", description: "Reach Diamond rank", icon: "💠", category: "rank", rarity: "rare" },
    { id: "master_rank", name: "Master Tier", description: "Reach Master rank", icon: "🔮", category: "rank", rarity: "epic" },
    { id: "rhythm_god", name: "Rhythm God", description: "Reach Rhythm God rank", icon: "⭐", category: "rank", rarity: "legendary" },
    { id: "accuracy_95", name: "Sharpshooter", description: "Average 95%+ accuracy across 10 matches", icon: "🎯", category: "accuracy", rarity: "rare" },
    { id: "comeback_kid", name: "Comeback Kid", description: "Win a match after being down in a Bo3/Bo5", icon: "💪", category: "combat", rarity: "rare" },
    { id: "clean_sweep", name: "Clean Sweep", description: "Win a Bo3 match 2-0", icon: "🧹", category: "combat", rarity: "uncommon" },
    { id: "iron_will", name: "Iron Will", description: "Complete 30 tournament matches without forfeiting", icon: "🛡️", category: "dedication", rarity: "rare" },
    { id: "community_hero", name: "Community Hero", description: "Organize 5 tournaments", icon: "🌟", category: "community", rarity: "epic" },
    { id: "clan_founder", name: "Clan Founder", description: "Create a clan", icon: "🏰", category: "community", rarity: "uncommon" },
    { id: "clan_champion", name: "Clan Champion", description: "Win a tournament with your clan", icon: "⚔️", category: "community", rarity: "epic" },
    { id: "daily_streak_30", name: "Unstoppable", description: "30-day daily challenge streak", icon: "🔥", category: "dedication", rarity: "epic" },
    { id: "challenge_master", name: "Challenge Master", description: "Complete 50 challenges", icon: "🎯", category: "accuracy", rarity: "rare" },
    { id: "social_butterfly", name: "Social Butterfly", description: "Gain 100 followers", icon: "🦋", category: "community", rarity: "uncommon" },
    { id: "speed_demon", name: "Speed Demon", description: "Win 10 Speed mode tournaments", icon: "💨", category: "combat", rarity: "rare" },
    { id: "hidden_master", name: "Hidden Master", description: "Win 10 Hidden mode tournaments", icon: "👁️", category: "combat", rarity: "rare" },
    { id: "draft_strategist", name: "Draft Strategist", description: "Win 10 Draft mode tournaments", icon: "♟️", category: "combat", rarity: "rare" },
    { id: "survival_legend", name: "Survival Legend", description: "Win 10 Survival mode tournaments", icon: "💀", category: "combat", rarity: "rare" },
    { id: "season_pass_max", name: "Season Pass Complete", description: "Reach max level in a Season Pass", icon: "⭐", category: "dedication", rarity: "legendary" },
    { id: "division_champion", name: "Division Champion", description: "Reach Champion division in a season", icon: "🏆", category: "rank", rarity: "legendary" },
    { id: "map_of_day_king", name: "Map of the Day King", description: "Get #1 on Map of the Day 10 times", icon: "👑", category: "accuracy", rarity: "epic" },
  ];

  const stmt = db.prepare(
    "INSERT OR IGNORE INTO achievements (id, name, description, icon, category, rarity) VALUES (?, ?, ?, ?, ?, ?)"
  );

  for (const a of achievements) {
    stmt.run(a.id, a.name, a.description, a.icon, a.category, a.rarity);
  }
}

function seedSeasonPassLevels(db: Database.Database) {
  const count = (db.prepare("SELECT COUNT(*) as c FROM season_pass_levels").get() as { c: number }).c;
  if (count > 0) return;

  const divisionThresholds = JSON.stringify({
    Iron: 0,
    Bronze: 800,
    Silver: 1200,
    Gold: 1600,
    Platinum: 2200,
    Diamond: 3000,
    Master: 4000,
    Champion: 5000,
  });

  const existingSeason = db.prepare("SELECT id FROM seasons WHERE id = 'season_1'").get();
  if (!existingSeason) {
    db.prepare(
      `INSERT INTO seasons (id, name, season_number, starts_at, ends_at, status, division_thresholds, pass_levels, theme)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run("season_1", "Season 1: Spring Fire", 1, "2026-01-01", "2026-06-30", "active", divisionThresholds, 50, "fire");
  }

  const milestoneRewards: Record<number, { type: string; value: string; name: string; icon: string }> = {
    1:  { type: "badge", value: "newcomer", name: "Newcomer", icon: "🌱" },
    5:  { type: "mmr", value: "50", name: "50 MMR Bonus", icon: "📈" },
    10: { type: "title", value: "flame_walker", name: "Flame Walker", icon: "🔥" },
    15: { type: "badge", value: "fire_badge", name: "Fire Badge", icon: "🔥" },
    20: { type: "mmr", value: "100", name: "100 MMR Bonus", icon: "📈" },
    25: { type: "title", value: "inferno", name: "Inferno", icon: "🌋" },
    30: { type: "badge", value: "blazing_badge", name: "Blazing Badge", icon: "💥" },
    35: { type: "mmr", value: "150", name: "150 MMR Bonus", icon: "📈" },
    40: { type: "title", value: "phoenix", name: "Phoenix", icon: "🦅" },
    45: { type: "badge", value: "legendary_badge", name: "Legendary Badge", icon: "✨" },
    50: { type: "title", value: "season_champion", name: "Season Champion", icon: "👑" },
  };

  const stmt = db.prepare(
    `INSERT INTO season_pass_levels (season_id, level_number, xp_required, reward_type, reward_value, reward_name, reward_icon)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  );

  for (let level = 1; level <= 50; level++) {
    const xpRequired = 100 + (level - 1) * 50;
    const milestone = milestoneRewards[level];

    if (milestone) {
      stmt.run("season_1", level, xpRequired, milestone.type, milestone.value, milestone.name, milestone.icon);

      if (level === 50) {
        db.prepare(
          `INSERT INTO season_pass_levels (season_id, level_number, xp_required, reward_type, reward_value, reward_name, reward_icon)
           VALUES (?, ?, ?, ?, ?, ?, ?)`
        ).run("season_1", 51, 0, "badge", "supreme_fire", "Supreme Fire", "🔥");
      }
    } else {
      const minorRewards = [
        { type: "xp", value: "25", name: "25 XP Bonus", icon: "⚡" },
        { type: "xp", value: "50", name: "50 XP Bonus", icon: "⚡" },
        { type: "xp", value: "30", name: "30 XP Bonus", icon: "⚡" },
      ];
      const minor = minorRewards[level % minorRewards.length];
      stmt.run("season_1", level, xpRequired, minor.type, minor.value, minor.name, minor.icon);
    }
  }
}

export function getRankForMMR(mmr: number): string {
  if (mmr >= 6000) return "Rhythm God";
  if (mmr >= 5000) return "Master";
  if (mmr >= 4000) return "Diamond";
  if (mmr >= 3000) return "Platinum";
  if (mmr >= 2000) return "Gold";
  if (mmr >= 1000) return "Silver";
  return "Bronze";
}
