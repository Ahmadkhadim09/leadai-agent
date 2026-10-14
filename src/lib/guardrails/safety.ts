import { z } from "zod";
import { LeadFacts } from "@/types/tools";
import { DemoSlot } from "@/config/slots";

export interface GuardrailCheckResult {
  passed: boolean;
  guardrailType:
    | "prompt_injection"
    | "system_prompt_leak"
    | "unauthorized_discount"
    | "missing_bant"
    | "booking_conflict"
    | "malformed_payload"
    | "none";
  severity: "none" | "low" | "medium" | "high" | "critical";
  message: string;
  suggestedAction: "allow" | "redirect" | "block" | "handoff_to_human";
  confidence: number;
}

/**
 * PROMPT INJECTION & ADMIN ESCALATION GUARDRAIL
 * 
 * Note on Security Architecture:
 * Regex & structural heuristics provide fast, deterministic Layer 1 defense.
 * However, simple keyword checks alone do NOT provide complete prompt-injection
 * protection against semantic obfuscation or token manipulation. In production,
 * this must be paired with model-level system boundaries, dual-LLM classifiers (Llama Guard),
 * and strict function-calling parameter constraints.
 */
const INJECTION_PATTERNS: Array<{ pattern: RegExp; label: string }> = [
  { pattern: /ignore\s+(all\s+)?(previous|prior|above)\s+instructions/i, label: "instruction_override" },
  { pattern: /you\s+are\s+now\s+(in\s+developer\s+mode|dan|unfiltered|jailbroken)/i, label: "jailbreak_persona" },
  { pattern: /(grant|give|escalate)\s+(me\s+)?(admin|root|superuser|developer)\s+(access|privilege|mode)/i, label: "admin_escalation" },
  { pattern: /sudo\s+|chmod\s+|eval\s*\(|system\.override/i, label: "system_command_injection" },
  { pattern: /bypass\s+(safety|guardrail|filter|restriction)/i, label: "safety_bypass" },
  { pattern: /\[system\]|\[assistant\]|<system>|<script>|<\/script>/i, label: "tag_spoofing" },
  { pattern: /disregard\s+(pricing|rules|safety|guidelines)/i, label: "rule_disregard" },
];

export function checkPromptInjection(userInput: string): GuardrailCheckResult {
  const normalized = userInput.trim().toLowerCase();

  for (const { pattern, label } of INJECTION_PATTERNS) {
    if (pattern.test(normalized)) {
      return {
        passed: false,
        guardrailType: "prompt_injection",
        severity: "critical",
        message: `Potential prompt injection / unauthorized escalation detected (${label}). System maintained strict sales boundary.`,
        suggestedAction: "block",
        confidence: 0.95,
      };
    }
  }

  return {
    passed: true,
    guardrailType: "none",
    severity: "none",
    message: "No prompt injection patterns detected.",
    suggestedAction: "allow",
    confidence: 0.98,
  };
}

/**
 * SYSTEM PROMPT & SECRET LEAK GUARDRAIL
 */
const SECRET_LEAK_PATTERNS: Array<{ pattern: RegExp; label: string }> = [
  { pattern: /(show|reveal|print|repeat|output|dump)\s+(me\s+)?(your\s+)?(system\s+prompt|initial\s+prompt|hidden\s+prompt|internal\s+instructions)/i, label: "system_prompt_request" },
  { pattern: /(what\s+are\s+your\s+(exact\s+)?instructions|tell\s+me\s+what\s+you\s+were\s+told\s+to\s+do)/i, label: "instruction_extract" },
  { pattern: /(api\s*key|secret\s*key|firebase\s*token|openai\s*key|auth\s*token|\.env|credentials)/i, label: "credential_fishing" },
  { pattern: /show\s+(hidden|private|internal)\s+(rules|guidelines|parameters)/i, label: "internal_parameter_probe" },
];

export function checkSystemPromptLeak(userInput: string): GuardrailCheckResult {
  const normalized = userInput.trim().toLowerCase();

  for (const { pattern, label } of SECRET_LEAK_PATTERNS) {
    if (pattern.test(normalized)) {
      return {
        passed: false,
        guardrailType: "system_prompt_leak",
        severity: "high",
        message: `Attempt to extract internal instructions or secrets detected (${label}). System prompts and tokens are protected.`,
        suggestedAction: "redirect",
        confidence: 0.92,
      };
    }
  }

  return {
    passed: true,
    guardrailType: "none",
    severity: "none",
    message: "No system secret probe detected.",
    suggestedAction: "allow",
    confidence: 0.99,
  };
}

/**
 * BANT COMPLETENESS GUARDRAIL
 * Ensures budget, timeline, and decision-maker details are verified before proposals or bookings.
 */
export function checkBantCompleteness(facts: LeadFacts): {
  isComplete: boolean;
  missingFields: Array<"budget" | "timeline" | "decisionMaker" | "company">;
  details: string;
} {
  const missing: Array<"budget" | "timeline" | "decisionMaker" | "company"> = [];

  if (facts.annualBudgetUSD === undefined || facts.annualBudgetUSD <= 0) {
    missing.push("budget");
  }
  if (!facts.timeline || facts.timeline === "unknown") {
    missing.push("timeline");
  }
  if (facts.isDecisionMaker === undefined) {
    missing.push("decisionMaker");
  }
  if (!facts.companyName) {
    missing.push("company");
  }

  return {
    isComplete: missing.length === 0,
    missingFields: missing,
    details: missing.length === 0
      ? "All core BANT qualification parameters have been satisfied."
      : `Missing required qualification criteria: ${missing.join(", ")}. Further discovery required before commitment.`,
  };
}

/**
 * BOOKING CONFLICT & DUPLICATE GUARDRAIL
 */
export function checkBookingConflict(
  slotId: string,
  existingSlots: DemoSlot[],
  contactEmail: string
): GuardrailCheckResult {
  const targetSlot = existingSlots.find((s) => s.slotId === slotId);

  if (!targetSlot) {
    return {
      passed: false,
      guardrailType: "booking_conflict",
      severity: "high",
      message: `Calendar slot ID '${slotId}' does not exist or has expired.`,
      suggestedAction: "redirect",
      confidence: 1.0,
    };
  }

  if (targetSlot.isBooked) {
    return {
      passed: false,
      guardrailType: "booking_conflict",
      severity: "high",
      message: `Calendar slot '${slotId}' at ${targetSlot.startTime} is already reserved by another lead.`,
      suggestedAction: "redirect",
      confidence: 1.0,
    };
  }

  // Duplicate check: has this email already booked an active slot?
  const duplicateSlot = existingSlots.find(
    (s) => s.isBooked && s.bookedByEmail?.toLowerCase() === contactEmail.toLowerCase()
  );

  if (duplicateSlot) {
    return {
      passed: false,
      guardrailType: "booking_conflict",
      severity: "medium",
      message: `A demo is already scheduled for ${contactEmail} at ${duplicateSlot.startTime}. Please reschedule or consult your confirmation link.`,
      suggestedAction: "redirect",
      confidence: 0.95,
    };
  }

  return {
    passed: true,
    guardrailType: "none",
    severity: "none",
    message: "Slot is available and lead has no conflicting reservations.",
    suggestedAction: "allow",
    confidence: 1.0,
  };
}

/**
 * TOOL ARGUMENT & MODEL RESPONSE VALIDATOR
 */
export function validateToolPayload<T>(
  schema: z.ZodSchema<T>,
  payload: unknown,
  toolName: string
): { success: true; data: T } | { success: false; error: string; issues: z.ZodIssue[] } {
  const result = schema.safeParse(payload);
  if (!result.success) {
    return {
      success: false,
      error: `Malformed payload or schema violation in tool '${toolName}': ${result.error.issues.map((i) => i.message).join("; ")}`,
      issues: result.error.issues,
    };
  }
  return { success: true, data: result.data };
}
