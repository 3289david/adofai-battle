"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Activity,
  Trophy,
  Swords,
  Users,
  Star,
  Loader2,
  CalendarDays,
  Target,
  Bell,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";

interface ActivityItem {
  id: string;
  user_id: string;
  username: string;
  activity_type: string;
  title: string;
  description: string;
  metadata: string;
  created_at: string;
}

const ACTIVITY_ICONS: Record<string, { icon: React.ElementType; color: string }> = {
  tournament_win:     { icon: Trophy,      color: "text-amber-400" },
  tournament_join:    { icon: Swords,      color: "text-blue-400" },
  achievement:        { icon: Star,        color: "text-purple-400" },
  clan_join:          { icon: Users,       color: "text-emerald-400" },
  daily_challenge:    { icon: CalendarDays, color: "text-cyan-400" },
  challenge_complete: { icon: Target,      color: "text-rose-400" },
  follow:             { icon: Bell,        color: "text-violet-400" },
};

const FILTER_TABS = [
  { id: "all", label: "All" },
  { id: "tournament", label: "Tournaments" },
  { id: "achievement", label: "Achievements" },
  { id: "social", label: "Social" },
];

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export default function ActivityPage() {
  const { user } = useAuth();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const fetchActivities = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/activity");
      const data = await res.json();
      setActivities(data.activities || []);
    } catch {
      setActivities([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  const filtered = filter === "all"
    ? activities
    : activities.filter((a) => {
        if (filter === "tournament") return a.activity_type.startsWith("tournament");
        if (filter === "achievement") return a.activity_type === "achievement";
        if (filter === "social") return ["follow", "clan_join"].includes(a.activity_type);
        return true;
      });

  return (
    <div className="relative min-h-screen">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-1/3 w-[500px] h-[500px] rounded-full bg-violet-500/[0.02] blur-[100px]" />
        <div className="absolute inset-0 bg-grid opacity-30" />
      </div>

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-black mb-2">
            Activity <span className="fire-text">Feed</span>
          </h1>
          <p className="text-muted text-sm">
            {user ? "Recent events from players you follow and your own activity." : "Sign in to see personalized activity from players you follow."}
          </p>
        </div>

        <div className="flex items-center gap-2 mb-6">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={cn(
                "px-4 py-2 rounded-lg text-xs font-medium transition-all",
                filter === tab.id
                  ? "fire-gradient text-white"
                  : "bg-surface-light text-muted hover:text-foreground border border-border"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-24">
            <Loader2 className="w-8 h-8 animate-spin text-fire mx-auto mb-4" />
            <p className="text-muted text-sm">Loading activity...</p>
          </div>
        ) : filtered.length > 0 ? (
          <div className="space-y-3">
            {filtered.map((a) => {
              const info = ACTIVITY_ICONS[a.activity_type] || { icon: Activity, color: "text-muted" };
              const Icon = info.icon;
              return (
                <div
                  key={a.id}
                  className="flex items-start gap-4 rounded-xl border border-border bg-surface-light p-4 hover:border-border-light transition-all"
                >
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0", `bg-current/10`)}>
                    <Icon className={cn("w-5 h-5", info.color)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Link
                        href={`/profile?id=${a.user_id}`}
                        className="text-sm font-bold hover:text-fire transition-colors"
                      >
                        {a.username}
                      </Link>
                      <span className="text-xs text-muted">{timeAgo(a.created_at)}</span>
                    </div>
                    <p className="text-sm font-medium">{a.title}</p>
                    {a.description && (
                      <p className="text-xs text-muted mt-0.5">{a.description}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-24">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-surface-light border border-border mb-6">
              <Activity className="w-10 h-10 text-muted" />
            </div>
            <h3 className="text-xl font-bold mb-2">No activity yet</h3>
            <p className="text-sm text-muted max-w-sm mx-auto">
              {user ? "Follow other players to see their activity here, or play some tournaments!" : "Sign in to see personalized activity."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
