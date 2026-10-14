import { describe, it, expect } from "vitest";
import { buildGroundedOffer, verifyOfferGrounding } from "@/lib/pricing/offer-builder";
import { DEMO_PACKAGES, PackageTier } from "@/config/packages";

describe("Pricing Grounding & Discount Prevention", () => {
  it("selects Enterprise tier for $35k+ budget", () => {
    const offer = buildGroundedOffer(
      { annualBudgetUSD: 40000, primaryPainPoint: "24/7 lead triage" },
      90
    );

    expect(offer.selectedTier).toBe("enterprise");
    expect(offer.priceUSD).toBe(DEMO_PACKAGES.enterprise.annualPriceUSD);
    expect(offer.appliedDiscountPercent).toBe(0);
    expect(offer.isGroundedInConfig).toBe(true);

    const verification = verifyOfferGrounding(offer);
    expect(verification.isGrounded).toBe(true);
    expect(verification.violations.length).toBe(0);
  });

  it("selects Growth tier for $15k budget", () => {
    const offer = buildGroundedOffer(
      { annualBudgetUSD: 15000, primaryPainPoint: "HubSpot sync" },
      75
    );

    expect(offer.selectedTier).toBe("growth");
    expect(offer.priceUSD).toBe(DEMO_PACKAGES.growth.annualPriceUSD);
    expect(offer.appliedDiscountPercent).toBe(0);

    const verification = verifyOfferGrounding(offer);
    expect(verification.isGrounded).toBe(true);
  });

  it("selects Starter tier as baseline minimum", () => {
    const offer = buildGroundedOffer(
      { annualBudgetUSD: 6000 },
      65
    );

    expect(offer.selectedTier).toBe("starter");
    expect(offer.priceUSD).toBe(DEMO_PACKAGES.starter.annualPriceUSD);
  });

  it("detects and rejects unauthorized discounts or fabricated prices", () => {
    const fabricatedOffer = {
      selectedTier: "growth" as const,
      tierName: "LeadPilot Growth",
      billingFrequency: "annual" as const,
      priceUSD: 6000, // Fabricated 50% discount (official is 12000)
      valueProposition: "Special hacker deal",
      includedFeatures: [],
      isGroundedInConfig: true as const,
      appliedDiscountPercent: 50 as 0, // illegal discount
    };

    const verification = verifyOfferGrounding(fabricatedOffer);
    expect(verification.isGrounded).toBe(false);
    expect(verification.violations.length).toBeGreaterThanOrEqual(1);
    expect(verification.violations.some((v) => v.includes("Price mismatch"))).toBe(true);
  });

  it("rejects offers missing grounding flag or non-existent tiers", () => {
    const invalidTierOffer = {
      selectedTier: "hyper_plan" as unknown as PackageTier["id"],
      priceUSD: 100,
    };

    const verification = verifyOfferGrounding(invalidTierOffer);
    expect(verification.isGrounded).toBe(false);
  });
});
