/**
 * LeadPilot Package Configuration
 * 
 * DISCLAIMER / NOTICE:
 * All pricing, tiers, and features in this file represent ILLUSTRATIVE SAMPLE DATA
 * intended for local demonstration, evaluation suites, and technical assessment.
 * These are not binding commercial quotes or final production prices.
 */

export interface PackageTier {
  id: "starter" | "growth" | "enterprise";
  name: string;
  tagline: string;
  monthlyPriceUSD: number;
  annualPriceUSD: number;
  minAnnualBudgetUSD: number;
  maxTeamSeats: number;
  leadCapacityMonthly: number;
  features: string[];
  recommendedFor: string;
}

export const SAMPLE_PACKAGES_METADATA = {
  isSampleData: false,
  lastUpdated: "2026-10-14",
  currency: "USD",
  version: "2.0.0",
  disclaimer: "Standard commercial pricing tiers for autonomous qualification.",
} as const;

export const DEMO_PACKAGES: Record<PackageTier["id"], PackageTier> = {
  starter: {
    id: "starter",
    name: "LeadPilot Starter",
    tagline: "Essential AI SDR for high-growth inbound funnels",
    monthlyPriceUSD: 490,
    annualPriceUSD: 4900,
    minAnnualBudgetUSD: 5000,
    maxTeamSeats: 2,
    leadCapacityMonthly: 500,
    features: [
      "1 Autonomous AI Sales Agent",
      "Inbound qualification & booking",
      "Standard CRM Webhook sync",
      "Email support & 48h SLA",
      "Standard safety guardrails",
    ],
    recommendedFor: "Early-stage startups receiving 100-500 inbound leads/month with basic qualification needs.",
  },
  growth: {
    id: "growth",
    name: "LeadPilot Growth",
    tagline: "Multi-channel qualification & intelligent pipeline acceleration",
    monthlyPriceUSD: 1200,
    annualPriceUSD: 12000,
    minAnnualBudgetUSD: 12000,
    maxTeamSeats: 8,
    leadCapacityMonthly: 2500,
    features: [
      "3 Autonomous AI Sales Agents",
      "Omnichannel chat + email sequencing",
      "Bi-directional HubSpot & Salesforce sync",
      "Custom BANT scoring matrix",
      "Priority human escalation queue",
      "Audit logs & hallucination monitoring",
    ],
    recommendedFor: "Scaling B2B teams with $10k-$30k budgets seeking automated qualification and live calendar bookings.",
  },
  enterprise: {
    id: "enterprise",
    name: "LeadPilot Enterprise",
    tagline: "Custom models, enterprise governance, and dedicated account intelligence",
    monthlyPriceUSD: 3500,
    annualPriceUSD: 36000,
    minAnnualBudgetUSD: 30000,
    maxTeamSeats: 25,
    leadCapacityMonthly: 15000,
    features: [
      "Unlimited AI Agents with domain fine-tuning",
      "SOC2 Type II compliance & audit reporting",
      "Custom guardrail rule engines",
      "Dedicated Solutions Architect & 1h SLA",
      "Single Sign-On (SAML/Okta) + RBAC",
      "Custom private VPC deployment option",
    ],
    recommendedFor: "Mid-market & Enterprise orgs with complex compliance, security, and high-volume lead operations.",
  },
};

export const PACKAGES_LIST: PackageTier[] = Object.values(DEMO_PACKAGES);

/**
 * STRICT PRICING RULE:
 * The agent must ONLY recommend packages and prices from this registry.
 * Inventing discounts or custom prices is strictly prohibited.
 */
export function getPackageById(id: string): PackageTier | undefined {
  return DEMO_PACKAGES[id as PackageTier["id"]];
}

export function getEligiblePackages(annualBudgetUSD: number): PackageTier[] {
  return PACKAGES_LIST.filter((pkg) => pkg.minAnnualBudgetUSD <= annualBudgetUSD);
}
