/**
 * LeadPilot Sales Pipeline Stages
 * Strict requirement: new → qualified → proposal_sent → booked → won/lost
 */

export type PipelineStage = "new" | "qualified" | "proposal_sent" | "booked" | "won" | "lost";

export interface StageDefinition {
  id: PipelineStage;
  label: string;
  order: number;
  description: string;
  colorScheme: {
    bg: string;
    text: string;
    border: string;
    dot: string;
  };
}

export const PIPELINE_STAGES: Record<PipelineStage, StageDefinition> = {
  new: {
    id: "new",
    label: "New",
    order: 1,
    description: "Initial inbound contact, conversation initiated, qualification in progress",
    colorScheme: {
      bg: "bg-blue-50",
      text: "text-blue-700",
      border: "border-blue-200",
      dot: "bg-blue-600",
    },
  },
  qualified: {
    id: "qualified",
    label: "Qualified",
    order: 2,
    description: "BANT criteria satisfied (Budget >= $5k, clear Need, Authority established)",
    colorScheme: {
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      border: "border-emerald-200",
      dot: "bg-emerald-600",
    },
  },
  proposal_sent: {
    id: "proposal_sent",
    label: "Proposal Sent",
    order: 3,
    description: "Recommended tier and pricing package presented to lead",
    colorScheme: {
      bg: "bg-indigo-50",
      text: "text-indigo-700",
      border: "border-indigo-200",
      dot: "bg-indigo-600",
    },
  },
  booked: {
    id: "booked",
    label: "Booked",
    order: 4,
    description: "Confirmed calendar demo slot booked with sales engineering",
    colorScheme: {
      bg: "bg-purple-50",
      text: "text-purple-700",
      border: "border-purple-200",
      dot: "bg-purple-600",
    },
  },
  won: {
    id: "won",
    label: "Won",
    order: 5,
    description: "Contract executed, customer onboarded successfully",
    colorScheme: {
      bg: "bg-teal-50",
      text: "text-teal-700",
      border: "border-teal-200",
      dot: "bg-teal-600",
    },
  },
  lost: {
    id: "lost",
    label: "Lost",
    order: 5,
    description: "Disqualified due to budget, timing mismatch, or competitor selection",
    colorScheme: {
      bg: "bg-rose-50",
      text: "text-rose-700",
      border: "border-rose-200",
      dot: "bg-rose-600",
    },
  },
};

export const PIPELINE_STAGE_ORDER: PipelineStage[] = [
  "new",
  "qualified",
  "proposal_sent",
  "booked",
  "won",
  "lost",
];

export interface StageOverrideAction {
  targetStage: PipelineStage;
  reason: string;
  adminId: string;
  timestamp: string;
}

export interface LeadNote {
  id: string;
  author: string;
  role: "admin" | "sdr" | "ai_system";
  content: string;
  createdAt: string;
}
