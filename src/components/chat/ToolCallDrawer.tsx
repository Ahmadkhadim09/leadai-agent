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
    <div className="mt-3 rounded-xl border border-blue-200 bg-blue-50/60 overflow-hidden text-xs">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3.5 py-2 flex items-center justify-between text-blue-900 hover:bg-blue-100/60 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Wrench className="w-3.5 h-3.5 text-blue-600" />
          <span className="font-semibold text-blue-900">
            AI Tool Action ({toolCalls.length})
          </span>
          <span className="text-[11px] text-blue-700 font-mono hidden sm:inline">
            {toolCalls.map((t) => `${t.toolName}()`).join(" → ")}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-blue-700 font-medium">
          <span>{isOpen ? "Hide Details" : "View Output"}</span>
          {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </div>
      </button>

      {isOpen && (
        <div className="p-3 border-t border-blue-200 space-y-3 bg-white">
          {toolCalls.map((tool, idx) => (
            <div
              key={idx}
              className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-2 font-mono text-[11px]"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold text-blue-700">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{tool.toolName}()</span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-slate-500">
                  <Clock className="w-3 h-3" />
                  <span>{tool.durationMs}ms</span>
                </div>
              </div>

              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-sans font-semibold tracking-wider mb-1">
                  Validated Typed JSON Output:
                </span>
                <pre className="p-2.5 rounded-lg bg-slate-900 text-emerald-400 overflow-x-auto text-[10px] leading-tight max-h-40">
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
