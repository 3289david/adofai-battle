"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import {
  Swords,
  Trophy,
  User,
  Eye,
  Crown,
  CalendarDays,
  Shield,
  Menu,
  X,
  Flame,
  LogOut,
  LogIn,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/battle", label: "Tournaments", icon: Swords },
  { href: "/season", label: "Season", icon: Crown },
  { href: "/daily", label: "Daily", icon: CalendarDays },
  { href: "/rankings", label: "Rankings", icon: Trophy },
  { href: "/clans", label: "Clans", icon: Shield },
  { href: "/spectate", label: "Spectate", icon: Eye },
  { href: "/profile", label: "Profile", icon: User },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-9 h-9">
              <div className="absolute inset-0 rounded-lg fire-gradient opacity-90 group-hover:opacity-100 transition-opacity" />
              <div className="absolute inset-[2px] rounded-[6px] bg-background flex items-center justify-center">
                <span className="text-sm font-black fire-text">A</span>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-wider">
                ADOFAI<span className="fire-text">.NET</span>
              </span>
              <span className="text-[10px] text-muted tracking-widest uppercase">
                Battle Arena
              </span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-fire/10 text-fire"
                      : "text-muted hover:text-foreground hover:bg-surface-light"
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>

          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <span className="text-xs font-mono text-muted">
                  <span className="text-fire font-bold">{user.username}</span>
                  {" "}
                  <span className="opacity-60">{user.rank} · {user.mmr} MMR</span>
                </span>
                <button
                  onClick={logout}
                  className="p-2 rounded-lg hover:bg-surface-light transition-colors text-muted hover:text-foreground"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <Link href="/login" className="px-4 py-2 rounded-lg bg-surface-light text-sm font-medium hover:bg-surface transition-colors flex items-center gap-2 text-muted hover:text-foreground">
                <LogIn className="w-3.5 h-3.5" />
                Sign In
              </Link>
            )}
            <Link href="/battle" className="px-5 py-2 rounded-lg fire-gradient text-white text-sm font-semibold hover:opacity-90 transition-opacity flex items-center gap-2">
              <Flame className="w-3.5 h-3.5" />
              Play Now
            </Link>
          </div>

          <button
            className="md:hidden p-2 rounded-lg hover:bg-surface-light transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-surface/95 backdrop-blur-xl">
          <div className="px-4 py-3 space-y-1">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all",
                    isActive
                      ? "bg-fire/10 text-fire"
                      : "text-muted hover:text-foreground hover:bg-surface-light"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </Link>
              );
            })}
            {user ? (
              <button
                onClick={() => { logout(); setMobileOpen(false); }}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium text-muted hover:text-foreground hover:bg-surface-light"
              >
                <LogOut className="w-5 h-5" />
                Sign Out ({user.username})
              </button>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-muted hover:text-foreground hover:bg-surface-light"
              >
                <LogIn className="w-5 h-5" />
                Sign In
              </Link>
            )}
            <Link
              href="/battle"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-center gap-2 w-full mt-2 px-5 py-3 rounded-lg fire-gradient text-white text-sm font-semibold"
            >
              <Flame className="w-4 h-4" />
              Play Now
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
