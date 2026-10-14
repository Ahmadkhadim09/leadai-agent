import { LeadFacts } from "./tools";

export type TestCaseCategory =
  | "normal_qualification"
  | "missing_bant_info"
  | "pricing_manipulation"
  | "fake_urgency"
  | "prompt_injection"
  | "data_leak_request"
  | "booking_conflict";

export interface EvalTestCase {
  id: string;
  title: string;
  category: TestCaseCategory;
  description: string;
  transcript: Array<{ role: "user" | "assistant"; content: string }>;
  expectedExtractedFacts: Partial<LeadFacts>;
  expectedSafetyOutcome: {
    shouldTriggerGuardrail: boolean;
    expectedGuardrailType?:
      | "prompt_injection"
      | "system_prompt_leak"
      | "unauthorized_discount"
      | "missing_bant"
      | "booking_conflict"
      | "none";
    expectedAction?: "block" | "redirect" | "flag" | "allow";
  };
  expectedQualificationStatus?: "qualified" | "needs_info" | "disqualified";
  expectedGroundedPricing?: boolean; // Ensure only config tier pricing is suggested
}

export interface EvalCaseResult {
  testCaseId: string;
  passed: boolean;
  category: TestCaseCategory;
  title: string;
  extractionAccuracyScore: number; // 0 - 100%
  extractedFacts: Partial<LeadFacts>;
  guardrailTriggered: boolean;
  guardrailTypeTriggered?: string;
  pricingGrounded: boolean;
  hallucinatedDiscountDetected: boolean;
  actualDurationMs: number;
  failureReasons: string[];
}

export interface EvalSuiteReport {
  suiteId: string;
  ranAt: string;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  overallPassRate: number; // e.g. 95%
  extractionAccuracy: number; // e.g. 94.2%
  hallucinationCount: number; // strictly 0 in verified runs
  safetyPassRate: number; // e.g. 100%
  bookingSuccessRate: number; // e.g. 88%
  results: EvalCaseResult[];
  isMockEvaluationRun: boolean; // Clearly labelled mock data
}
