import { z } from "zod";
import { LeadFactsSchema, PipelineStageSchema } from "./tools.schema";

export const QualificationStateSchema = z.enum([
  "GREETING",
  "COLLECTING_BANT",
  "OFFERING_PROPOSAL",
  "SCHEDULING_DEMO",
  "BOOKED",
  "HANDED_OFF",
  "DISQUALIFIED",
]);

export const ChatMessageSchema = z.object({
  id: z.string(),
  role: z.enum(["user", "assistant", "system"]),
  content: z.string(),
  timestamp: z.string(),
  suggestedReplies: z.array(z.string()).optional(),
  toolCalls: z.array(z.any()).optional(),
  state: QualificationStateSchema.optional(),
  isError: z.boolean().optional(),
});

export const ChatTurnRequestSchema = z.object({
  conversationId: z.string().min(1),
  message: z.string().min(1),
  history: z.array(ChatMessageSchema),
  currentFacts: LeadFactsSchema.partial().optional(),
  currentState: QualificationStateSchema.optional(),
});

export const ChatTurnResponseSchema = z.object({
  reply: z.string(),
  toolCalls: z.array(z.any()),
  nextState: QualificationStateSchema,
  updatedFacts: LeadFactsSchema,
  currentScore: z.number().optional(),
  pipelineStage: PipelineStageSchema,
  suggestedReplies: z.array(z.string()),
  guardrailAlert: z
    .object({
      type: z.string(),
      details: z.string(),
      actionTaken: z.enum(["blocked", "redirected", "flagged"]),
    })
    .optional(),
});
