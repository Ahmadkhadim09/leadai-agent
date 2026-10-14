"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Lead } from "@/types/lead";
import { PIPELINE_STAGES } from "@/types/pipeline";
import { StageBadge } from "@/components/pipeline/StageBadge";
import { LeadScoreBadge } from "./LeadScoreBadge";
import { Search, AlertTriangle, ArrowUpRight, Building2, Calendar, ShieldAlert } from "lucide-react";

interface LeadTableProps {
  leads: Lead[];
}

export function LeadTable({ leads }: LeadTableProps) {
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState<string>("all");
  const [riskOnly, setRiskOnly] = useState(false);

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      // Search by company, contact, or email
      const matchesSearch =
        search === "" ||
        lead.companyName.toLowerCase().includes(search.toLowerCase()) ||
        lead.contactName.toLowerCase().includes(search.toLowerCase()) ||
        lead.contactEmail.toLowerCase().includes(search.toLowerCase());

      // Stage filter
      const matchesStage = stageFilter === "all" || lead.stage === stageFilter;

      // Risk flag filter
      const matchesRisk = !riskOnly || (lead.riskFlags && lead.riskFlags.length > 0);

      return matchesSearch && matchesStage && matchesRisk;
    });
  }, [leads, search, stageFilter, riskOnly]);

  return (
    <div className="space-y-4">
      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search leads by company, contact, or email..."
            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 shadow-xs"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-700 focus:outline-none focus:border-blue-500 shadow-xs"
          >
            <option value="all">All Stages ({leads.length})</option>
            {Object.entries(PIPELINE_STAGES).map(([key, def]) => (
              <option key={key} value={key}>
                {def.label}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => setRiskOnly(!riskOnly)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-all shadow-xs ${
              riskOnly
                ? "bg-amber-50 text-amber-800 border-amber-300"
                : "bg-white text-slate-600 border-slate-300 hover:text-slate-900"
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
            <span>Risks Only</span>
          </button>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600 font-semibold uppercase tracking-wider">
                <th className="px-4 py-3.5">Company & Contact</th>
                <th className="px-4 py-3.5">Pipeline Stage</th>
                <th className="px-4 py-3.5">ICP Score</th>
                <th className="px-4 py-3.5">Budget / Timeline</th>
                <th className="px-4 py-3.5">Risk Flags</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-slate-500">
                    No leads match your active search criteria.
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => (
                  <tr
                    key={lead.id}
                    className="hover:bg-blue-50/40 transition-colors group"
                  >
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 group-hover:bg-blue-100 transition-colors shrink-0">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                            {lead.companyName}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {lead.contactName} •{" "}
                            <span className="text-slate-400">{lead.contactEmail}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <StageBadge stage={lead.stage} size="sm" />
                    </td>

                    <td className="px-4 py-4">
                      <LeadScoreBadge score={lead.score} size="md" />
                    </td>

                    <td className="px-4 py-4">
                      <div className="text-emerald-700 font-semibold font-mono">
                        {lead.annualBudgetUSD
                          ? `$${lead.annualBudgetUSD.toLocaleString()}/yr`
                          : "Unstated"}
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>Timeline: {lead.timeline ? lead.timeline.replace("_", " ") : "Unknown"}</span>
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      {lead.riskFlags && lead.riskFlags.length > 0 ? (
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {lead.riskFlags.map((risk, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 text-[10px] rounded bg-amber-50 text-amber-800 border border-amber-200 inline-flex items-center gap-1 font-medium"
                              title={risk}
                            >
                              <ShieldAlert className="w-2.5 h-2.5 text-amber-600 shrink-0" />
                              <span className="truncate max-w-[140px]">{risk}</span>
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[11px]">No risks detected</span>
                      )}
                    </td>

                    <td className="px-4 py-4 text-right">
                      <Link
                        href={`/leads/${lead.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white border border-blue-200 hover:border-blue-600 text-xs font-semibold transition-all shadow-xs"
                      >
                        <span>View Deal</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="px-4 py-3 border-t border-slate-200 bg-slate-50/60 flex items-center justify-between text-xs text-slate-500">
          <span>
            Showing <strong className="text-slate-800 font-semibold">{filteredLeads.length}</strong> of{" "}
            {leads.length} Qualified CRM Leads
          </span>
          <span className="text-[11px] text-emerald-700 font-medium">
            Pipeline Status: Synchronized
          </span>
        </div>
      </div>
    </div>
  );
}
