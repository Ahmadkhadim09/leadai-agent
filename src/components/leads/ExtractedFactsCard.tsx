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
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-slate-900 text-base">Extracted Qualification Facts</h3>
          </div>
          <span className="text-xs px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold font-mono">
            BANT Verified
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-slate-500 font-semibold block mb-1 flex items-center gap-1.5 text-xs">
              <Building className="w-4 h-4 text-slate-400" />
              Company & Scope
            </span>
            <div className="font-bold text-base text-slate-900">
              {facts.companyName || "Unknown"}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              {facts.companySize || "Size not specified"}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-slate-500 font-semibold block mb-1 flex items-center gap-1.5 text-xs">
              <User className="w-4 h-4 text-slate-400" />
              Role & Authority
            </span>
            <div className="font-bold text-base text-slate-900">
              {facts.role || "Role unspecified"}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              {facts.isDecisionMaker === true
                ? "Verified Economic Decision Maker"
                : facts.isDecisionMaker === false
                ? "Influencer / Needs Executive Signoff"
                : "Authority Unverified"}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-slate-500 font-semibold block mb-1 flex items-center gap-1.5 text-xs">
              <DollarSign className="w-4 h-4 text-slate-400" />
              Annual Budget
            </span>
            <div className="font-extrabold text-emerald-700 font-mono text-lg">
              {facts.annualBudgetUSD
                ? `$${facts.annualBudgetUSD.toLocaleString()} USD`
                : "Unstated"}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Threshold: $5,000/yr minimum
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-slate-500 font-semibold block mb-1 flex items-center gap-1.5 text-xs">
              <Clock className="w-4 h-4 text-slate-400" />
              Purchase Timeline
            </span>
            <div className="font-bold text-base text-slate-900 capitalize">
              {facts.timeline?.replace("_", " ") || "Unknown"}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Urgency: {facts.timeline === "immediate" ? "Critical / Active Cycle" : "Exploratory"}
            </div>
          </div>
        </div>

        {facts.primaryPainPoint && (
          <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm">
            <span className="text-slate-600 font-bold block mb-1 text-xs uppercase tracking-wider">
              Primary Problem & Need
            </span>
            <p className="text-slate-800 leading-relaxed italic text-sm">
              &ldquo;{facts.primaryPainPoint}&rdquo;
            </p>
          </div>
        )}

        {facts.techStack && facts.techStack.length > 0 && (
          <div className="mt-4 flex items-center gap-2.5 text-xs">
            <span className="text-slate-600 text-xs font-semibold flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-slate-400" /> Tech Stack:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {facts.techStack.map((tech) => (
                <span
                  key={tech}
                  className="px-2.5 py-1 text-xs rounded-md bg-white text-slate-800 border border-slate-200 font-medium shadow-xs"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Unknown Fields Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-slate-900 text-base">Unknown / Missing Discovery Fields</h3>
          </div>
          <span className="text-xs text-slate-500 font-semibold">
            {unknownFields.length} pending
          </span>
        </div>

        {unknownFields.length === 0 ? (
          <p className="text-sm text-emerald-700 flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Complete discovery profile. All major qualification parameters captured.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {unknownFields.map((field) => (
              <span
                key={String(field)}
                className="px-3 py-1.5 text-xs rounded-lg bg-amber-50 text-amber-800 border border-amber-200 font-mono font-bold"
              >
                ? {String(field)}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Risk Flags */}
      {riskFlags && riskFlags.length > 0 && (
        <div className="bg-white border border-rose-200 rounded-2xl p-6 shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-rose-500" />
            <h3 className="font-bold text-slate-900 text-base">Detected Risk Flags</h3>
          </div>
          <div className="space-y-2.5">
            {riskFlags.map((risk, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs sm:text-sm flex items-center gap-2.5 font-medium"
              >
                <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                <span>{risk}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
