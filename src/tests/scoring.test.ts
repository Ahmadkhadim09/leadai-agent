import { describe, it, expect } from "vitest";
import { scoreLeadFacts } from "@/lib/scoring/lead-scorer";

describe("Lead Scoring Logic", () => {
  it("qualifies a high-budget decision maker with immediate timeline", () => {
    const result = scoreLeadFacts({
      companyName: "Acme Finance",
      annualBudgetUSD: 35000,
      isDecisionMaker: true,
      timeline: "immediate",
      primaryPainPoint: "Inbound leads wait too long for SDR qualification",
    });

    expect(result.totalScore).toBe(100);
    expect(result.qualificationStatus).toBe("qualified");
    expect(result.recommendedStage).toBe("qualified");
    expect(result.riskFlags.length).toBe(0);
  });

  it("handles modest budget starter lead appropriately", () => {
    const result = scoreLeadFacts({
      companyName: "Apex Studio",
      annualBudgetUSD: 7000,
      isDecisionMaker: true,
      timeline: "1_month",
      primaryPainPoint: "Need automated demo booking",
    });

    expect(result.totalScore).toBeGreaterThanOrEqual(60);
    expect(result.qualificationStatus).toBe("qualified");
    expect(result.breakdown.budgetScore).toBe(20);
  });

  it("identifies risk when decision maker is unverified or budget is missing", () => {
    const result = scoreLeadFacts({
      companyName: "Mysterious Corp",
      timeline: "exploring",
    });

    expect(result.qualificationStatus).toBe("needs_info");
    expect(result.recommendedStage).toBe("new");
    expect(result.riskFlags).toContain("Unconfirmed annual budget");
    expect(result.riskFlags).toContain("Decision maker status unverified");
  });

  it("disqualifies leads with sub-$5k budget and exploratory timeline", () => {
    const result = scoreLeadFacts({
      companyName: "Tiny Shop",
      annualBudgetUSD: 400,
      timeline: "exploring",
      isDecisionMaker: true,
    });

    expect(result.qualificationStatus).toBe("disqualified");
    expect(result.recommendedStage).toBe("lost");
    expect(result.riskFlags.some((f) => f.includes("Disqualified"))).toBe(true);
  });
});
