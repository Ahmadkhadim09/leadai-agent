import React from "react";

interface LeadScoreBadgeProps {
  score: number;
  size?: "sm" | "md" | "lg";
}

export function LeadScoreBadge({ score, size = "md" }: LeadScoreBadgeProps) {
  let color = "text-rose-700 bg-rose-50 border-rose-200";
  let label = "Low";

  if (score >= 80) {
    color = "text-emerald-700 bg-emerald-50 border-emerald-200";
    label = "High ICP";
  } else if (score >= 60) {
    color = "text-blue-700 bg-blue-50 border-blue-200";
    label = "Qualified";
  } else if (score >= 40) {
    color = "text-amber-700 bg-amber-50 border-amber-200";
    label = "Nurture";
  }

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs font-bold",
    md: "px-2.5 py-0.5 text-xs font-bold",
    lg: "px-3.5 py-1 text-sm font-extrabold",
  }[size];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-lg border ${color} ${sizeClasses}`}
      title={`Lead Score: ${score}/100 (${label})`}
    >
      <span className="font-mono">{score}</span>
      <span className="text-xs opacity-85 hidden sm:inline font-semibold">{label}</span>
    </span>
  );
}
