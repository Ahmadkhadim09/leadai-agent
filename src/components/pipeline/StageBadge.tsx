import React from "react";
import { PipelineStage, PIPELINE_STAGES } from "@/types/pipeline";

interface StageBadgeProps {
  stage: PipelineStage;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function StageBadge({ stage, className = "", size = "md" }: StageBadgeProps) {
  const definition = PIPELINE_STAGES[stage] || PIPELINE_STAGES.new;
  const { colorScheme } = definition;

  const sizeClasses = {
    sm: "px-2 py-0.5 text-[11px]",
    md: "px-2.5 py-1 text-xs",
    lg: "px-3 py-1.5 text-sm",
  }[size];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium border ${colorScheme.bg} ${colorScheme.text} ${colorScheme.border} ${sizeClasses} ${className}`}
      title={definition.description}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${colorScheme.dot}`} />
      <span>{definition.label}</span>
    </span>
  );
}
