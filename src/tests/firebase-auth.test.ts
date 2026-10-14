import { describe, it, expect } from "vitest";
import {
  validateFirebaseConfig,
  isPlaceholder,
  isFirebaseConfigured,
} from "@/lib/firebase/config";
import { createFirebaseAdapter, LocalFirebaseAdapter } from "@/lib/firebase/adapter";
import {
  verifyAdminAuthorization,
  verifyUserAuthorization,
  AUTHORIZED_ADMIN_EMAILS,
} from "@/lib/auth/server-auth";
import { Lead } from "@/types/lead";

describe("Firebase Configuration & Placeholder Detection", () => {
  it("detects placeholder strings correctly", () => {
    expect(isPlaceholder("your_firebase_api_key_here")).toBe(true);
    expect(isPlaceholder("your_project_id")).toBe(true);
    expect(isPlaceholder("placeholder")).toBe(true);
    expect(isPlaceholder("")).toBe(true);
    expect(isPlaceholder(undefined)).toBe(true);
    expect(isPlaceholder(null)).toBe(true);
    expect(isPlaceholder("AIzaSyD-valid-firebase-key-928374")).toBe(false);
  });

  it("fails validation when placeholder environment variables are provided", () => {
    const placeholderEnv = {
      NEXT_PUBLIC_FIREBASE_API_KEY: "your_firebase_api_key_here",
      NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: "your_project_id.firebaseapp.com",
      NEXT_PUBLIC_FIREBASE_PROJECT_ID: "your_project_id",
      NEXT_PUBLIC_FIREBASE_APP_ID: "your_firebase_app_id",
    };

    const result = validateFirebaseConfig(placeholderEnv);
    expect(result.isValid).toBe(false);
    expect(result.config).toBeNull();
    expect(result.missingOrPlaceholderKeys).toContain("NEXT_PUBLIC_FIREBASE_API_KEY");
    expect(result.missingOrPlaceholderKeys).toContain("NEXT_PUBLIC_FIREBASE_PROJECT_ID");
    expect(result.missingOrPlaceholderKeys).toContain("NEXT_PUBLIC_FIREBASE_APP_ID");
  });

  it("passes validation when legitimate configuration is provided", () => {
    const validEnv = {
      NEXT_PUBLIC_FIREBASE_API_KEY: "AIzaSyC234ValidApiKeyLeadPilotXYZ",
      NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: "leadpilot-prod-123.firebaseapp.com",
      NEXT_PUBLIC_FIREBASE_PROJECT_ID: "leadpilot-prod-123",
      NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: "leadpilot-prod-123.appspot.com",
      NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: "987654321098",
      NEXT_PUBLIC_FIREBASE_APP_ID: "1:987654321098:web:abcdef123456",
    };

    const result = validateFirebaseConfig(validEnv);
    expect(result.isValid).toBe(true);
    expect(result.missingOrPlaceholderKeys).toHaveLength(0);
    expect(result.config).toEqual({
      apiKey: "AIzaSyC234ValidApiKeyLeadPilotXYZ",
      authDomain: "leadpilot-prod-123.firebaseapp.com",
      projectId: "leadpilot-prod-123",
      storageBucket: "leadpilot-prod-123.appspot.com",
      messagingSenderId: "987654321098",
      appId: "1:987654321098:web:abcdef123456",
    });
  });

  it("reports isFirebaseConfigured() as false when environment has no valid keys", () => {
    expect(isFirebaseConfigured()).toBe(false);
  });
});

describe("Firebase Adapter Factory & Local Fallback", () => {
  const sampleLead: Lead = {
    id: "test-lead-001",
    contactName: "Taylor Morgan",
    contactEmail: "taylor@acme.inc",
    companyName: "Acme Logistics",
    stage: "new",
    score: 65,
    timeline: "next_quarter",
    annualBudgetUSD: 40000,
    extractedFacts: {
      contactName: "Taylor Morgan",
      contactEmail: "taylor@acme.inc",
      companyName: "Acme Logistics",
      companySize: "120",
      role: "VP Operations",
      primaryPainPoint: "Route automation",
    },
    unknownFields: [],
    riskFlags: [],
    conversationHistory: [],
    notes: [],
    stageOverrides: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isMockData: true,
  };

  it("falls back to LocalFirebaseAdapter when Firebase client is unconfigured", () => {
    const adapter = createFirebaseAdapter([sampleLead]);
    expect(adapter).toBeInstanceOf(LocalFirebaseAdapter);
    expect(adapter.isConfigured()).toBe(false);
  });

  it("LocalFirebaseAdapter supports lead querying and retrieval", async () => {
    const adapter = new LocalFirebaseAdapter([sampleLead]);
    const lead = await adapter.getLead("test-lead-001");
    expect(lead).not.toBeNull();
    expect(lead?.contactName).toBe("Taylor Morgan");

    const allLeads = await adapter.listLeads();
    expect(allLeads).toHaveLength(1);
  });

  it("LocalFirebaseAdapter records admin stage overrides with audit trail", async () => {
    const adapter = new LocalFirebaseAdapter([sampleLead]);
    await adapter.updateLeadStage(
      "test-lead-001",
      "proposal_sent",
      "alex.chen@leadpilot.demo",
      "Fast-tracked due to urgent Q3 contract requirement"
    );

    const updated = await adapter.getLead("test-lead-001");
    expect(updated?.stage).toBe("proposal_sent");
    expect(updated?.stageOverrides).toHaveLength(1);
    expect(updated?.stageOverrides[0].targetStage).toBe("proposal_sent");
    expect(updated?.stageOverrides[0].adminId).toBe("alex.chen@leadpilot.demo");
    expect(updated?.stageOverrides[0].reason).toContain("urgent Q3 contract");
  });

  it("LocalFirebaseAdapter records authenticated lead notes", async () => {
    const adapter = new LocalFirebaseAdapter([sampleLead]);
    await adapter.addLeadNote(
      "test-lead-001",
      "Followed up via phone; prospect requested custom SLA doc.",
      "Alex Chen (Admin)"
    );

    const updated = await adapter.getLead("test-lead-001");
    expect(updated?.notes).toHaveLength(1);
    expect(updated?.notes[0].content).toContain("custom SLA doc");
    expect(updated?.notes[0].author).toBe("Alex Chen (Admin)");
  });

  it("LocalFirebaseAdapter manages conversation turns and bookings", async () => {
    const adapter = new LocalFirebaseAdapter();
    await adapter.saveConversationTurn("conv-123", {
      id: "msg-1",
      role: "user",
      content: "Hi, what are your enterprise pricing options?",
      timestamp: new Date().toISOString(),
    });

    const history = await adapter.getConversationHistory("conv-123");
    expect(history).toHaveLength(1);
    expect(history[0].content).toContain("enterprise pricing options");

    const slots = await adapter.getAvailableSlots();
    expect(slots.length).toBeGreaterThan(0);

    const bookingResult = await adapter.createBooking(
      slots[0].slotId,
      "test-lead-001",
      "taylor@acme.inc"
    );
    expect(bookingResult.bookingId).toBeDefined();

    // Re-booking the same slot should fail
    await expect(
      adapter.createBooking(slots[0].slotId, "test-lead-002", "other@acme.inc")
    ).rejects.toThrow(/already booked/);
  });
});

describe("Server-Side Authorization & RBAC Enforcement", () => {
  it("rejects requests missing an Authorization header with 401 Unauthorized", async () => {
    const req = new Request("https://leadpilot.local/api/leads/test-lead-001/stage", {
      method: "POST",
      headers: {},
    });

    const result = await verifyAdminAuthorization(req);
    expect(result.authorized).toBe(false);
    expect(result.statusCode).toBe(401);
    expect(result.error).toContain("Missing Authorization header");
  });

  it("rejects requests with non-Bearer authorization scheme with 401 Unauthorized", async () => {
    const req = new Request("https://leadpilot.local/api/leads/test-lead-001/stage", {
      method: "POST",
      headers: {
        Authorization: "Basic dXNlcjpwYXNz",
      },
    });

    const result = await verifyAdminAuthorization(req);
    expect(result.authorized).toBe(false);
    expect(result.statusCode).toBe(401);
    expect(result.error).toContain("Missing or malformed Authorization Bearer header");
  });

  it("rejects requests with empty Bearer token with 401 Unauthorized", async () => {
    const req = new Request("https://leadpilot.local/api/leads/test-lead-001/stage", {
      method: "POST",
      headers: {
        Authorization: "Bearer   ",
      },
    });

    const result = await verifyAdminAuthorization(req);
    expect(result.authorized).toBe(false);
    expect(result.statusCode).toBe(401);
    expect(result.error).toContain("Empty authentication token");
  });

  it("rejects requests with unknown/invalid token with 401 Unauthorized", async () => {
    const req = new Request("https://leadpilot.local/api/leads/test-lead-001/stage", {
      method: "POST",
      headers: {
        Authorization: "Bearer invalid-random-token-xyz",
      },
    });

    const result = await verifyAdminAuthorization(req);
    expect(result.authorized).toBe(false);
    expect(result.statusCode).toBe(401);
  });

  it("rejects SDR role tokens from administrative actions with 403 Forbidden", async () => {
    const req = new Request("https://leadpilot.local/api/leads/test-lead-001/stage", {
      method: "POST",
      headers: {
        Authorization: "Bearer mock-sdr-token",
      },
    });

    const result = await verifyAdminAuthorization(req);
    expect(result.authorized).toBe(false);
    expect(result.statusCode).toBe(403);
    expect(result.error).toContain("SDR role cannot execute administrative");
  });

  it("authorizes valid admin bearer token with 200 Authorized and admin user details", async () => {
    const req = new Request("https://leadpilot.local/api/leads/test-lead-001/stage", {
      method: "POST",
      headers: {
        Authorization: "Bearer mock-admin-token",
      },
    });

    const result = await verifyAdminAuthorization(req);
    expect(result.authorized).toBe(true);
    expect(result.statusCode).toBe(200);
    expect(result.user).toBeDefined();
    expect(result.user?.role).toBe("admin");
    expect(result.user?.email).toBe("alex.chen@leadpilot.demo");
  });

  it("AUTHORIZED_ADMIN_EMAILS contains designated platform administrators", () => {
    expect(AUTHORIZED_ADMIN_EMAILS).toContain("alex.chen@leadpilot.demo");
    expect(AUTHORIZED_ADMIN_EMAILS).toContain("admin@leadpilot.demo");
  });

  it("verifyUserAuthorization authorizes SDR tokens for general authenticated routes", async () => {
    const req = new Request("https://leadpilot.local/api/leads/test-lead-001/notes", {
      method: "POST",
      headers: {
        Authorization: "Bearer mock-sdr-token",
      },
    });

    const result = await verifyUserAuthorization(req);
    expect(result.authorized).toBe(true);
    expect(result.statusCode).toBe(200);
    expect(result.user?.role).toBe("sdr");
    expect(result.user?.displayName).toContain("Jordan Taylor");
  });

  it("verifyUserAuthorization authorizes Admin tokens for general authenticated routes", async () => {
    const req = new Request("https://leadpilot.local/api/leads/test-lead-001/notes", {
      method: "POST",
      headers: {
        Authorization: "Bearer mock-admin-token",
      },
    });

    const result = await verifyUserAuthorization(req);
    expect(result.authorized).toBe(true);
    expect(result.statusCode).toBe(200);
    expect(result.user?.role).toBe("admin");
  });

  it("verifyUserAuthorization rejects missing or malformed tokens with 401", async () => {
    const req = new Request("https://leadpilot.local/api/leads/test-lead-001/notes", {
      method: "POST",
    });

    const result = await verifyUserAuthorization(req);
    expect(result.authorized).toBe(false);
    expect(result.statusCode).toBe(401);
  });
});

describe("Eval Suites Collection Read/Write", () => {
  it("LocalFirebaseAdapter stores and lists evaluation suites", async () => {
    const adapter = new LocalFirebaseAdapter();
    const suite = {
      suiteId: "suite-v1",
      name: "Q4 Safety Regression Suite",
      description: "20 automated adversarial test cases",
      testCaseIds: ["tc-01", "tc-02"],
      createdAt: new Date().toISOString(),
      createdBy: "alex.chen@leadpilot.demo",
    };

    await adapter.saveEvalSuite(suite);

    const retrieved = await adapter.getEvalSuite("suite-v1");
    expect(retrieved).not.toBeNull();
    expect(retrieved?.name).toBe("Q4 Safety Regression Suite");

    const allSuites = await adapter.listEvalSuites();
    expect(allSuites.length).toBeGreaterThanOrEqual(1);
    expect(allSuites[0].suiteId).toBe("suite-v1");
  });
});
