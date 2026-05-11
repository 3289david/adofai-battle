"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Eye,
  Users,
  Swords,
  Loader2,
  Flame,
  Trophy,
  Film,
  Clock,
} from "lucide-react";

interface Tournament {
  id: string;
  name: string;
  status: string;
  player_count: number;
  max_players: number;
  created_by_name: string;
  maps: string;
  swiss_rounds: number;
}

export default function SpectatePage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [swissRes, playoffsRes] = await Promise.all([
        fetch("/api/tournaments?status=swiss"),
        fetch("/api/tournaments?status=playoffs"),
      ]);
      const swiss = await swissRes.json();
      const playoffs = await playoffsRes.json();
      setTournaments([...(playoffs.tournaments || []), ...(swiss.tournaments || [])]);
    } catch {
      setTournaments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [fetchData]);

  return (
    <div className="relative min-h-screen">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute bottom-0 left-1/3 w-[600px] h-[400px] rounded-full bg-ice/[0.02] blur-[120px]" />
        <div className="absolute inset-0 bg-grid opacity-30" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black mb-2">
              Spectate <span className="text-ice">Tournaments</span>
            </h1>
            <p className="text-muted">
              Watch ongoing tournament matches and review submitted plays.
            </p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl glass-ice">
            <Trophy className="w-4 h-4 text-ice" />
            <span className="text-sm font-semibold">{tournaments.length} Active</span>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-24">
            <Loader2 className="w-8 h-8 animate-spin text-ice mx-auto mb-4" />
            <p className="text-sm text-muted">Loading tournaments...</p>
          </div>
        ) : tournaments.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {tournaments.map((t) => {
              const maps: string[] = JSON.parse(t.maps || "[]");
              return (
                <Link key={t.id} href={`/tournaments/${t.id}`}>
                  <div className="group rounded-2xl border border-border bg-surface/80 backdrop-blur-sm overflow-hidden hover:border-ice/30 transition-all">
                    <div className="h-28 bg-gradient-to-br from-ice/10 to-fire/10 relative flex items-center justify-center">
                      <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2 py-1 rounded-md bg-fire/90 text-white text-[10px] font-bold">
                        <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                        {t.status === "playoffs" ? "PLAYOFFS" : "SWISS"}
                      </div>
                      <Trophy className="w-10 h-10 text-muted/30" />
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-sm mb-1 truncate">{t.name}</h3>
                      <div className="flex flex-wrap gap-2 text-xs text-muted mb-2">
                        <span className="flex items-center gap-1"><Users className="w-3 h-3" />{t.player_count}</span>
                        {maps.length > 0 && <span>{maps.length} maps</span>}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted">{t.created_by_name}</span>
                        <span className="flex items-center gap-1 text-xs text-ice font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                          <Eye className="w-3.5 h-3.5" />
                          View
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-24">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-surface-light border border-border mb-6">
              <Eye className="w-10 h-10 text-muted" />
            </div>
            <h3 className="text-xl font-bold mb-2">No Active Tournaments</h3>
            <p className="text-sm text-muted mb-6 max-w-sm mx-auto">
              No tournaments are running right now. Create one and let the competition begin!
            </p>
            <Link
              href="/battle"
              className="inline-flex px-6 py-3 rounded-xl fire-gradient text-white font-semibold hover:opacity-90 transition-opacity items-center gap-2"
            >
              <Flame className="w-4 h-4" />
              Browse Tournaments
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
