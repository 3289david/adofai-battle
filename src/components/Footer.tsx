import Link from "next/link";
import { Swords, Globe, MessageCircle, Flame, ShieldCheck } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-surface/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="relative w-8 h-8">
                <div className="absolute inset-0 rounded-lg fire-gradient opacity-90" />
                <div className="absolute inset-[2px] rounded-[6px] bg-surface flex items-center justify-center">
                  <span className="text-xs font-black fire-text">A</span>
                </div>
              </div>
              <span className="text-sm font-bold tracking-wider">
                ADOFAI<span className="fire-text">.NET</span>
              </span>
            </div>
            <p className="text-sm text-muted leading-relaxed mb-4">
              The competitive battle arena for A Dance of Fire and Ice.
              Prove your rhythm. Claim your rank.
            </p>
            <div className="flex items-center gap-2 text-[10px] text-success">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span className="font-semibold">Anti-Cheat Protected</span>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-muted mb-4">
              Platform
            </h3>
            <ul className="space-y-2.5">
              {[
                { href: "/battle", label: "Battle Arena" },
                { href: "/rankings", label: "Rankings" },
                { href: "/modes", label: "Battle Modes" },
                { href: "/spectate", label: "Spectate" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-muted mb-4">
              Compete
            </h3>
            <ul className="space-y-2.5">
              {["Ranked Matches", "Tournaments", "Daily Challenge", "Ghost Race", "Boss Raid"].map(
                (item) => (
                  <li key={item}>
                    <span className="text-sm text-muted hover:text-foreground transition-colors cursor-pointer">
                      {item}
                    </span>
                  </li>
                )
              )}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-muted mb-4">
              Community
            </h3>
            <div className="flex gap-3 mb-4">
              {[
                { icon: MessageCircle, label: "Discord" },
                { icon: Globe, label: "Website" },
                { icon: Swords, label: "Forum" },
              ].map(({ icon: Icon, label }) => (
                <a
                  key={label}
                  href="#"
                  className="w-10 h-10 rounded-lg bg-surface-light border border-border flex items-center justify-center text-muted hover:text-foreground hover:border-border-light transition-all"
                  title={label}
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-light border border-border">
              <Flame className="w-3.5 h-3.5 text-fire" />
              <span className="text-[10px] font-semibold text-fire uppercase tracking-wider">
                Season 1 Active
              </span>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted">
            &copy; 2026 ADOFAI.NET &mdash; Not affiliated with 7th Beat Games.
          </p>
          <p className="text-xs text-muted">
            Built for the rhythm gaming community. Competition is everything.
          </p>
        </div>
      </div>
    </footer>
  );
}
