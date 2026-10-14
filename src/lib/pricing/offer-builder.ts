import { DEMO_PACKAGES, PackageTier } from "@/config/packages";
import { LeadFacts, SuggestOfferOutput } from "@/types/tools";

export class OfferGroundingViolationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OfferGroundingViolationError";
  }
}

/**
 * STRICT GROUNDED OFFER BUILDER
 * 
 * Rules:
 * 1. Package tier must strictly exist in DEMO_PACKAGES.
 * 2. Prices must match DEMO_PACKAGES exactly.
 * 3. Invented/custom discounts (appliedDiscountPercent > 0) are strictly prohibited.
 * 4. Grounding flag `isGroundedInConfig` must be true.
 */
export function buildGroundedOffer(facts: LeadFacts, _score?: number): SuggestOfferOutput {
  void _score;
  const annualBudget = facts.annualBudgetUSD ?? 0;
  
  // Tier selection logic based on verified budget and company scope
  let tier: PackageTier;

  if (annualBudget >= DEMO_PACKAGES.enterprise.minAnnualBudgetUSD) {
    tier = DEMO_PACKAGES.enterprise;
  } else if (annualBudget >= DEMO_PACKAGES.growth.minAnnualBudgetUSD) {
    tier = DEMO_PACKAGES.growth;
  } else if (annualBudget >= DEMO_PACKAGES.starter.minAnnualBudgetUSD) {
    tier = DEMO_PACKAGES.starter;
  } else {
    // If budget is unstated or below starter ($5k), recommend Starter tier as baseline minimum
    tier = DEMO_PACKAGES.starter;
  }

  // Value proposition grounded in lead's specific pain point
  const painPointSummary = facts.primaryPainPoint
    ? `specifically configured to address your priority: "${facts.primaryPainPoint}"`
    : "tailored for high-velocity inbound qualification and automated calendar bookings";

  return {
    selectedTier: tier.id,
    tierName: tier.name,
    billingFrequency: "annual",
    priceUSD: tier.annualPriceUSD,
    valueProposition: `The ${tier.name} package is ${painPointSummary}.`,
    includedFeatures: [...tier.features],
    isGroundedInConfig: true,
    appliedDiscountPercent: 0, // Strict zero: no fabricated discounts
  };
}

/**
 * Validates that an offer adheres to the grounded pricing policy.
 * Throws or returns validation failure if any price differs or discount is invented.
 */
export function verifyOfferGrounding(offer: Partial<SuggestOfferOutput>): {
  isGrounded: boolean;
  violations: string[];
} {
  const violations: string[] = [];

  if (!offer.selectedTier || !DEMO_PACKAGES[offer.selectedTier]) {
    violations.push(`Invalid tier '${offer.selectedTier}'. Tier must exist in DEMO_PACKAGES.`);
    return { isGrounded: false, violations };
  }

  const expectedTier = DEMO_PACKAGES[offer.selectedTier];
  const expectedPrice =
    offer.billingFrequency === "monthly"
      ? expectedTier.monthlyPriceUSD
      : expectedTier.annualPriceUSD;

  if (offer.priceUSD !== expectedPrice) {
    violations.push(
      `Price mismatch: offered $${offer.priceUSD}, but canonical ${offer.billingFrequency} price is $${expectedPrice}. Custom discounts are prohibited.`
    );
  }

  if (offer.appliedDiscountPercent !== 0) {
    violations.push(
      `Unauthorized discount percent (${offer.appliedDiscountPercent}%). Autonomous discounting is disabled.`
    );
  }

  if (!offer.isGroundedInConfig) {
    violations.push("Offer lacks verified grounding flag.");
  }

  return {
    isGrounded: violations.length === 0,
    violations,
  };
}
