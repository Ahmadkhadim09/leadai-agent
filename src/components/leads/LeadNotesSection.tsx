"use client";

import React, { useState } from "react";
import { LeadNote } from "@/types/pipeline";
import { MessageSquarePlus, Clock, User, Send, Bot, Lock, AlertCircle, Loader2 } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { useAuth } from "@/features/auth/AuthContext";
import { AuthModal } from "@/features/auth/AuthModal";

interface LeadNotesSectionProps {
  notes: LeadNote[];
  leadId: string;
  onAddNote: (content: string, author: string) => Promise<void> | void;
}

export function LeadNotesSection({ notes, leadId, onAddNote }: LeadNotesSectionProps) {
  const { user, isAuthenticated, getIdToken } = useAuth();
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !isAuthenticated) return;

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const token = await getIdToken();
      const author = user?.displayName || user?.email || "Authenticated User";

      // Call protected server-side API endpoint with bearer token
      const res = await fetch(`/api/leads/${leadId}/notes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: content.trim(),
          author,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Failed with status ${res.status}`);
      }

      await onAddNote(content.trim(), author);
      setContent("");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save note.";
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquarePlus className="w-4 h-4 text-blue-600" />
          <h3 className="font-bold text-slate-900 text-sm">Internal Collaboration & Notes</h3>
        </div>
        <span className="text-xs text-slate-500 font-semibold">
          {notes.length} {notes.length === 1 ? "entry" : "entries"}
        </span>
      </div>

      {errorMessage && (
        <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Note Input Form / Unauthenticated prompt */}
      {!isAuthenticated ? (
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-slate-600">
            <Lock className="w-4 h-4 text-amber-500 shrink-0" />
            <span className="text-xs">Sign in to collaborate and contribute deal notes.</span>
          </div>
          <button
            type="button"
            onClick={() => setAuthModalOpen(true)}
            className="px-3.5 py-1.5 bg-white hover:bg-slate-100 text-blue-700 border border-slate-300 rounded-lg text-xs font-bold transition-colors shrink-0 shadow-xs"
          >
            Sign In
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-2.5">
          <textarea
            rows={3}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Add an internal note or context before the upcoming demo..."
            className="w-full text-sm p-3.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 resize-none shadow-xs font-normal"
          />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
              <User className="w-4 h-4 text-blue-600" />
              <span>
                Posting as:{" "}
                <strong className="text-slate-900 font-semibold">{user?.displayName || user?.email}</strong>
              </span>
            </div>
            <button
              type="submit"
              disabled={isSubmitting || !content.trim()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Add Note</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Notes List */}
      <div className="space-y-3 pt-2 border-t border-slate-100">
        {notes.length === 0 ? (
          <p className="text-xs text-slate-400 py-3 text-center">
            No internal notes recorded yet. Add one above.
          </p>
        ) : (
          notes.map((note) => (
            <div
              key={note.id}
              className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2"
            >
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  {note.role === "ai_system" ? (
                    <Bot className="w-4 h-4 text-blue-600" />
                  ) : (
                    <User className="w-4 h-4 text-slate-500" />
                  )}
                  <span>{note.author}</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-600 uppercase font-mono font-bold">
                    {note.role}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-slate-400 text-xs font-medium">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{formatDate(note.createdAt)}</span>
                </div>
              </div>
              <p className="text-slate-800 text-sm leading-relaxed pl-6 font-normal">{note.content}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
