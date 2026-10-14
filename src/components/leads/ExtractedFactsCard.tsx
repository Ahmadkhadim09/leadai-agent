import React from "react";
import { LeadFacts } from "@/types/tools";
import { CheckCircle2, HelpCircle, AlertTriangle, Building, User, DollarSign, Clock, Layers } from "lucide-react";

interface ExtractedFactsCardProps {
  facts: LeadFacts;
  unknownFields: Array<keyof LeadFacts>;
  riskFlags: string[];
}

export function ExtractedFactsCard({ facts, unknownFields, riskFlags }: ExtractedFactsCardProps) {
  return (
    <div className="space-y-6">
      {/* Extracted Facts */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold text-slate-900 text-sm">Extracted Qualification Facts</h3>
          </div>
          <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold font-mono">
            BANT Verified
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-slate-500 font-medium block mb-1 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-slate-400" />
              Company & Scope
            </span>
            <div className="font-bold text-slate-900">
              {facts.companyName || "Unknown"}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              {facts.companySize || "Size not specified"}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-slate-500 font-medium block mb-1 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-400" />
              Role & Authority
            </span>
            <div className="font-bold text-slate-900">
              {facts.role || "Role unspecified"}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              {facts.isDecisionMaker === true
                ? "Verified Economic Decision Maker"
                : facts.isDecisionMaker === false
                ? "Influencer / Needs Executive Signoff"
                : "Authority Unverified"}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-slate-500 font-medium block mb-1 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-slate-400" />
              Annual Budget
            </span>
            <div className="font-bold text-emerald-700 font-mono text-sm">
              {facts.annualBudgetUSD
                ? `$${facts.annualBudgetUSD.toLocaleString()} USD`
                : "Unstated"}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Threshold: $5,000/yr minimum
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-slate-500 font-medium block mb-1 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              Purchase Timeline
            </span>
            <div className="font-bold text-slate-900 capitalize">
              {facts.timeline?.replace("_", " ") || "Unknown"}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Urgency: {facts.timeline === "immediate" ? "Critical / Active Cycle" : "Exploratory"}
            </div>
          </div>
        </div>

        {facts.primaryPainPoint && (
          <div className="mt-3.5 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <span className="text-slate-500 font-medium block mb-1">Primary Problem & Need</span>
            <p className="text-slate-800 leading-relaxed italic">
              &ldquo;{facts.primaryPainPoint}&rdquo;
            </p>
          </div>
        )}

        {facts.techStack && facts.techStack.length > 0 && (
          <div className="mt-3.5 flex items-center gap-2 text-xs">
            <span className="text-slate-500 text-[11px] font-medium flex items-center gap-1">
              <Layers className="w-3 h-3 text-slate-400" /> Tech Stack:
            </span>
            <div className="flex flex-wrap gap-1">
              {facts.techStack.map((tech) => (
                <span
                  key={tech}
                  className="px-2 py-0.5 text-[10px] rounded bg-white text-slate-700 border border-slate-200 font-medium"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Unknown Fields Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-amber-500" />
            <h3 className="font-bold text-slate-900 text-sm">Unknown / Missing Discovery Fields</h3>
          </div>
          <span className="text-[11px] text-slate-500 font-medium">
            {unknownFields.length} pending
          </span>
        </div>

        {unknownFields.length === 0 ? (
          <p className="text-xs text-emerald-700 flex items-center gap-1.5 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Complete discovery profile. All major qualification parameters captured.
          </p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {unknownFields.map((field) => (
              <span
                key={String(field)}
                className="px-2.5 py-1 text-xs rounded-lg bg-amber-50 text-amber-800 border border-amber-200 font-mono font-medium"
              >
                ? {String(field)}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Risk Flags */}
      {riskFlags && riskFlags.length > 0 && (
        <div className="bg-white border border-rose-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-rose-500" />
            <h3 className="font-bold text-slate-900 text-sm">Detected Risk Flags</h3>
          </div>
          <div className="space-y-2">
            {riskFlags.map((risk, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-center gap-2"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                <span>{risk}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
