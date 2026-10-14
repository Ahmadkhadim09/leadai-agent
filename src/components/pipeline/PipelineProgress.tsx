import React from "react";
import { PipelineStage, PIPELINE_STAGES } from "@/types/pipeline";
import { Check, X } from "lucide-react";

interface PipelineProgressProps {
  currentStage: PipelineStage;
}

export function PipelineProgress({ currentStage }: PipelineProgressProps) {
  // Normal flow order: new -> qualified -> proposal_sent -> booked -> won
  const mainFlow: PipelineStage[] = ["new", "qualified", "proposal_sent", "booked", "won"];
  const isLost = currentStage === "lost";
  const currentIndex = mainFlow.indexOf(currentStage);

  return (
    <div className="w-full py-4">
      <div className="flex items-center justify-between relative">
        {/* Background connecting line */}
        <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 h-1 bg-slate-200 rounded z-0" />

        {mainFlow.map((stage, idx) => {
          const isPassed = !isLost && currentIndex >= idx;
          const isCurrent = currentStage === stage;
          const stageDef = PIPELINE_STAGES[stage];

          return (
            <div key={stage} className="flex flex-col items-center relative z-10">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                  isCurrent
                    ? "bg-blue-600 text-white ring-4 ring-blue-100 shadow-sm"
                    : isPassed
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "bg-white border border-slate-300 text-slate-400"
                }`}
              >
                {isPassed && !isCurrent ? <Check className="w-4 h-4" /> : idx + 1}
              </div>
              <span
                className={`mt-2 text-xs tracking-tight ${
                  isCurrent
                    ? "text-blue-700 font-bold"
                    : isPassed
                    ? "text-slate-700 font-medium"
                    : "text-slate-400"
                }`}
              >
                {stageDef.label}
              </span>
            </div>
          );
        })}

        {isLost && (
          <div className="flex flex-col items-center relative z-10">
            <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs bg-rose-600 text-white ring-4 ring-rose-100 shadow-sm">
              <X className="w-4 h-4" />
            </div>
            <span className="mt-2 text-xs font-bold text-rose-600">Lost</span>
          </div>
        )}
      </div>
    </div>
  );
}
