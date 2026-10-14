"use client";

import React, { useState } from "react";
import { PipelineStage, PIPELINE_STAGE_ORDER, PIPELINE_STAGES } from "@/types/pipeline";
import { StageBadge } from "./StageBadge";
import { ShieldCheck, Lock, AlertCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/features/auth/AuthContext";
import { AuthModal } from "@/features/auth/AuthModal";

interface StageSelectorProps {
  currentStage: PipelineStage;
  leadId: string;
  onStageChange: (newStage: PipelineStage, reason: string) => Promise<void> | void;
}

export function StageSelector({ currentStage, leadId, onStageChange }: StageSelectorProps) {
  const { user, isAdmin, getIdToken } = useAuth();
  const [selectedStage, setSelectedStage] = useState<PipelineStage>(currentStage);
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleApplyOverride = async () => {
    if (selectedStage === currentStage) return;
    if (!reason.trim()) {
      setErrorMessage("Please provide an administrative reason for the stage override.");
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const token = await getIdToken();

      // Call protected server-side API endpoint with bearer token
      const res = await fetch(`/api/leads/${leadId}/stage`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          targetStage: selectedStage,
          reason: reason.trim(),
          adminId: user?.email || "admin",
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Failed with status ${res.status}`);
      }

      await onStageChange(selectedStage, reason);
      setIsOpen(false);
      setReason("");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to commit stage override.";
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-blue-600" />
          <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Admin Stage Control
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Current:</span>
          <StageBadge stage={currentStage} size="sm" />
        </div>
      </div>

      {/* Unauthenticated / Unauthorized State */}
      {!isAdmin ? (
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
          <div className="flex items-start gap-2.5 text-slate-600">
            <Lock className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-bold text-slate-900">Admin Authorization Required</span>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Stage overrides are protected operations. Sign in with an administrator account to commit stage transitions.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setAuthModalOpen(true)}
            className="w-full py-2 px-3 bg-white hover:bg-slate-100 text-blue-700 border border-slate-300 rounded-lg text-xs font-semibold transition-colors shadow-xs"
          >
            Sign In as Admin
          </button>
        </div>
      ) : !isOpen ? (
        <button
          onClick={() => {
            setSelectedStage(currentStage);
            setErrorMessage(null);
            setIsOpen(true);
          }}
          className="w-full py-2 px-3 bg-blue-50 hover:bg-blue-100 text-xs font-semibold text-blue-700 rounded-xl transition-colors border border-blue-200 shadow-xs"
        >
          Override Stage Manually
        </button>
      ) : (
        <div className="pt-2 border-t border-slate-100 space-y-3">
          {errorMessage && (
            <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Select New Stage
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {PIPELINE_STAGE_ORDER.map((stage) => {
                const isSelected = selectedStage === stage;
                const def = PIPELINE_STAGES[stage];
                return (
                  <button
                    key={stage}
                    type="button"
                    onClick={() => setSelectedStage(stage)}
                    className={`py-1.5 px-2 rounded-lg text-xs font-medium border text-center transition-all ${
                      isSelected
                        ? "bg-blue-50 text-blue-700 border-blue-500 font-semibold shadow-xs"
                        : "bg-white text-slate-600 border-slate-200 hover:text-slate-900"
                    }`}
                  >
                    {def.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Override Reason (Audit Log)
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., Enterprise MSA signed via external sales team"
              className="w-full text-xs px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-blue-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                setErrorMessage(null);
              }}
              className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isSubmitting || selectedStage === currentStage}
              onClick={handleApplyOverride}
              className="px-3.5 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Committing...</span>
                </>
              ) : (
                <span>Commit Override</span>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
