import { PackageTier } from "@/config/packages";
import { PipelineStage } from "./pipeline";

/**
 * Tool 1: extractLead
 * Extracts structured BANT facts & identifies unknown fields from dialogue turns.
 */
export interface ExtractLeadInput {
  conversationId: string;
  transcript: Array<{ role: "user" | "assistant"; content: string }>;
  currentFacts?: Partial<LeadFacts>;
}

export interface LeadFacts {
  contactName?: string;
  contactEmail?: string;
  companyName?: string;
  companySize?: string;
  role?: string;
  isDecisionMaker?: boolean;
  annualBudgetUSD?: number;
  timeline?: "immediate" | "1_month" | "next_quarter" | "exploring" | "unknown";
  primaryPainPoint?: string;
  targetChannels?: string[];
  techStack?: string[];
}

export interface ExtractLeadOutput {
  extractedFacts: LeadFacts;
  unknownFields: Array<keyof LeadFacts>;
  confidenceScore: number; // 0.0 - 1.0
  summary: string;
}

/**
 * Tool 2: scoreLead
 * Scores lead suitability (0-100) and assigns initial pipeline stage.
 */
export interface ScoreLeadInput {
  facts: LeadFacts;
}

export interface ScoreBreakdown {
  budgetScore: number;    // 0-35
  authorityScore: number; // 0-25
  needScore: number;      // 0-25
  timelineScore: number;  // 0-15
}

export interface ScoreLeadOutput {
  totalScore: number; // 0 - 100
  breakdown: ScoreBreakdown;
  recommendedStage: PipelineStage;
  qualificationStatus: "qualified" | "needs_info" | "disqualified";
  riskFlags: string[];
  rationale: string;
}

/**
 * Tool 3: suggestOffer
 * Selects strictly grounded tier and pricing based on packages configuration.
 */
export interface SuggestOfferInput {
  facts: LeadFacts;
  score: number;
}

export interface SuggestOfferOutput {
  selectedTier: PackageTier["id"];
  tierName: string;
  billingFrequency: "monthly" | "annual";
  priceUSD: number;
  valueProposition: string;
  includedFeatures: string[];
  isGroundedInConfig: true;
  appliedDiscountPercent: 0; // Strictly 0: no hallucinated discounts
}

/**
 * Tool 4: bookSlot
 * Confirms SDR demo booking in an available calendar slot.
 */
export interface BookSlotInput {
  slotId: string;
  contactName: string;
  contactEmail: string;
  companyName: string;
  notes?: string;
}

export interface BookSlotOutput {
  bookingId: string;
  slotId: string;
  confirmedStartTime: string;
  confirmedEndTime: string;
  assignedRep: string;
  assignedRepEmail: string;
  meetingLink: string;
  status: "confirmed" | "conflict_detected" | "error";
  confirmationMessage: string;
}

/**
 * Tool 5: handoffToHuman
 * Triggers escalation to live SDR when guardrails fire, lead requests human, or deal requires custom scope.
 */
export interface HandoffToHumanInput {
  conversationId: string;
  reason: "guardrail_triggered" | "customer_requested" | "complex_enterprise_deal" | "dispute";
  urgency: "low" | "medium" | "high";
  contextSummary: string;
  lastUserMessage: string;
}

export interface HandoffToHumanOutput {
  ticketId: string;
  assignedTeam: "sales_engineering" | "security_officer" | "tier_3_support";
  handoffStatus: "queued" | "assigned";
  messageToUser: string;
  timestamp: string;
}

/**
 * Generic Tool Call envelope for AI agent turns
 */
export type ToolName = "extractLead" | "scoreLead" | "suggestOffer" | "bookSlot" | "handoffToHuman";

export interface ToolExecutionRecord<TInput = unknown, TOutput = unknown> {
  toolName: ToolName;
  input: TInput;
  output: TOutput;
  executedAt: string;
  durationMs: number;
  success: boolean;
  error?: string;
}
