"use client";

import React, { useState } from "react";
import { ToolExecutionRecord } from "@/types/tools";
import { ChevronDown, ChevronUp, Wrench, CheckCircle2, Clock } from "lucide-react";

interface ToolCallDrawerProps {
  toolCalls?: ToolExecutionRecord[];
}

export function ToolCallDrawer({ toolCalls }: ToolCallDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!toolCalls || toolCalls.length === 0) return null;

  return (
    <div className="mt-3 rounded-xl border border-blue-200 bg-blue-50/60 overflow-hidden text-sm">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2.5 flex items-center justify-between text-blue-900 hover:bg-blue-100/60 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Wrench className="w-4 h-4 text-blue-600" />
          <span className="font-bold text-blue-900 text-sm">
            AI Tool Action ({toolCalls.length})
          </span>
          <span className="text-xs text-blue-700 font-mono font-semibold hidden sm:inline">
            {toolCalls.map((t) => `${t.toolName}()`).join(" → ")}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-blue-700 font-semibold">
          <span>{isOpen ? "Hide Details" : "View Output"}</span>
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {isOpen && (
        <div className="p-3.5 border-t border-blue-200 space-y-3 bg-white">
          {toolCalls.map((tool, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 font-mono text-xs"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold text-blue-700 text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{tool.toolName}()</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-slate-500 font-sans">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{tool.durationMs}ms</span>
                </div>
              </div>

              <div>
                <span className="text-slate-600 block text-xs uppercase font-sans font-bold tracking-wider mb-1.5">
                  Validated Typed JSON Output:
                </span>
                <pre className="p-3 rounded-xl bg-slate-900 text-emerald-400 overflow-x-auto text-xs leading-normal max-h-48 font-mono">
                  {JSON.stringify(tool.output, null, 2)}
                </pre>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
