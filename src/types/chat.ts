import { ToolExecutionRecord } from "./tools";
import { LeadFacts } from "./tools";
import { PipelineStage } from "./pipeline";

/**
 * Strict Qualification States:
 * Free-form chatting that skips qualification is prevented by state transitions.
 */
export type QualificationState =
  | "GREETING"
  | "COLLECTING_BANT"
  | "OFFERING_PROPOSAL"
  | "SCHEDULING_DEMO"
  | "BOOKED"
  | "HANDED_OFF"
  | "DISQUALIFIED";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  suggestedReplies?: string[];
  toolCalls?: ToolExecutionRecord[];
  state?: QualificationState;
  isError?: boolean;
}

export interface ChatTurnRequest {
  conversationId: string;
  message: string;
  history: ChatMessage[];
  currentFacts?: Partial<LeadFacts>;
  currentState?: QualificationState;
}

export interface ChatTurnResponse {
  reply: string;
  toolCalls: ToolExecutionRecord[];
  nextState: QualificationState;
  updatedFacts: LeadFacts;
  currentScore?: number;
  pipelineStage: PipelineStage;
  suggestedReplies: string[];
  guardrailAlert?: {
    type: string;
    details: string;
    actionTaken: "blocked" | "redirected" | "flagged";
  };
}

export interface IChatService {
  chatTurn(request: ChatTurnRequest): Promise<ChatTurnResponse>;
}
