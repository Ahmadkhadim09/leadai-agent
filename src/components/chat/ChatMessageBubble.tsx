"use client";

import React from "react";
import { ChatMessage } from "@/types/chat";
import { Bot, User, AlertCircle, ShieldAlert } from "lucide-react";
import { ToolCallDrawer } from "./ToolCallDrawer";

interface ChatMessageBubbleProps {
  message: ChatMessage;
}

export function ChatMessageBubble({ message }: ChatMessageBubbleProps) {
  const isAssistant = message.role === "assistant";
  const isSystem = message.role === "system";

  if (isSystem) {
    return (
      <div className="flex justify-center my-3">
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-xs text-amber-800 shadow-xs">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
          <span>{message.content}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex gap-3 my-4 ${isAssistant ? "justify-start" : "justify-end"}`}>
      {isAssistant && (
        <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0 mt-0.5 text-blue-600">
          <Bot className="w-4 h-4" />
        </div>
      )}

      <div className="max-w-[85%] md:max-w-[75%] space-y-1">
        <div
          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-xs ${
            isAssistant
              ? message.isError
                ? "bg-rose-50 border border-rose-200 text-rose-900"
                : "bg-white border border-slate-200 text-slate-800"
              : "bg-blue-600 text-white rounded-br-xs"
          }`}
        >
          {message.isError && (
            <div className="flex items-center gap-1.5 text-rose-600 text-xs font-semibold mb-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Guardrail Enforcement</span>
            </div>
          )}

          <div className="whitespace-pre-line text-sm">{message.content}</div>

          {isAssistant && message.toolCalls && message.toolCalls.length > 0 && (
            <ToolCallDrawer toolCalls={message.toolCalls} />
          )}
        </div>

        <div
          className={`flex items-center gap-2 text-[10px] text-slate-400 px-1 ${
            isAssistant ? "justify-start" : "justify-end"
          }`}
        >
          <span>
            {new Date(message.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
          {message.state && (
            <span className="font-mono text-slate-500 uppercase">
              • {message.state}
            </span>
          )}
        </div>
      </div>

      {!isAssistant && (
        <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 mt-0.5 text-slate-700">
          <User className="w-4 h-4" />
        </div>
      )}
    </div>
  );
}
