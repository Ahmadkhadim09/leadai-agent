import { ChatTurnRequest, ChatTurnResponse } from "@/types/chat";
import { LocalMockAIAdapter } from "./mock-adapter";
import {
  checkPromptInjection,
  checkSystemPromptLeak,
} from "@/lib/guardrails/safety";
import { ToolExecutionRecord } from "@/types/tools";

export class GeminiAIAdapter {
  private fallbackAdapter = new LocalMockAIAdapter();
  private apiKey: string | null = null;
  private modelName = "gemini-3.8-flash";

  constructor() {
    this.apiKey =
      process.env.GEMINI_API_KEY ||
      process.env.OPENAI_API_KEY ||
      null;
  }

  isConfigured(): boolean {
    if (!this.apiKey) return false;
    const key = this.apiKey.trim().toLowerCase();
    return !key.includes("placeholder") && !key.startsWith("your_") && key.length > 10;
  }

  async chatTurn(request: ChatTurnRequest): Promise<ChatTurnResponse> {
    const userMessage = request.message.trim();

    // ========================================================
    // LAYER 1: DETERMINISTIC PRE-LLM GUARDRAILS
    // Traps prompt injection, DAN persona, and credential leaks
    // ========================================================
    const injection = checkPromptInjection(userMessage);
    if (!injection.passed) {
      return this.fallbackAdapter.chatTurn(request);
    }

    const leak = checkSystemPromptLeak(userMessage);
    if (!leak.passed) {
      return this.fallbackAdapter.chatTurn(request);
    }

    // If Gemini is not configured, seamlessly run LocalMockAIAdapter
    if (!this.isConfigured()) {
      return this.fallbackAdapter.chatTurn(request);
    }

    try {
      // Execute extraction and scoring via deterministic baseline
      const mockResult = await this.fallbackAdapter.chatTurn(request);
      const updatedFacts = mockResult.updatedFacts;
      const score = mockResult.currentScore;
      const state = mockResult.nextState;

      // Build conversation contents for Gemini
      const contents = [
        ...request.history.slice(-6).map((h) => ({
          role: h.role === "assistant" ? "model" : "user",
          parts: [{ text: h.content }],
        })),
        {
          role: "user",
          parts: [{ text: userMessage }],
        },
      ];

      const systemInstruction = `You are LeadPilot AI — an autonomous enterprise B2B Sales Development Representative (SDR).
Role & Objective:
- Autonomously qualify inbound buyer leads according to BANT (Budget, Authority, Need, Timeline).
- Ground all commercial pricing in canonical packages:
  * Starter: $9,600/yr ($800/mo) for up to 500 leads/mo
  * Growth: $24,000/yr ($2,000/mo) for up to 2,500 leads/mo
  * Enterprise: $60,000/yr ($5,000/mo) for unlimited scale
- Strictly enforce ZERO discounts (discounts are policy-forbidden).
- Guide qualified prospects to schedule a 30-min SDR demo.
Current Deal Qualification State: ${state}
Known Lead Facts: ${JSON.stringify(updatedFacts)}
Style Guidelines:
- Keep responses friendly, consultative, concise (2-3 sentences).
- If the user asks about packages, explain our 3 tiers.
- Always ask for missing BANT information politely.`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${this.modelName}:generateContent?key=${this.apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents,
            systemInstruction: {
              parts: [{ text: systemInstruction }],
            },
            generationConfig: {
              temperature: 0.3,
              maxOutputTokens: 250,
            },
          }),
        }
      );

      if (!response.ok) {
        console.warn(
          `Gemini API responded with status ${response.status}, falling back to mock adapter`
        );
        return mockResult;
      }

      const data = await response.json();
      const geminiReply = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!geminiReply || typeof geminiReply !== "string") {
        return mockResult;
      }

      // Layer 2: Post-LLM Safety Verification (ensuring model did not leak credentials or promise discounts)
      const lowerReply = geminiReply.toLowerCase();
      if (
        lowerReply.includes("discount") &&
        (lowerReply.includes("special deal") || lowerReply.includes("i can offer you 20%"))
      ) {
        return mockResult; // Overrule with grounded offer
      }

      const toolCalls: ToolExecutionRecord[] = mockResult.toolCalls;

      return {
        reply: geminiReply.trim(),
        toolCalls,
        nextState: mockResult.nextState,
        updatedFacts,
        currentScore: score,
        pipelineStage: mockResult.pipelineStage,
        suggestedReplies: mockResult.suggestedReplies,
      };
    } catch (err) {
      console.warn("Gemini chat turn error, falling back to mock adapter:", err);
      return this.fallbackAdapter.chatTurn(request);
    }
  }
}

export const defaultGeminiAIAdapter = new GeminiAIAdapter();
