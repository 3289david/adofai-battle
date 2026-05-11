# ADOFAI.NET — Competitive Tournament Arena

The competitive tournament platform for **A Dance of Fire and Ice**. Auto-generated tournaments, season system, video-verified competition, and ADOFAI.NET integration.

> **battle.adofai.net** — Same map. Same rules. Upload your play. Prove you're the best.

## Features

### Tournament System
- **Auto-Generated Tournaments** — Daily, weekly, and monthly tournaments created automatically with maps pulled from the ADOFAI.NET API
- **5 Difficulty Tiers** — Beginner (Lv.1-5), Intermediate (Lv.5-10), Advanced (Lv.10-15), Expert (Lv.15-18), Master (Lv.18-21)
- **5 Game Modes** — Accuracy, Survival, Speed, Hidden, and Draft
- **Valorant-Style Format** — Swiss stage qualifying rounds into single/double elimination playoff brackets
- **Map Pick/Ban** — Valorant-style veto system for tournament maps
- **Best-of-X Matches** — Bo1 for daily, Bo3 for playoffs, Bo5 for season finals
- **Admin-Only Creation** — Tournaments are system-managed; admins can create special events

### Season System
- **8 Divisions** — Iron → Bronze → Silver → Gold → Platinum → Diamond → Master → Champion
- **Placement Matches** — Play 5 matches to get placed in your initial division
- **Promotion Series** — Win 3 consecutive matches at your ceiling to trigger a promotion series (win 2/3 to advance)
- **Demotion Protection** — First demotion warning forgiven with a shield; after shield used, losing at floor = instant demotion
- **Season Pass** — 50 levels of rewards (badges, titles, MMR bonuses) earned through XP
- **Progressive Difficulty** — Season tournament maps increase in difficulty each round
- **End-of-Season Rewards** — Rewards based on final division at season close

### Anti-Cheat
- **Statistical Analysis** — Detects impossible scores, accuracy/combo mismatches, sudden improvement spikes
- **Cross-Reference** — Validates submitted accuracy against player's ADOFAI.NET profile history
- **Community Reports** — Players can report suspicious submissions
- **Moderator Queue** — Reports reviewed by moderators with approve/reject/ban actions
- **Video Proof Required** — Every submission requires video evidence of gameplay

### Scoring System
- Accuracy weight: 60%
- Combo weight: 20%
- Miss penalty: -5% per miss
- Speed bonus: +10% at 1.5x speed
- No-miss bonus: +15%
- Full-combo bonus: +25%

### Social Features
- **Clans** — Create or join a clan, compete together, climb the clan leaderboard
- **Follow System** — Follow players, see their activity in your feed
- **Activity Feed** — Real-time feed of tournament results, achievements, and social events
- **Notifications** — Tournament start alerts, match results, follower notifications
- **Head-to-Head Records** — Track your record against specific opponents

### Daily Features
- **Map of the Day** — Random map from ADOFAI.NET refreshed daily with a global leaderboard
- **Challenges** — Skill challenges with specific targets (hit 95% accuracy, full combo, etc.) for XP and badges
- **Daily Streak** — Consecutive daily challenge completion tracked with milestone rewards

### Achievements & Badges
- 30+ achievements across 7 categories: Combat, Accuracy, Tournament, Rank, Dedication, Community, General
- Rarity tiers: Common, Uncommon, Rare, Epic, Legendary
- Displayed on player profiles

### Rankings
- **Global MMR Leaderboard** — Sort by MMR, accuracy, wins, or total matches
- **Season Leaderboard** — Ranked by division and XP within each season
- **Clan Leaderboard** — Clans ranked by aggregate MMR
- **7 Rank Tiers** — Bronze (0+) → Silver (1000+) → Gold (2000+) → Platinum (3000+) → Diamond (4000+) → Master (5000+) → Rhythm God (6000+)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Database | SQLite (better-sqlite3, WAL mode) |
| Styling | Tailwind CSS 4 |
| Animations | Framer Motion |
| Icons | Lucide React |
| Auth | ADOFAI.NET OAuth (JWT) |
| Maps API | ADOFAI.NET REST API |

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
npm start
```

Open [http://localhost:3000](http://localhost:3000).

### Authentication

Users authenticate through ADOFAI.NET. No local signup — all accounts are verified ADOFAI.NET accounts.

```
POST /api/auth/login  →  Proxies to adofai.net/api/auth/login
GET  /api/auth/me     →  Returns current session user
POST /api/auth/logout →  Clears session
```

## Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page — hero, features, season preview, rank tiers |
| `/battle` | Tournament arena — browse auto-generated tournaments by tier/mode/type |
| `/season` | Season overview — divisions, season pass, placement progress, leaderboard |
| `/daily` | Map of the Day — today's map, submit score, daily leaderboard |
| `/challenges` | Active challenges — skill challenges with rewards |
| `/rankings` | Global rankings — MMR, accuracy, wins leaderboards |
| `/clans` | Clan listing — browse, create, join clans |
| `/clans/[id]` | Clan detail — members, stats, join |
| `/spectate` | Watch active tournaments in Swiss/Playoff stages |
| `/modes` | Game modes — 5 core modes + special events explained |
| `/profile` | Player profile — stats, match history, badges, rank |
| `/login` | ADOFAI.NET login |
| `/activity` | Activity feed — recent events from followed players |
| `/tournaments/[id]` | Tournament detail — rounds, matches, bracket |
| `/tournaments/[id]/match/[matchId]` | Match detail — submit plays, view results |

## API Routes

### Auth
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/login` | Login via ADOFAI.NET |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/auth/me` | Current user |
| POST | `/api/auth/signup` | Rejected — directs to adofai.net |

### Tournaments
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/tournaments` | List tournaments (filter by tier/mode/type/status) |
| POST | `/api/tournaments` | Create tournament (admin only) |
| GET | `/api/tournaments/[id]` | Tournament details |
| POST | `/api/tournaments/[id]/register` | Register for tournament |
| GET | `/api/tournaments/[id]/brackets` | Bracket data |
| POST | `/api/tournaments/[id]/matches/[matchId]/submit` | Submit play |

### Season
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/seasons` | Active season + pass levels + user progress |
| GET | `/api/seasons/leaderboard` | Season leaderboard |

### Social
| Method | Route | Description |
|--------|-------|-------------|
| GET/POST | `/api/clans` | List / create clans |
| GET | `/api/clans/[id]` | Clan details + members |
| POST | `/api/clans/[id]/join` | Join clan |
| POST | `/api/users/[id]/follow` | Follow/unfollow toggle |
| GET | `/api/activity` | Activity feed |
| GET/POST | `/api/notifications` | Notifications (list / mark read) |

### Daily & Challenges
| Method | Route | Description |
|--------|-------|-------------|
| GET/POST | `/api/daily` | Map of the Day + leaderboard / submit score |
| GET/POST | `/api/challenges` | Active challenges / create (admin) |
| POST | `/api/challenges/[id]/complete` | Complete a challenge |

### Admin
| Method | Route | Description |
|--------|-------|-------------|
| GET/POST | `/api/admin/tournaments/scheduled` | View/trigger auto-tournament generation |
| GET | `/api/admin/reports` | Anti-cheat report queue |
| POST | `/api/admin/reports/[id]` | Review report (approve/reject/ban) |
| GET | `/api/admin/modlog` | Moderation log |

### Other
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/rankings` | Global leaderboard |
| GET | `/api/players/[id]` | Player profile + stats |
| POST | `/api/uploads` | Video file upload (500MB max) |
| POST | `/api/submissions/[id]/report` | Report suspicious submission |

## Database Schema

### Core Tables
- `users` — Player accounts linked to ADOFAI.NET (MMR, rank, badges, clan, XP, level)
- `sessions` — JWT-backed sessions
- `tournaments` — Auto-generated and admin tournaments
- `tournament_players` — Registrations with Swiss W/L tracking
- `tournament_rounds` — Swiss and playoff round tracking
- `matches` — Individual matches within rounds
- `match_games` — Games within Bo3/Bo5 matches
- `match_map_veto` — Map pick/ban records
- `submissions` — Video submissions with anti-cheat data

### Season Tables
- `seasons` — Season definitions with division thresholds
- `season_standings` — Player standings per season
- `season_pass_levels` — Season pass rewards (50 levels)
- `user_season_progress` — Player's season progress (division, XP, placement)

### Social Tables
- `clans` — Clans/teams with MMR and member caps
- `clan_members` — Clan membership with roles
- `follows` — Follow relationships
- `activity_feed` — Player activity events
- `notifications` — User notifications
- `head_to_head` — Player vs player records
- `mmr_history` — MMR change log for graphs

### Content Tables
- `daily_maps` — Map of the Day
- `daily_map_scores` — Daily map scores
- `challenges` — Skill challenges
- `challenge_completions` — Challenge completion records
- `achievements` — Achievement definitions (30+)
- `user_achievements` — Earned achievements

### Moderation Tables
- `anticheat_reports` — Auto and player reports
- `moderation_log` — Moderator action log

## Tournament Types

| Type | Players | Swiss | Playoffs | Maps | Deadline |
|------|---------|-------|----------|------|----------|
| Daily | Unlimited | 1 round | None (FFA) | 1 | 24h |
| Weekly | 64 | 3 rounds | Bo3 Single Elim | 5 | 48h |
| Monthly | 128 | 5 rounds | Bo3 Single Elim | 7 | 72h |
| Season | 256 | 6 rounds | Bo5 Double Elim | 12 | 72h |
| Annual | 32 (invite) | 4 rounds | Bo5 Double Elim | 15 | 96h |

## Division Tiers

| Division | MMR Range | Promotion | Demotion |
|----------|-----------|-----------|----------|
| Iron | 0-799 | Win 3 → series | — |
| Bronze | 800-1199 | Win 3 → series | Lose 3 → shield → drop |
| Silver | 1200-1599 | Win 3 → series | Lose 3 → shield → drop |
| Gold | 1600-1999 | Win 3 → series | Lose 3 → shield → drop |
| Platinum | 2000-2499 | Win 3 → series | Lose 3 → shield → drop |
| Diamond | 2500-2999 | Win 3 → series | Lose 3 → shield → drop |
| Master | 3000-3999 | Win 3 → series | Lose 3 → shield → drop |
| Champion | 4000+ | — | Lose 3 → shield → drop |

## License

Private. ADOFAI.NET branding.
