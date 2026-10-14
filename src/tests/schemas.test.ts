import { describe, it, expect } from "vitest";
import {
  LeadFactsSchema,
  PipelineStageSchema,
  ExtractLeadInputSchema,
  ExtractLeadOutputSchema,
  ScoreLeadOutputSchema,
  SuggestOfferOutputSchema,
  BookSlotOutputSchema,
  HandoffToHumanOutputSchema,
} from "@/lib/schemas/tools.schema";

describe("Zod Tool & Entity Schemas", () => {
  it("validates valid LeadFacts and rejects invalid email", () => {
    const valid = LeadFactsSchema.safeParse({
      contactName: "Sarah Jenkins",
      contactEmail: "sarah@acme.io",
      companyName: "Acme",
      annualBudgetUSD: 24000,
      timeline: "immediate",
      isDecisionMaker: true,
    });
    expect(valid.success).toBe(true);

    const invalidEmail = LeadFactsSchema.safeParse({
      contactEmail: "not-an-email",
    });
    expect(invalidEmail.success).toBe(false);
  });

  it("validates all pipeline stages correctly", () => {
    const stages = ["new", "qualified", "proposal_sent", "booked", "won", "lost"];
    for (const stage of stages) {
      expect(PipelineStageSchema.safeParse(stage).success).toBe(true);
    }
    expect(PipelineStageSchema.safeParse("arbitrary_stage").success).toBe(false);
  });

  it("validates ExtractLead tool input and output", () => {
    const inParse = ExtractLeadInputSchema.safeParse({
      conversationId: "conv-123",
      transcript: [{ role: "user", content: "We are Acme Corp with $20k budget." }],
    });
    expect(inParse.success).toBe(true);

    const outParse = ExtractLeadOutputSchema.safeParse({
      extractedFacts: { companyName: "Acme Corp", annualBudgetUSD: 20000 },
      unknownFields: ["timeline"],
      confidenceScore: 0.85,
      summary: "Extracted 2 fields",
    });
    expect(outParse.success).toBe(true);
  });

  it("enforces strict grounded offer constraints (discount must be 0)", () => {
    const validOffer = {
      selectedTier: "growth",
      tierName: "LeadPilot Growth",
      billingFrequency: "annual",
      priceUSD: 12000,
      valueProposition: "Tailored for scaling pipeline",
      includedFeatures: ["Feature 1", "Feature 2"],
      isGroundedInConfig: true,
      appliedDiscountPercent: 0,
    };
    expect(SuggestOfferOutputSchema.safeParse(validOffer).success).toBe(true);

    const hallucinatedDiscount = {
      ...validOffer,
      appliedDiscountPercent: 15, // Non-zero discount is forbidden
    };
    expect(SuggestOfferOutputSchema.safeParse(hallucinatedDiscount).success).toBe(false);
  });

  it("validates BookSlotOutput structure", () => {
    const booking = {
      bookingId: "bk-123",
      slotId: "slot-20261014-1000",
      confirmedStartTime: "2026-10-14T10:00:00Z",
      confirmedEndTime: "2026-10-14T10:30:00Z",
      assignedRep: "Alex Chen",
      assignedRepEmail: "alex@leadpilot.demo",
      meetingLink: "https://meet.leadpilot.demo/123",
      status: "confirmed",
      confirmationMessage: "Confirmed for Alex",
    };
    expect(BookSlotOutputSchema.safeParse(booking).success).toBe(true);
  });

  it("validates ScoreLeadOutput and HandoffToHumanOutput structures", () => {
    const scoreOut = {
      totalScore: 85,
      breakdown: {
        budgetScore: 28,
        authorityScore: 22,
        needScore: 25,
        timelineScore: 10,
      },
      recommendedStage: "qualified",
      qualificationStatus: "qualified",
      riskFlags: [],
      rationale: "Strong BANT alignment",
    };
    expect(ScoreLeadOutputSchema.safeParse(scoreOut).success).toBe(true);

    const handoffOut = {
      ticketId: "tk-999",
      assignedTeam: "sales_engineering",
      handoffStatus: "queued",
      messageToUser: "Escalated to human SDR",
      timestamp: new Date().toISOString(),
    };
    expect(HandoffToHumanOutputSchema.safeParse(handoffOut).success).toBe(true);
  });
});
