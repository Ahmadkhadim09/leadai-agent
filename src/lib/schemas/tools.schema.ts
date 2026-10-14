import { z } from "zod";

export const LeadTimelineSchema = z.enum([
  "immediate",
  "1_month",
  "next_quarter",
  "exploring",
  "unknown",
]);

export const LeadFactsSchema = z.object({
  contactName: z.string().min(1).optional(),
  contactEmail: z.string().email().optional(),
  companyName: z.string().min(1).optional(),
  companySize: z.string().optional(),
  role: z.string().optional(),
  isDecisionMaker: z.boolean().optional(),
  annualBudgetUSD: z.number().nonnegative().optional(),
  timeline: LeadTimelineSchema.optional(),
  primaryPainPoint: z.string().optional(),
  targetChannels: z.array(z.string()).optional(),
  techStack: z.array(z.string()).optional(),
});

export const PipelineStageSchema = z.enum([
  "new",
  "qualified",
  "proposal_sent",
  "booked",
  "won",
  "lost",
]);

// 1. extractLead schemas
export const ExtractLeadInputSchema = z.object({
  conversationId: z.string().min(1),
  transcript: z.array(
    z.object({
      role: z.enum(["user", "assistant"]),
      content: z.string(),
    })
  ),
  currentFacts: LeadFactsSchema.partial().optional(),
});

export const ExtractLeadOutputSchema = z.object({
  extractedFacts: LeadFactsSchema,
  unknownFields: z.array(z.string()),
  confidenceScore: z.number().min(0).max(1),
  summary: z.string(),
});

// 2. scoreLead schemas
export const ScoreLeadInputSchema = z.object({
  facts: LeadFactsSchema,
});

export const ScoreBreakdownSchema = z.object({
  budgetScore: z.number().min(0).max(35),
  authorityScore: z.number().min(0).max(25),
  needScore: z.number().min(0).max(25),
  timelineScore: z.number().min(0).max(15),
});

export const ScoreLeadOutputSchema = z.object({
  totalScore: z.number().min(0).max(100),
  breakdown: ScoreBreakdownSchema,
  recommendedStage: PipelineStageSchema,
  qualificationStatus: z.enum(["qualified", "needs_info", "disqualified"]),
  riskFlags: z.array(z.string()),
  rationale: z.string(),
});

// 3. suggestOffer schemas
export const SuggestOfferInputSchema = z.object({
  facts: LeadFactsSchema,
  score: z.number().min(0).max(100),
});

export const SuggestOfferOutputSchema = z.object({
  selectedTier: z.enum(["starter", "growth", "enterprise"]),
  tierName: z.string().min(1),
  billingFrequency: z.enum(["monthly", "annual"]),
  priceUSD: z.number().positive(),
  valueProposition: z.string(),
  includedFeatures: z.array(z.string()),
  isGroundedInConfig: z.literal(true),
  appliedDiscountPercent: z.literal(0),
});

// 4. bookSlot schemas
export const BookSlotInputSchema = z.object({
  slotId: z.string().min(1),
  contactName: z.string().min(1),
  contactEmail: z.string().email(),
  companyName: z.string().min(1),
  notes: z.string().optional(),
});

export const BookSlotOutputSchema = z.object({
  bookingId: z.string().min(1),
  slotId: z.string().min(1),
  confirmedStartTime: z.string(),
  confirmedEndTime: z.string(),
  assignedRep: z.string().min(1),
  assignedRepEmail: z.string().email(),
  meetingLink: z.string().url(),
  status: z.enum(["confirmed", "conflict_detected", "error"]),
  confirmationMessage: z.string(),
});

// 5. handoffToHuman schemas
export const HandoffToHumanInputSchema = z.object({
  conversationId: z.string().min(1),
  reason: z.enum([
    "guardrail_triggered",
    "customer_requested",
    "complex_enterprise_deal",
    "dispute",
  ]),
  urgency: z.enum(["low", "medium", "high"]),
  contextSummary: z.string(),
  lastUserMessage: z.string(),
});

export const HandoffToHumanOutputSchema = z.object({
  ticketId: z.string().min(1),
  assignedTeam: z.enum([
    "sales_engineering",
    "security_officer",
    "tier_3_support",
  ]),
  handoffStatus: z.enum(["queued", "assigned"]),
  messageToUser: z.string(),
  timestamp: z.string(),
});
