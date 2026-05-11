"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Shield,
  Users,
  Search,
  Loader2,
  Plus,
  X,
  Trophy,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";

interface Clan {
  id: string;
  name: string;
  tag: string;
  description: string;
  member_count: number;
  mmr: number;
  recruiting: boolean;
  created_at: string;
}

export default function ClansPage() {
  const { user } = useAuth();
  const [clans, setClans] = useState<Clan[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formName, setFormName] = useState("");
  const [formTag, setFormTag] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formError, setFormError] = useState("");

  const fetchClans = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/clans");
      if (res.ok) {
        const data = await res.json();
        setClans(data.clans || []);
      }
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClans();
  }, [fetchClans]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formTag) return;
    if (formTag.length < 2 || formTag.length > 5) {
      setFormError("Tag must be 2-5 characters");
      return;
    }
    setCreating(true);
    setFormError("");
    try {
      const res = await fetch("/api/clans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: formName, tag: formTag, description: formDesc }),
      });
      if (!res.ok) {
        const data = await res.json();
        setFormError(data.error || "Failed to create clan");
      } else {
        setShowCreate(false);
        setFormName("");
        setFormTag("");
        setFormDesc("");
        fetchClans();
      }
    } catch {
      setFormError("Network error");
    } finally {
      setCreating(false);
    }
  };

  const filtered = search
    ? clans.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.tag.toLowerCase().includes(search.toLowerCase()))
    : clans;

  return (
    <div className="relative min-h-screen">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-1/3 w-[500px] h-[500px] rounded-full bg-ice/[0.03] blur-[100px]" />
        <div className="absolute inset-0 bg-grid opacity-30" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-black mb-1">
                <span className="ice-text">Clans</span>
              </h1>
              <p className="text-muted text-sm">Team up, compete together, dominate the leaderboard.</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-light border border-border">
                <Users className="w-3.5 h-3.5 text-muted" />
                <span className="text-xs font-semibold">{clans.length} clans</span>
              </div>
              {user && (
                <button
                  onClick={() => setShowCreate(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg fire-gradient text-white text-sm font-semibold hover:opacity-90 transition-opacity"
                >
                  <Plus className="w-4 h-4" />
                  Create Clan
                </button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text"
            placeholder="Search clans by name or tag..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-xl bg-surface-light border border-border text-foreground text-sm placeholder:text-muted/60 focus:outline-none focus:border-fire/50 transition-colors"
          />
        </div>

        {/* Clan List */}
        {loading ? (
          <div className="text-center py-24">
            <Loader2 className="w-8 h-8 animate-spin text-fire mx-auto mb-4" />
            <p className="text-muted text-sm">Loading clans...</p>
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((clan) => (
              <Link key={clan.id} href={`/clans/${clan.id}`}>
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl border border-border bg-surface-light p-5 hover:border-ice/30 transition-all group h-full"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-ice/10 border border-ice/20 flex items-center justify-center">
                        <Shield className="w-5 h-5 text-ice" />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm group-hover:text-ice transition-colors">{clan.name}</h3>
                        <span className="text-[11px] text-muted font-mono">[{clan.tag}]</span>
                      </div>
                    </div>
                    {clan.recruiting && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold text-emerald-400">
                        RECRUITING
                      </span>
                    )}
                  </div>
                  {clan.description && (
                    <p className="text-xs text-muted mb-3 line-clamp-2">{clan.description}</p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-muted">
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      {clan.member_count} members
                    </span>
                    <span className="flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5" />
                      {clan.mmr} MMR
                    </span>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-24">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-surface-light border border-border mb-6">
              <Shield className="w-10 h-10 text-muted" />
            </div>
            <h3 className="text-xl font-bold mb-2">No clans found</h3>
            <p className="text-sm text-muted max-w-sm mx-auto">
              Be the first to create a clan and recruit members!
            </p>
          </div>
        )}
      </div>

      {/* Create Clan Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowCreate(false)} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-full max-w-md rounded-2xl border border-border bg-surface p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold">Create Clan</h2>
              <button onClick={() => setShowCreate(false)} className="p-2 rounded-lg hover:bg-surface-light transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted mb-1 block">Clan Name</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg bg-surface-light border border-border text-sm focus:outline-none focus:border-fire/50"
                  placeholder="My Awesome Clan"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted mb-1 block">Tag (2-5 characters)</label>
                <input
                  type="text"
                  value={formTag}
                  onChange={(e) => setFormTag(e.target.value.toUpperCase().slice(0, 5))}
                  className="w-full px-4 py-2.5 rounded-lg bg-surface-light border border-border text-sm font-mono focus:outline-none focus:border-fire/50"
                  placeholder="TAG"
                  required
                  minLength={2}
                  maxLength={5}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted mb-1 block">Description</label>
                <textarea
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg bg-surface-light border border-border text-sm focus:outline-none focus:border-fire/50 resize-none h-20"
                  placeholder="Tell others about your clan..."
                />
              </div>
              {formError && (
                <p className="text-xs text-red-400 font-medium">{formError}</p>
              )}
              <button
                type="submit"
                disabled={creating}
                className="w-full py-3 rounded-lg fire-gradient text-white font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                {creating ? "Creating..." : "Create Clan"}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
