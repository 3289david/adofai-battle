"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Shield,
  Users,
  Loader2,
  TrendingUp,
  Crown,
  Star,
  UserPlus,
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";

interface ClanMember {
  id: string;
  username: string;
  role: "owner" | "officer" | "member";
  mmr: number;
  rank: string;
  joined_at: string;
}

interface ClanDetail {
  id: string;
  name: string;
  tag: string;
  description: string;
  member_count: number;
  mmr: number;
  recruiting: boolean;
  created_at: string;
  members: ClanMember[];
}

const ROLE_STYLES: Record<string, { label: string; color: string; icon: typeof Crown }> = {
  owner: { label: "Owner", color: "text-amber-400", icon: Crown },
  officer: { label: "Officer", color: "text-blue-400", icon: Star },
  member: { label: "Member", color: "text-muted", icon: Users },
};

export default function ClanDetailPage() {
  const params = useParams();
  const { user } = useAuth();
  const [clan, setClan] = useState<ClanDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    if (!params.id) return;
    (async () => {
      try {
        const res = await fetch(`/api/clans/${params.id}`);
        if (res.ok) setClan(await res.json());
      } catch {
        /* ignore */
      } finally {
        setLoading(false);
      }
    })();
  }, [params.id]);

  const handleJoin = async () => {
    if (!clan) return;
    setJoining(true);
    try {
      const res = await fetch(`/api/clans/${clan.id}/join`, { method: "POST" });
      if (res.ok) {
        const updated = await fetch(`/api/clans/${clan.id}`);
        if (updated.ok) setClan(await updated.json());
      }
    } catch {
      /* ignore */
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <div className="relative min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-fire" />
      </div>
    );
  }

  if (!clan) {
    return (
      <div className="relative min-h-screen flex flex-col items-center justify-center gap-4">
        <Shield className="w-12 h-12 text-muted" />
        <h2 className="text-xl font-bold">Clan not found</h2>
        <Link href="/clans" className="text-sm text-fire hover:underline">
          ← Back to Clans
        </Link>
      </div>
    );
  }

  const isMember = clan.members.some((m) => m.id === user?.id);
  const canJoin = clan.recruiting && user && !isMember;

  return (
    <div className="relative min-h-screen">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-1/3 w-[500px] h-[500px] rounded-full bg-ice/[0.03] blur-[100px]" />
        <div className="absolute inset-0 bg-grid opacity-30" />
      </div>

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <Link href="/clans" className="inline-flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to Clans
        </Link>

        {/* Clan Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-border bg-surface-light p-6 mb-6"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-ice/10 border border-ice/20 flex items-center justify-center">
                <Shield className="w-7 h-7 text-ice" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-black">{clan.name}</h1>
                  <span className="text-sm font-mono text-muted">[{clan.tag}]</span>
                </div>
                {clan.description && (
                  <p className="text-sm text-muted mt-1">{clan.description}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="text-lg font-bold">{clan.mmr}</p>
                <p className="text-[10px] text-muted uppercase tracking-wider">MMR</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold">{clan.member_count}</p>
                <p className="text-[10px] text-muted uppercase tracking-wider">Members</p>
              </div>
              {clan.recruiting && (
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-bold text-emerald-400">
                  RECRUITING
                </span>
              )}
            </div>
          </div>
          {canJoin && (
            <button
              onClick={handleJoin}
              disabled={joining}
              className="mt-4 flex items-center gap-2 px-5 py-2.5 rounded-lg fire-gradient text-white font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {joining ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
              {joining ? "Joining..." : "Join Clan"}
            </button>
          )}
        </motion.div>

        {/* Members */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-ice" />
            Members ({clan.members.length})
          </h2>
          <div className="rounded-2xl border border-border bg-surface-light overflow-hidden">
            <div className="hidden sm:grid grid-cols-[3rem_1fr_6rem_5rem_5rem] gap-2 px-5 py-3 border-b border-border text-[10px] font-semibold uppercase tracking-widest text-muted">
              <span>#</span>
              <span>Player</span>
              <span>Role</span>
              <span className="text-right">MMR</span>
              <span className="text-right">Rank</span>
            </div>
            <div className="divide-y divide-border">
              {clan.members.map((member, i) => {
                const role = ROLE_STYLES[member.role] || ROLE_STYLES.member;
                const RoleIcon = role.icon;
                return (
                  <div
                    key={member.id}
                    className={cn(
                      "grid grid-cols-1 sm:grid-cols-[3rem_1fr_6rem_5rem_5rem] gap-2 px-5 py-3.5 items-center",
                      member.id === user?.id && "bg-ice/5"
                    )}
                  >
                    <span className="font-mono font-bold text-sm">{i + 1}</span>
                    <span className="font-semibold text-sm">{member.username}</span>
                    <span className={cn("flex items-center gap-1.5 text-xs font-semibold", role.color)}>
                      <RoleIcon className="w-3.5 h-3.5" />
                      {role.label}
                    </span>
                    <span className="text-right font-mono text-sm">{member.mmr}</span>
                    <span className="text-right text-xs text-muted">{member.rank}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
