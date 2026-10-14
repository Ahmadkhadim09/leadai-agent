"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Lead } from "@/types/lead";
import { PipelineStage } from "@/types/pipeline";
import { StageBadge } from "@/components/pipeline/StageBadge";
import { LeadScoreBadge } from "@/components/leads/LeadScoreBadge";
import { PipelineProgress } from "@/components/pipeline/PipelineProgress";
import { StageSelector } from "@/components/pipeline/StageSelector";
import { ExtractedFactsCard } from "@/components/leads/ExtractedFactsCard";
import { LeadNotesSection } from "@/components/leads/LeadNotesSection";
import { ChatMessageBubble } from "@/components/chat/ChatMessageBubble";
import {
  ArrowLeft,
  MessageSquare,
  History,
  ShieldCheck,
} from "lucide-react";

interface LeadDetailViewProps {
  initialLead: Lead;
}

export function LeadDetailView({ initialLead }: LeadDetailViewProps) {
  const [lead, setLead] = useState<Lead>(initialLead);
  const [activeTab, setActiveTab] = useState<"overview" | "history">("overview");

  const handleStageChange = async (newStage: PipelineStage, reason: string) => {
    // Local state update
    const updated: Lead = {
      ...lead,
      stage: newStage,
      stageOverrides: [
        ...lead.stageOverrides,
        {
          targetStage: newStage,
          reason,
          adminId: "admin-sdr-lead",
          timestamp: new Date().toISOString(),
        },
      ],
      updatedAt: new Date().toISOString(),
    };
    setLead(updated);
  };

  const handleAddNote = async (content: string, author: string) => {
    const updated: Lead = {
      ...lead,
      notes: [
        ...lead.notes,
        {
          id: `note-${Date.now()}`,
          author,
          role: "admin",
          content,
          createdAt: new Date().toISOString(),
        },
      ],
      updatedAt: new Date().toISOString(),
    };
    setLead(updated);
  };

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/leads"
            className="p-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-200 transition-colors shadow-xs"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-bold text-slate-900">{lead.companyName}</h1>
              <StageBadge stage={lead.stage} size="sm" />
              <LeadScoreBadge score={lead.score} size="sm" />
            </div>
            <p className="text-sm text-slate-600 mt-0.5">
              Contact: <strong className="text-slate-800 font-semibold">{lead.contactName}</strong> ({lead.contactEmail})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="p-1 rounded-xl bg-white border border-slate-200 flex items-center text-sm shadow-xs">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-4 py-2 rounded-lg font-bold transition-colors ${
                activeTab === "overview"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Deal Overview & Facts
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`px-4 py-2 rounded-lg font-bold transition-colors flex items-center gap-1.5 ${
                activeTab === "history"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <History className="w-4 h-4" />
              <span>Conversation ({lead.conversationHistory.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Visual Pipeline Progression */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
          Pipeline Progression Flow
        </h2>
        <PipelineProgress currentStage={lead.stage} />
      </div>

      {activeTab === "overview" ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Facts, Unknowns, and Risks */}
          <div className="lg:col-span-2 space-y-6">
            <ExtractedFactsCard
              facts={lead.extractedFacts}
              unknownFields={lead.unknownFields}
              riskFlags={lead.riskFlags}
            />

            {/* Conversation Snapshot preview */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-blue-600" />
                  <h3 className="font-bold text-slate-900 text-sm">Dialogue Transcript Snapshot</h3>
                </div>
                <button
                  onClick={() => setActiveTab("history")}
                  className="text-xs text-blue-600 hover:text-blue-700 font-semibold"
                >
                  View All {lead.conversationHistory.length} Turns →
                </button>
              </div>

              {lead.conversationHistory.length === 0 ? (
                <p className="text-xs text-slate-400 py-3">No dialogue transcript captured.</p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1 bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                  {lead.conversationHistory.slice(-3).map((msg) => (
                    <ChatMessageBubble key={msg.id} message={msg} />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Stage Controls, Overrides, and Notes */}
          <div className="space-y-6">
            <StageSelector
              currentStage={lead.stage}
              leadId={lead.id}
              onStageChange={handleStageChange}
            />

            {/* Stage Override Audit Trail */}
            {lead.stageOverrides && lead.stageOverrides.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                  <span>Audit Trail (Stage Overrides)</span>
                </div>
                <div className="space-y-2">
                  {lead.stageOverrides.map((override, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <StageBadge stage={override.targetStage} size="sm" />
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(override.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-slate-800 font-medium">&ldquo;{override.reason}&rdquo;</p>
                      <span className="text-[10px] text-slate-500 block">
                        Admin: {override.adminId}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <LeadNotesSection
              notes={lead.notes}
              leadId={lead.id}
              onAddNote={handleAddNote}
            />
          </div>
        </div>
      ) : (
        /* Conversation Full History Tab */
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900">
              Complete Conversation Audit Log
            </h2>
            <span className="text-xs text-slate-500 font-mono font-medium">
              Total Turns: {lead.conversationHistory.length}
            </span>
          </div>

          <div className="space-y-2 max-w-3xl mx-auto py-2">
            {lead.conversationHistory.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">
                No conversation history available for this lead.
              </p>
            ) : (
              lead.conversationHistory.map((msg) => (
                <ChatMessageBubble key={msg.id} message={msg} />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
