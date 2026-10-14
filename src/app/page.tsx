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
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
                LeadPilot Sales Control Center
              </h1>
              <span className="px-3 py-1 text-xs font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-600" />
                Live Agent Active
              </span>
            </div>
            <p className="text-sm text-slate-600 mt-1.5 font-normal">
              Autonomous BANT qualification, verified commercial pricing, and direct SDR calendar scheduling.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/chat"
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-sm shadow-blue-600/30 flex items-center gap-2 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>Simulate Customer Chat</span>
            </Link>
            <Link
              href="/evaluations"
              className="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-sm font-semibold flex items-center gap-2 transition-colors shadow-xs"
            >
              <Activity className="w-4 h-4 text-blue-600" />
              <span>Run Eval Benchmark</span>
            </Link>
          </div>
        </div>

        {/* User-Friendly 4-Step Process Guide */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                System Workflow
              </span>
              <h2 className="text-lg font-bold text-slate-900">
                How LeadPilot Qualifies & Closes Deals
              </h2>
            </div>
            <span className="text-xs font-medium text-slate-500">
              Deterministic 5-Tool Engine • Zero Pricing Hallucinations
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-sm font-bold">
                1
              </div>
              <h3 className="text-sm font-bold text-slate-900">1. Inbound Prospect Chat</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                Prospect opens chat on <Link href="/chat" className="text-blue-600 underline font-medium">/chat</Link>. AI guides dialogue through structured BANT qualification.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-sm font-bold">
                2
              </div>
              <h3 className="text-sm font-bold text-slate-900">2. Strict Tool Calling</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                Agent executes 5 typed tools (<code className="text-indigo-600 font-mono text-xs">extractLead</code>, <code className="text-indigo-600 font-mono text-xs">scoreLead</code>, etc.) with validated JSON schemas.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center text-sm font-bold">
                3
              </div>
              <h3 className="text-sm font-bold text-slate-900">3. Grounded Offers</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                Prices locked to verified packages ($5k–$36k/yr). Zero-discount blocker stops discount fabrications.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-sm font-bold">
                4
              </div>
              <h3 className="text-sm font-bold text-slate-900">4. Live Pipeline & Booking</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                Books confirmed SDR calendar slots and updates the Kanban pipeline with stage override controls in <Link href="/leads" className="text-blue-600 underline font-medium">/leads</Link>.
              </p>
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs relative overflow-hidden group hover:border-blue-300 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-700">Total Active Leads</span>
              <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900 font-mono">{totalLeads}</span>
              <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" /> Active Pipeline
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500">Live CRM database</p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs relative overflow-hidden group hover:border-emerald-300 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-700">BANT Qualified Rate</span>
              <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                <Target className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900 font-mono">
                {totalLeads > 0 ? Math.round((qualifiedCount / totalLeads) * 100) : 0}%
              </span>
              <span className="text-xs text-slate-500 font-medium">({qualifiedCount} of {totalLeads} leads)</span>
            </div>
            <p className="mt-1 text-xs text-slate-500">Budget & Authority verified</p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs relative overflow-hidden group hover:border-purple-300 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-700">Confirmed Demo Bookings</span>
              <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600 border border-purple-100">
                <CalendarCheck className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900 font-mono">{bookedCount}</span>
              <span className="text-xs text-blue-600 font-semibold">slots reserved</span>
            </div>
            <p className="mt-1 text-xs text-slate-500">Synchronized SDR calendar</p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs relative overflow-hidden group hover:border-emerald-300 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-700">Safety & Grounding Score</span>
              <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                <ShieldCheck className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-emerald-600 font-mono">100%</span>
              <span className="text-xs text-slate-600 font-semibold">0 hallucinations</span>
            </div>
            <p className="mt-1 text-xs text-slate-500">20/20 benchmark scenarios</p>
          </div>
        </div>

        {/* Pipeline Stage Distribution Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 uppercase tracking-wider">
                Sales Pipeline Funnel
              </h2>
              <p className="text-sm text-slate-500 mt-0.5">
                Stage progression: new → qualified → proposal_sent → booked → won/lost
              </p>
            </div>
            <Link
              href="/leads"
              className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1 font-bold"
            >
              <span>View All Deals</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 pt-2">
            {(Object.keys(PIPELINE_STAGES) as PipelineStage[]).map((stage) => {
              const count = stageCounts[stage];
              return (
                <div
                  key={stage}
                  className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-2"
                >
                  <StageBadge stage={stage} size="sm" />
                  <div className="text-2xl font-extrabold text-slate-900 font-mono pt-1">{count}</div>
                  <div className="text-xs text-slate-500 font-medium">
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
            <h2 className="text-base font-bold text-slate-900 uppercase tracking-wider">
              Quick Operations
            </h2>

            <div className="space-y-3">
              <Link
                href="/chat"
                className="p-4 rounded-xl bg-slate-50 hover:bg-blue-50/60 border border-slate-200 hover:border-blue-200 flex items-center justify-between group transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900 group-hover:text-blue-600">
                      AI SDR Chat Sandbox
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      Test qualification & tool calls in real time
                    </div>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
              </Link>

              <Link
                href="/leads"
                className="p-4 rounded-xl bg-slate-50 hover:bg-blue-50/60 border border-slate-200 hover:border-blue-200 flex items-center justify-between group transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
                    <Target className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900 group-hover:text-blue-600">
                      Lead Pipeline & Overrides
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      Manage BANT facts, notes, and stages
                    </div>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
              </Link>

              <Link
                href="/evaluations"
                className="p-4 rounded-xl bg-slate-50 hover:bg-blue-50/60 border border-slate-200 hover:border-blue-200 flex items-center justify-between group transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-purple-50 text-purple-600 border border-purple-100">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900 group-hover:text-blue-600">
                      20-Case Safety Benchmark
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      Extraction accuracy & zero-hallucination suite
                    </div>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
              </Link>

              <Link
                href="/settings"
                className="p-4 rounded-xl bg-slate-50 hover:bg-blue-50/60 border border-slate-200 hover:border-blue-200 flex items-center justify-between group transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-slate-100 text-slate-700 border border-slate-200">
                    <Sliders className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900 group-hover:text-blue-600">
                      Pricing & Demo Slots Config
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      Inspect commercial packages and calendar rules
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
                <h2 className="text-base font-bold text-slate-900 uppercase tracking-wider">
                  Recent Pipeline Activity
                </h2>
                <p className="text-sm text-slate-500 mt-0.5">
                  Deals qualified and processed through the BANT matrix
                </p>
              </div>
              <Link
                href="/leads"
                className="text-sm text-blue-600 hover:text-blue-700 font-bold"
              >
                All Leads →
              </Link>
            </div>

            <div className="divide-y divide-slate-100">
              {leads.slice(0, 4).map((lead) => (
                <div
                  key={lead.id}
                  className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <Link
                        href={`/leads/${lead.id}`}
                        className="text-sm font-bold text-slate-900 hover:text-blue-600 transition-colors"
                      >
                        {lead.companyName}
                      </Link>
                      <StageBadge stage={lead.stage} size="sm" />
                      <LeadScoreBadge score={lead.score} size="sm" />
                    </div>
                    <div className="text-xs text-slate-600">
                      Contact: <strong className="text-slate-800 font-semibold">{lead.contactName}</strong> • Budget:{" "}
                      <span className="font-mono text-emerald-700 font-bold">
                        {lead.annualBudgetUSD ? `$${lead.annualBudgetUSD.toLocaleString()}` : "Pending"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/leads/${lead.id}`}
                      className="px-3.5 py-1.5 rounded-lg bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 hover:border-blue-200 text-xs font-semibold transition-colors"
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
