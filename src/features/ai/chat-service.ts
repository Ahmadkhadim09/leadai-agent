import { IChatService, ChatTurnRequest, ChatTurnResponse } from "@/types/chat";
import { defaultMockAIAdapter } from "./mock-adapter";
import { defaultGeminiAIAdapter } from "./gemini-adapter";

/**
 * Production ChatService
 * 
 * Automatically routes customer conversation turns through GeminiAIAdapter
 * when an API key is configured in the environment, with seamless fallback
 * to LocalMockAIAdapter during offline development and testing.
 */
export class ChatService implements IChatService {
  async chatTurn(request: ChatTurnRequest): Promise<ChatTurnResponse> {
    if (defaultGeminiAIAdapter.isConfigured()) {
      return defaultGeminiAIAdapter.chatTurn(request);
    }
    return defaultMockAIAdapter.chatTurn(request);
  }
}

export const chatService = new ChatService();
