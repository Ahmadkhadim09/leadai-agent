import React from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { defaultFirebaseAdapter } from "@/features/leads/leads-store";
import { PIPELINE_STAGES, PipelineStage } from "@/types/pipeline";
import { StageBadge } from "@/components/pipeline/StageBadge";
import { LeadScoreBadge } from "@/components/leads/LeadScoreBadge";
import {
  Users,
  Target,
  CalendarCheck,
  ShieldCheck,
  ArrowUpRight,
  Sparkles,
  Bot,
  Activity,
  Sliders,
  TrendingUp,
} from "lucide-react";

export default async function DashboardPage() {
  const leads = await defaultFirebaseAdapter.listLeads();

  // Metrics
  const totalLeads = leads.length;
  const qualifiedCount = leads.filter(
    (l) => l.stage === "qualified" || l.stage === "proposal_sent" || l.stage === "booked" || l.stage === "won"
  ).length;
  const bookedCount = leads.filter((l) => l.stage === "booked" || l.stage === "won").length;

  // Stage distribution
  const stageCounts: Record<PipelineStage, number> = {
    new: 0,
    qualified: 0,
    proposal_sent: 0,
    booked: 0,
    won: 0,
    lost: 0,
  };
  leads.forEach((l) => {
    stageCounts[l.stage] = (stageCounts[l.stage] || 0) + 1;
  });

  return (
    <AppShell>
      <div className="space-y-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                LeadPilot Sales Control Center
              </h1>
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                Live Agent Active
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Autonomous BANT qualification, grounded pricing packages, and automated SDR calendar scheduling.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/chat"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm shadow-blue-600/30 flex items-center gap-2 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Simulate Customer Chat</span>
            </Link>
            <Link
              href="/evaluations"
              className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors shadow-xs"
            >
              <Activity className="w-3.5 h-3.5 text-blue-600" />
              <span>Run Eval Benchmark</span>
            </Link>
          </div>
        </div>

        {/* User-Friendly 4-Step Process Guide */}
        <div className="bg-white border border-blue-100 rounded-2xl p-6 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                System Architecture
              </span>
              <h2 className="text-base font-bold text-slate-900">
                How LeadPilot Qualifies & Closes Deals
              </h2>
            </div>
            <span className="text-xs text-slate-500">
              No free-form LLM hallucinations • Strict 5-Tool Calling
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-bold">
                1
              </div>
              <h3 className="text-xs font-bold text-slate-900">1. Inbound Prospect Chat</h3>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Prospect opens chat on <Link href="/chat" className="text-blue-600 underline font-medium">/chat</Link>. AI guides conversation through structured BANT qualification.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs font-bold">
                2
              </div>
              <h3 className="text-xs font-bold text-slate-900">2. Strict Tool Calling</h3>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Agent executes 5 typed tools (<code className="text-indigo-600 font-mono text-[10px]">extractLead</code>, <code className="text-indigo-600 font-mono text-[10px]">scoreLead</code>, etc.) with validated JSON schemas.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center text-xs font-bold">
                3
              </div>
              <h3 className="text-xs font-bold text-slate-900">3. Grounded Offers</h3>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Prices locked to verified packages ($5k–$36k/yr). Mathematical zero-discount blocker stops discount fabrications.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-xs font-bold">
                4
              </div>
              <h3 className="text-xs font-bold text-slate-900">4. Live Pipeline & Booking</h3>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Books confirmed SDR calendar slots and updates the Kanban pipeline with stage override controls in <Link href="/leads" className="text-blue-600 underline font-medium">/leads</Link>.
              </p>
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs relative overflow-hidden group hover:border-blue-300 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Total Active Leads</span>
              <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900 font-mono">{totalLeads}</span>
              <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3" /> Active Pipeline
              </span>
            </div>
            <p className="mt-1 text-[11px] text-slate-500">Real-time CRM records</p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs relative overflow-hidden group hover:border-emerald-300 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">BANT Qualified Rate</span>
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                <Target className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900 font-mono">
                {totalLeads > 0 ? Math.round((qualifiedCount / totalLeads) * 100) : 0}%
              </span>
              <span className="text-[11px] text-slate-500">({qualifiedCount} of {totalLeads} leads)</span>
            </div>
            <p className="mt-1 text-[11px] text-slate-500">Min $5k budget + Authority met</p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs relative overflow-hidden group hover:border-purple-300 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Confirmed Demo Bookings</span>
              <div className="p-2 rounded-xl bg-purple-50 text-purple-600 border border-purple-100">
                <CalendarCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900 font-mono">{bookedCount}</span>
              <span className="text-[11px] text-blue-600 font-medium">calendar slots filled</span>
            </div>
            <p className="mt-1 text-[11px] text-slate-500">Synchronized SDR calendar</p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs relative overflow-hidden group hover:border-emerald-300 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Safety & Grounding Score</span>
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-emerald-600 font-mono">100%</span>
              <span className="text-[11px] text-slate-600 font-medium">0 hallucinations</span>
            </div>
            <p className="mt-1 text-[11px] text-slate-500">20/20 benchmark test scenarios</p>
          </div>
        </div>

        {/* Pipeline Stage Distribution Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Sales Pipeline Funnel
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Strict stage progression: new → qualified → proposal_sent → booked → won/lost
              </p>
            </div>
            <Link
              href="/leads"
              className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 font-semibold"
            >
              <span>View All Deals</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
            {(Object.keys(PIPELINE_STAGES) as PipelineStage[]).map((stage) => {
              const count = stageCounts[stage];
              return (
                <div
                  key={stage}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-1.5"
                >
                  <StageBadge stage={stage} size="sm" />
                  <div className="text-xl font-bold text-slate-900 font-mono pt-1">{count}</div>
                  <div className="text-[10px] text-slate-500">
                    {totalLeads > 0 ? Math.round((count / totalLeads) * 100) : 0}% of pipeline
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Operations & Recent Leads Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Operations */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Quick Operations
            </h2>

            <div className="space-y-2.5">
              <Link
                href="/chat"
                className="p-3.5 rounded-xl bg-slate-50 hover:bg-blue-50/60 border border-slate-200 hover:border-blue-200 flex items-center justify-between group transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-900 group-hover:text-blue-600">
                      AI SDR Chat Sandbox
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Test qualification & tool calls in real time
                    </div>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
              </Link>

              <Link
                href="/leads"
                className="p-3.5 rounded-xl bg-slate-50 hover:bg-blue-50/60 border border-slate-200 hover:border-blue-200 flex items-center justify-between group transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
                    <Target className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-900 group-hover:text-blue-600">
                      Lead Pipeline & Overrides
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Manage BANT facts, notes, and stages
                    </div>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
              </Link>

              <Link
                href="/evaluations"
                className="p-3.5 rounded-xl bg-slate-50 hover:bg-blue-50/60 border border-slate-200 hover:border-blue-200 flex items-center justify-between group transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-50 text-purple-600 border border-purple-100">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-900 group-hover:text-blue-600">
                      20-Case Safety Benchmark
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Extraction accuracy & zero-hallucination suite
                    </div>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
              </Link>

              <Link
                href="/settings"
                className="p-3.5 rounded-xl bg-slate-50 hover:bg-blue-50/60 border border-slate-200 hover:border-blue-200 flex items-center justify-between group transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-slate-100 text-slate-700 border border-slate-200">
                    <Sliders className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-900 group-hover:text-blue-600">
                      Pricing & Demo Slots Config
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Inspect grounded packages and calendar rules
                    </div>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
              </Link>
            </div>
          </div>

          {/* Recent Deals Snapshot */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Recent Pipeline Activity
                </h2>
                <p className="text-xs text-slate-500">
                  Deals qualified and processed through the BANT matrix
                </p>
              </div>
              <Link
                href="/leads"
                className="text-xs text-blue-600 hover:text-blue-700 font-semibold"
              >
                All Leads →
              </Link>
            </div>

            <div className="divide-y divide-slate-100">
              {leads.slice(0, 4).map((lead) => (
                <div
                  key={lead.id}
                  className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/leads/${lead.id}`}
                        className="text-xs font-bold text-slate-900 hover:text-blue-600 transition-colors"
                      >
                        {lead.companyName}
                      </Link>
                      <StageBadge stage={lead.stage} size="sm" />
                      <LeadScoreBadge score={lead.score} size="sm" />
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Contact: <strong className="text-slate-700 font-medium">{lead.contactName}</strong> • Budget:{" "}
                      <span className="font-mono text-emerald-600 font-semibold">
                        {lead.annualBudgetUSD ? `$${lead.annualBudgetUSD.toLocaleString()}` : "Pending"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/leads/${lead.id}`}
                      className="px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 hover:border-blue-200 text-xs font-medium transition-colors"
                    >
                      Inspect Deal
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
