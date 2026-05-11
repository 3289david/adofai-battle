"use client";

import { cn } from "@/lib/utils";
import { type Rank, getRankColor } from "@/lib/mock-data";

interface RankBadgeProps {
  rank: Rank;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export default function RankBadge({
  rank,
  size = "md",
  showLabel = true,
}: RankBadgeProps) {
  const color = getRankColor(rank);
  const isGod = rank === "Rhythm God";

  const sizeClasses = {
    sm: "w-5 h-5 text-[10px]",
    md: "w-7 h-7 text-xs",
    lg: "w-10 h-10 text-sm",
  };

  const labelSizes = {
    sm: "text-[10px]",
    md: "text-xs",
    lg: "text-sm",
  };

  return (
    <div className="flex items-center gap-1.5">
      <div
        className={cn(
          "rounded-md flex items-center justify-center font-black",
          sizeClasses[size],
          isGod && "animate-rank-shimmer"
        )}
        style={{
          background: isGod
            ? `linear-gradient(90deg, ${color}, #ff4081, ${color})`
            : color,
          backgroundSize: isGod ? "200% auto" : undefined,
          color: rank === "Silver" || rank === "Gold" ? "#111" : "#fff",
        }}
      >
        {rank === "Rhythm God" ? "★" : rank[0]}
      </div>
      {showLabel && (
        <span
          className={cn("font-semibold", labelSizes[size])}
          style={{ color }}
        >
          {rank}
        </span>
      )}
    </div>
  );
}
