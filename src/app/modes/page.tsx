"use client";

import { motion } from "framer-motion";
import {
  Target,
  Skull,
  Zap,
  Eye,
  Swords,
  ChevronRight,
  Users,
  Clock,
  Flame,
  Ghost,
  CalendarDays,
  Crown,
  MonitorPlay,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { BATTLE_MODES } from "@/lib/mock-data";

const MODE_ICONS: Record<string, React.ElementType> = {
  accuracy: Target,
  survival: Skull,
  speed: Zap,
  hidden: Eye,
  draft: Swords,
};

const SPECIAL_MODES = [
  {
    name: "Knockout Tournament",
    description: "Single elimination bracket. 16 players, one champion. Lose and you're out.",
    icon: Crown,
    gradient: "from-gold to-warning",
    players: "16 players",
    duration: "~45 min",
  },
  {
    name: "Daily Challenge",
    description: "New random map every day. One attempt. Global leaderboard resets at midnight.",
    icon: CalendarDays,
    gradient: "from-success to-ice",
    players: "Unlimited",
    duration: "1 attempt/day",
  },
  {
    name: "Boss Raid",
    description: "4 players tackle an impossibly hard map together. Collective accuracy matters.",
    icon: Flame,
    gradient: "from-danger to-fire",
    players: "4 co-op",
    duration: "~20 min",
  },
  {
    name: "Ghost Race",
    description: "Race against the world record holder's ghost. Can you beat the best?",
    icon: Ghost,
    gradient: "from-master to-diamond",
    players: "Solo",
    duration: "Per map",
  },
];

export default function ModesPage() {
  return (
    <div className="relative min-h-screen">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-1/3 w-[500px] h-[500px] rounded-full bg-ice/[0.02] blur-[100px]" />
        <div className="absolute inset-0 bg-grid opacity-30" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-12">
          <h1 className="text-3xl sm:text-4xl font-black mb-2">
            Battle <span className="ice-text">Modes</span>
          </h1>
          <p className="text-muted text-lg">Five core modes. Each tests a different aspect of your rhythm skill.</p>
        </div>

        {/* Core Modes */}
        <div className="space-y-4 mb-16">
          {BATTLE_MODES.map((mode, i) => {
            const Icon = MODE_ICONS[mode.id] || Target;
            return (
              <motion.div
                key={mode.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="group relative rounded-2xl border border-border bg-surface-light overflow-hidden hover:border-border-light transition-all duration-300"
              >
                <div className="flex flex-col md:flex-row">
                  <div className={cn("w-full md:w-48 p-6 flex flex-col items-center justify-center bg-gradient-to-br relative overflow-hidden", mode.gradient)}>
                    <div className="absolute inset-0 bg-black/10" />
                    <div className="relative">
                      <div className="text-5xl mb-2">{mode.icon}</div>
                      <Icon className="w-6 h-6 text-white/80" />
                    </div>
                  </div>
                  <div className="flex-1 p-6">
                    <h2 className="text-2xl font-black mb-2">{mode.name}</h2>
                    <p className="text-muted mb-4">{mode.description}</p>
                    <div className="grid grid-cols-2 gap-2 mb-5">
                      {mode.details.map((detail, j) => (
                        <div key={j} className="flex items-center gap-2 text-sm">
                          <div className="w-1.5 h-1.5 rounded-full bg-fire flex-shrink-0" />
                          <span className="text-muted">{detail}</span>
                        </div>
                      ))}
                    </div>
                    <Link href="/battle" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg fire-gradient text-white text-sm font-semibold hover:opacity-90 transition-opacity">
                      <Swords className="w-4 h-4" />
                      Find {mode.name} Match
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Special Events */}
        <div className="mb-8">
          <h2 className="text-2xl font-black mb-2">Special <span className="fire-text">Events</span></h2>
          <p className="text-muted">Limited-time and community events for extra competition.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-16">
          {SPECIAL_MODES.map((mode, i) => (
            <motion.div
              key={mode.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.08 }}
              className="group rounded-2xl border border-border bg-surface-light p-6 hover:border-border-light transition-all overflow-hidden relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-transparent to-transparent group-hover:from-surface-lighter/30 transition-all duration-500" />
              <div className="relative">
                <div className={cn("w-14 h-14 rounded-xl bg-gradient-to-br flex items-center justify-center mb-4 group-hover:scale-110 transition-transform", mode.gradient)}>
                  <mode.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg font-bold mb-2">{mode.name}</h3>
                <p className="text-sm text-muted mb-4">{mode.description}</p>
                <div className="flex items-center gap-4 text-xs text-muted">
                  <div className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{mode.players}</div>
                  <div className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{mode.duration}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Anti-Cheat */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="rounded-2xl border border-success/20 bg-gradient-to-r from-success/[0.04] to-surface-light p-8 mb-8"
        >
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-success/10 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-8 h-8 text-success" />
            </div>
            <div className="text-center sm:text-left flex-1">
              <h3 className="text-xl font-black mb-2">Server-Side Anti-Cheat</h3>
              <p className="text-muted text-sm max-w-xl">
                Every battle mode is protected by server-side input validation. Your client sends inputs,
                the server validates them. Impossible inputs are rejected. Every clear is verified.
              </p>
            </div>
            <div className="flex flex-col gap-1 text-xs text-success">
              <div className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5" /> Input Timing Validated</div>
              <div className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5" /> Replay Verification</div>
              <div className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5" /> Client Integrity Check</div>
            </div>
          </div>
        </motion.div>

        {/* OBS Overlay */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="rounded-2xl border border-ice/20 bg-gradient-to-r from-ice-glow to-surface-light p-8 text-center overflow-hidden relative noise-overlay"
        >
          <div className="absolute inset-0 bg-grid opacity-20" />
          <div className="relative z-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-ice/10 mb-4">
              <MonitorPlay className="w-8 h-8 text-ice" />
            </div>
            <h3 className="text-2xl font-black mb-2">Battle Overlay for Streamers</h3>
            <p className="text-muted max-w-xl mx-auto mb-6">
              Use our OBS-compatible overlay to show live match data on your stream. Real-time scores,
              accuracy, and player rankings — automatically synced.
            </p>
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-surface border border-border text-sm font-mono text-muted">
              <code>battle.adofai.net/overlay/STREAM_KEY</code>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
