"use client";

import React from "react";
import { Sparkles } from "lucide-react";

interface SuggestedRepliesProps {
  replies: string[];
  onSelect: (reply: string) => void;
  disabled?: boolean;
}

export function SuggestedReplies({ replies, onSelect, disabled }: SuggestedRepliesProps) {
  if (!replies || replies.length === 0) return null;

  return (
    <div className="py-2 flex flex-wrap items-center gap-1.5">
      <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 mr-1">
        <Sparkles className="w-3.5 h-3.5 text-blue-600" />
        <span>Suggested:</span>
      </div>
      {replies.map((reply, idx) => (
        <button
          key={idx}
          type="button"
          disabled={disabled}
          onClick={() => onSelect(reply)}
          className="text-xs px-3 py-1 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 hover:border-blue-300 transition-all text-left disabled:opacity-50 font-medium shadow-xs"
        >
          {reply}
        </button>
      ))}
    </div>
  );
}
