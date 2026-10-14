import { LeadFacts, ScoreLeadOutput, ScoreBreakdown } from "@/types/tools";
import { PipelineStage } from "@/types/pipeline";

export function scoreLeadFacts(facts: LeadFacts): ScoreLeadOutput {
  const breakdown: ScoreBreakdown = {
    budgetScore: 0,
    authorityScore: 0,
    needScore: 0,
    timelineScore: 0,
  };

  const riskFlags: string[] = [];
  const rationales: string[] = [];

  // 1. Budget Evaluation (0 - 35 points)
  const budget = facts.annualBudgetUSD ?? 0;
  if (budget >= 30000) {
    breakdown.budgetScore = 35;
    rationales.push("Enterprise-grade budget verified ($30k+).");
  } else if (budget >= 12000) {
    breakdown.budgetScore = 28;
    rationales.push("Growth tier budget verified ($12k-$30k).");
  } else if (budget >= 5000) {
    breakdown.budgetScore = 20;
    rationales.push("Starter budget satisfied ($5k-$12k).");
  } else if (budget > 0 && budget < 5000) {
    breakdown.budgetScore = 5;
    riskFlags.push("Sub-minimum annual budget (< $5,000 threshold)");
    rationales.push("Budget below entry threshold.");
  } else {
    breakdown.budgetScore = 0;
    riskFlags.push("Unconfirmed annual budget");
  }

  // 2. Authority / Decision Maker (0 - 25 points)
  if (facts.isDecisionMaker === true) {
    breakdown.authorityScore = 25;
    rationales.push("Contact is the direct economic decision maker.");
  } else if (facts.role && /vp|head|director|chief|c-level|founder|ceo|cro|cmo/i.test(facts.role)) {
    breakdown.authorityScore = 22;
    rationales.push(`Executive title '${facts.role}' indicates strong purchasing influence.`);
  } else if (facts.role && /manager|lead|senior/i.test(facts.role)) {
    breakdown.authorityScore = 15;
    rationales.push(`Middle management role '${facts.role}'. Secondary sign-off likely required.`);
  } else if (facts.isDecisionMaker === false) {
    breakdown.authorityScore = 8;
    riskFlags.push("Non-decision maker contact; executive champion required");
  } else {
    breakdown.authorityScore = 5;
    riskFlags.push("Decision maker status unverified");
  }

  // 3. Need & Pain Point Fit (0 - 25 points)
  if (facts.primaryPainPoint && facts.primaryPainPoint.trim().length > 10) {
    breakdown.needScore = 25;
    rationales.push(`High pain point alignment: "${facts.primaryPainPoint}".`);
  } else if (facts.targetChannels && facts.targetChannels.length > 0) {
    breakdown.needScore = 18;
    rationales.push(`Defined outreach channels: ${facts.targetChannels.join(", ")}.`);
  } else {
    breakdown.needScore = 8;
    riskFlags.push("Undefined core pain point or ICP alignment");
  }

  // 4. Timeline (0 - 15 points)
  switch (facts.timeline) {
    case "immediate":
      breakdown.timelineScore = 15;
      rationales.push("Immediate deployment timeline (active purchase cycle).");
      break;
    case "1_month":
      breakdown.timelineScore = 12;
      rationales.push("Near-term deployment (within 30 days).");
      break;
    case "next_quarter":
      breakdown.timelineScore = 8;
      rationales.push("Next-quarter planning timeline.");
      break;
    case "exploring":
      breakdown.timelineScore = 4;
      riskFlags.push("Exploratory / early research stage");
      break;
    case "unknown":
    default:
      breakdown.timelineScore = 0;
      riskFlags.push("Unknown purchase timeline");
      break;
  }

  const totalScore = Math.min(
    100,
    breakdown.budgetScore +
      breakdown.authorityScore +
      breakdown.needScore +
      breakdown.timelineScore
  );

  // Status and stage assignment
  let qualificationStatus: ScoreLeadOutput["qualificationStatus"] = "needs_info";
  let recommendedStage: PipelineStage = "new";

  if (totalScore >= 60 && breakdown.budgetScore >= 20) {
    qualificationStatus = "qualified";
    recommendedStage = "qualified";
  } else if (budget > 0 && budget < 5000 && facts.timeline === "exploring") {
    qualificationStatus = "disqualified";
    recommendedStage = "lost";
    riskFlags.push("Disqualified: below minimum budget and no near-term urgency");
  } else {
    qualificationStatus = "needs_info";
    recommendedStage = "new";
  }

  return {
    totalScore,
    breakdown,
    recommendedStage,
    qualificationStatus,
    riskFlags,
    rationale: rationales.join(" "),
  };
}
