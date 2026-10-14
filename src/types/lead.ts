import { PipelineStage, LeadNote, StageOverrideAction } from "./pipeline";
import { LeadFacts } from "./tools";
import { ChatMessage } from "./chat";

export interface Lead {
  id: string;
  contactName: string;
  contactEmail: string;
  companyName: string;
  stage: PipelineStage;
  score: number; // 0 - 100
  timeline: LeadFacts["timeline"];
  annualBudgetUSD?: number;
  extractedFacts: LeadFacts;
  unknownFields: Array<keyof LeadFacts>;
  riskFlags: string[];
  conversationHistory: ChatMessage[];
  notes: LeadNote[];
  stageOverrides: StageOverrideAction[];
  assignedRep?: string;
  bookedSlotId?: string;
  createdAt: string;
  updatedAt: string;
  isMockData?: boolean;
}

export type LeadSortField = "score" | "companyName" | "stage" | "updatedAt";
export type LeadSortDirection = "asc" | "desc";

export interface LeadFilterOptions {
  searchQuery?: string;
  stage?: PipelineStage | "all";
  minScore?: number;
  riskOnly?: boolean;
}
