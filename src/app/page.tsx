"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Swords,
  Trophy,
  Eye,
  Gamepad2,
  Users,
  Zap,
  ChevronRight,
  Play,
  Target,
  Flame,
  ShieldCheck,
} from "lucide-react";

function HeroOrb() {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div className="relative w-[500px] h-[500px] sm:w-[600px] sm:h-[600px]">
        <div className="absolute inset-0 rounded-full border border-fire/10 animate-spin-slow" />
        <div className="absolute inset-6 rounded-full border border-ice/10 animate-spin-reverse" />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="absolute inset-0 flex items-center justify-center"
            style={{
              animation: `orbit ${8 + i * 2}s linear infinite`,
              animationDelay: `${i * -1.5}s`,
              ["--orbit-radius" as string]: `${120 + i * 30}px`,
            }}
          >
            <div
              className="rounded-full"
              style={{
                width: `${6 - i * 0.5}px`,
                height: `${6 - i * 0.5}px`,
                background: i % 2 === 0 ? "var(--color-fire)" : "var(--color-ice)",
                boxShadow: i % 2 === 0
                  ? "0 0 10px var(--color-fire), 0 0 20px rgba(255,77,28,0.3)"
                  : "0 0 10px var(--color-ice), 0 0 20px rgba(0,200,255,0.3)",
              }}
            />
          </div>
        ))}
        <div className="absolute inset-[35%] rounded-full bg-fire/[0.06] blur-[60px] animate-pulse-fire" />
        <div className="absolute inset-[40%] rounded-full bg-ice/[0.04] blur-[40px] animate-pulse-ice" />
      </div>
    </div>
  );
}

const FEATURES = [
  {
    icon: Swords,
    title: "Auto-Generated Tournaments",
    description: "Daily, weekly, and monthly tournaments auto-created with maps from ADOFAI.NET. 5 difficulty tiers, 5 game modes. Swiss into playoffs.",
    color: "text-fire",
    bg: "bg-fire/10",
    border: "hover:border-fire/20",
  },
  {
    icon: Trophy,
    title: "Season System",
    description: "8 divisions from Iron to Champion. Placement matches, promotion series, demotion protection. Season Pass with 50 levels of rewards.",
    color: "text-gold",
    bg: "bg-gold/10",
    border: "hover:border-gold/20",
  },
  {
    icon: Gamepad2,
    title: "5 Battle Modes",
    description: "Accuracy, Survival, Speed, Hidden, and Draft. Each mode tests a different skill. Tournaments run in all modes simultaneously.",
    color: "text-ice",
    bg: "bg-ice/10",
    border: "hover:border-ice/20",
  },
  {
    icon: Users,
    title: "Clans & Teams",
    description: "Create or join a clan. Compete together, share strategies, and climb the clan leaderboard. Clan wars coming soon.",
    color: "text-platinum",
    bg: "bg-platinum/10",
    border: "hover:border-platinum/20",
  },
  {
    icon: ShieldCheck,
    title: "Anti-Cheat & Video Proof",
    description: "Multi-layered anti-cheat with statistical analysis. Every submission requires video proof. Cross-referenced with ADOFAI.NET records.",
    color: "text-success",
    bg: "bg-success/10",
    border: "hover:border-success/20",
  },
  {
    icon: Flame,
    title: "Daily Challenges & Map of the Day",
    description: "New map every day from ADOFAI.NET. Complete challenges for XP and badges. 30-day streaks earn legendary rewards.",
    color: "text-master",
    bg: "bg-master/10",
    border: "hover:border-master/20",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: "easeOut" as const },
  }),
};

export default function Home() {
  return (
    <div className="relative">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full bg-fire/[0.03] blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full bg-ice/[0.03] blur-[120px]" />
        <div className="absolute inset-0 bg-grid opacity-50" />
      </div>

      {/* ===== HERO ===== */}
      <section className="relative min-h-[100vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,77,28,0.08)_0%,transparent_70%)]" />
          <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-background to-transparent" />
        </div>

        <HeroOrb />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 text-center z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-fire mb-8">
              <Flame className="w-3.5 h-3.5 text-fire animate-pulse-fire" />
              <span className="text-xs font-semibold text-fire tracking-wider uppercase">
                Season 1 — 2026 Spring
              </span>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="text-6xl sm:text-8xl lg:text-9xl font-black tracking-tighter mb-4"
          >
            <span className="block">ADOFAI</span>
            <span className="fire-text animate-text-glow">.NET</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-lg sm:text-xl text-muted max-w-2xl mx-auto mb-4"
          >
            The competitive battle arena for
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.6 }}
            className="mb-10"
          >
            <p className="text-2xl sm:text-3xl font-bold text-foreground">
              A Dance of Fire and Ice
            </p>
            <p className="text-sm text-muted mt-2 max-w-lg mx-auto">
              Same map. Same rules. Upload your play. 8 divisions, 5 modes, auto-generated tournaments. Prove you&apos;re the best.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link
              href="/battle"
              className="group flex items-center gap-3 px-8 py-4 rounded-xl fire-gradient text-white font-bold text-lg hover:opacity-90 transition-all shadow-lg shadow-fire/25 glow-fire"
            >
              <Swords className="w-5 h-5" />
              Enter the Arena
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/spectate"
              className="flex items-center gap-3 px-8 py-4 rounded-xl glass text-foreground font-semibold text-lg hover:bg-surface-lighter transition-all"
            >
              <Eye className="w-5 h-5 text-ice" />
              Watch Live
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section className="relative py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <span className="text-[10px] font-semibold text-fire uppercase tracking-[0.2em] mb-3 block">
                Why ADOFAI.NET
              </span>
              <h2 className="text-3xl sm:text-5xl font-black mb-4">
                Built for <span className="fire-text">Competition</span>
              </h2>
              <p className="text-muted text-lg max-w-xl mx-auto">
                Everything you need for competitive rhythm gaming. No compromises.
              </p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((feature, i) => (
              <motion.div
                key={feature.title}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                variants={fadeUp}
                className={`group relative rounded-2xl border border-border bg-surface-light p-6 ${feature.border} transition-all duration-300 overflow-hidden`}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-transparent group-hover:from-surface-lighter/50 group-hover:to-transparent transition-all duration-500" />
                <div className="relative">
                  <div className={`w-12 h-12 rounded-xl ${feature.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className={`w-6 h-6 ${feature.color}`} />
                  </div>
                  <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted leading-relaxed">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== SEASON PREVIEW ===== */}
      <section className="relative py-24 border-t border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <span className="text-[10px] font-semibold text-gold uppercase tracking-[0.2em] mb-3 block">
                Competitive Progression
              </span>
              <h2 className="text-3xl sm:text-5xl font-black mb-4">
                Season <span className="gold-text">System</span>
              </h2>
              <p className="text-muted text-lg max-w-xl mx-auto">
                8 divisions. Placement matches. Promotion series. Season Pass with 50 levels.
              </p>
            </motion.div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
            {[
              { name: "Iron", icon: "🪨", color: "#71717a" },
              { name: "Bronze", icon: "🥉", color: "#cd7f32" },
              { name: "Silver", icon: "🥈", color: "#c0c0c0" },
              { name: "Gold", icon: "🥇", color: "#ffd700" },
              { name: "Platinum", icon: "💠", color: "#4dd0e1" },
              { name: "Diamond", icon: "💎", color: "#b388ff" },
              { name: "Master", icon: "🔮", color: "#ff4081" },
              { name: "Champion", icon: "👑", color: "#ffd700" },
            ].map((div, i) => (
              <motion.div
                key={div.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-surface-light border border-border group hover:border-border-light transition-all"
              >
                <span className="text-xl group-hover:scale-125 transition-transform">{div.icon}</span>
                <span className="text-sm font-bold" style={{ color: div.color }}>{div.name}</span>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { title: "Placement Matches", desc: "Play 5 matches to receive your initial division. Your accuracy and W/L ratio determine starting rank.", icon: Target },
              { title: "Promotion Series", desc: "Win 3 consecutive matches at your ceiling to trigger a promotion series. Win 2/3 to advance.", icon: Zap },
              { title: "Season Pass", desc: "50 levels of rewards. Earn XP from wins, daily challenges, and tournaments. Unlock badges, titles, and MMR bonuses.", icon: Trophy },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="rounded-2xl border border-border bg-surface-light p-6 hover:border-gold/20 transition-all"
              >
                <item.icon className="w-8 h-8 text-gold mb-4" />
                <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                <p className="text-sm text-muted leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link
              href="/season"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl glass-fire text-fire font-semibold hover:bg-fire/10 transition-colors"
            >
              <Trophy className="w-4 h-4" />
              View Season Details
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="relative py-24 border-t border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <h2 className="text-3xl sm:text-4xl font-black mb-4">
                How <span className="ice-text">Tournaments</span> Work
              </h2>
              <p className="text-muted">Swiss stage into playoffs. Upload your best play.</p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { step: "01", title: "Join Tournament", desc: "Register for a tournament. Swiss stage to qualify, then elimination bracket playoffs.", icon: Swords },
              { step: "02", title: "Play Your Map", desc: "Each round assigns you a match and map. Play on your own time within the deadline.", icon: Zap },
              { step: "03", title: "Upload Video", desc: "Record your play, upload the video with your accuracy, combo, and score. Proof is required.", icon: Target },
              { step: "04", title: "Results & MMR", desc: "Higher accuracy wins. MMR adjusted. Advance through Swiss into the playoff bracket.", icon: Trophy },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative text-center"
              >
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-surface-light border border-border mb-4">
                  <item.icon className="w-6 h-6 text-fire" />
                </div>
                <div className="text-[10px] text-fire font-bold uppercase tracking-widest mb-2">{item.step}</div>
                <h3 className="font-bold text-base mb-2">{item.title}</h3>
                <p className="text-xs text-muted leading-relaxed">{item.desc}</p>
                {i < 3 && (
                  <div className="hidden md:block absolute top-7 -right-3 w-6">
                    <ChevronRight className="w-4 h-4 text-muted/30" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== RANK TIERS ===== */}
      <section className="relative py-24 border-t border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <h2 className="text-3xl sm:text-4xl font-black mb-4">
                Climb the <span className="gold-text">Ladder</span>
              </h2>
              <p className="text-muted">7 tiers. Prove your skill. Reach Rhythm God.</p>
            </motion.div>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            {[
              { name: "Bronze", color: "#cd7f32", mmr: "0+" },
              { name: "Silver", color: "#c0c0c0", mmr: "1000+" },
              { name: "Gold", color: "#ffd700", mmr: "2000+" },
              { name: "Platinum", color: "#4dd0e1", mmr: "3000+" },
              { name: "Diamond", color: "#b388ff", mmr: "4000+" },
              { name: "Master", color: "#ff4081", mmr: "5000+" },
              { name: "Rhythm God", color: "#ffd700", mmr: "6000+" },
            ].map((rank, i) => (
              <motion.div
                key={rank.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-surface-light border border-border hover:border-border-light transition-all group"
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black group-hover:scale-110 transition-transform"
                  style={{
                    background: rank.color,
                    color: rank.name === "Silver" || rank.name === "Gold" ? "#111" : "#fff",
                    boxShadow: `0 0 15px ${rank.color}33`,
                  }}
                >
                  {rank.name === "Rhythm God" ? "★" : rank.name[0]}
                </div>
                <div>
                  <div className="text-sm font-bold" style={{ color: rank.color }}>{rank.name}</div>
                  <div className="text-[10px] text-muted">{rank.mmr} MMR</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== VERIFIED CLEAR CALLOUT ===== */}
      <section className="relative py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl border border-success/20 bg-gradient-to-r from-success/[0.05] to-surface-light p-8 sm:p-10 flex flex-col sm:flex-row items-center gap-6"
          >
            <div className="w-16 h-16 rounded-2xl bg-success/10 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-8 h-8 text-success" />
            </div>
            <div className="text-center sm:text-left flex-1">
              <h3 className="text-xl font-black mb-2">Verified Results</h3>
              <p className="text-muted text-sm max-w-xl">
                Every submission on ADOFAI.NET requires video proof. Organizers review plays,
                results are verified. Your tournament wins carry real weight. No cheating. No doubt.
              </p>
            </div>
            <div className="flex flex-col items-center gap-1 px-6 py-4 rounded-xl bg-surface border border-border flex-shrink-0">
              <span className="text-[10px] text-success uppercase tracking-wider font-semibold">Certified</span>
              <div className="flex items-center gap-1 text-xs text-success"><ShieldCheck className="w-3.5 h-3.5" /> Video Submitted</div>
              <div className="flex items-center gap-1 text-xs text-success"><ShieldCheck className="w-3.5 h-3.5" /> Organizer Reviewed</div>
              <div className="flex items-center gap-1 text-xs text-success"><ShieldCheck className="w-3.5 h-3.5" /> Result Verified</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="relative py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="relative rounded-3xl border border-fire/20 bg-gradient-to-b from-fire-glow to-surface-light p-12 sm:p-16 overflow-hidden noise-overlay">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,77,28,0.12),transparent_60%)]" />
            <div className="absolute inset-0 bg-grid-fire opacity-30" />
            <div className="relative z-10">
              <Zap className="w-12 h-12 text-fire mx-auto mb-6" />
              <h2 className="text-3xl sm:text-5xl font-black mb-4">Ready to Compete?</h2>
              <p className="text-muted text-lg mb-8 max-w-lg mx-auto">
                The most competitive ADOFAI platform ever built. Prove your accuracy. Claim your rank.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
                <Link
                  href="/battle"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl fire-gradient text-white font-bold text-lg hover:opacity-90 transition-opacity shadow-lg shadow-fire/25 glow-fire"
                >
                  <Play className="w-5 h-5" /> Enter Tournaments
                </Link>
                <Link
                  href="/season"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl border border-border bg-surface text-foreground font-semibold text-lg hover:bg-surface-light transition-colors"
                >
                  <Trophy className="w-5 h-5 text-gold" /> View Season
                </Link>
              </div>
              <div className="flex flex-wrap gap-3 justify-center text-sm">
                <Link href="/daily" className="px-4 py-2 rounded-lg glass text-muted hover:text-foreground transition-colors">Map of the Day</Link>
                <Link href="/clans" className="px-4 py-2 rounded-lg glass text-muted hover:text-foreground transition-colors">Join a Clan</Link>
                <Link href="/challenges" className="px-4 py-2 rounded-lg glass text-muted hover:text-foreground transition-colors">Challenges</Link>
                <Link href="/rankings" className="px-4 py-2 rounded-lg glass text-muted hover:text-foreground transition-colors">Rankings</Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
