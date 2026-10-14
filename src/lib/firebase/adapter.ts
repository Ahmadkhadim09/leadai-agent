/**
 * LeadPilot Firebase Architecture & Adapter
 * 
 * PLANNED FIRESTORE SCHEMA:
 * 
 * 1. Collection: `/leads/{leadId}`
 *    Fields:
 *      - id: string (UUID)
 *      - contactName: string
 *      - contactEmail: string
 *      - companyName: string
 *      - stage: "new" | "qualified" | "proposal_sent" | "booked" | "won" | "lost"
 *      - score: number (0-100)
 *      - extractedFacts: Map<string, any> (BANT attributes)
 *      - unknownFields: string[]
 *      - riskFlags: string[]
 *      - notes: Array<{ id, author, role, content, createdAt }>
 *      - stageOverrides: Array<{ targetStage, reason, adminId, timestamp }>
 *      - createdAt: Timestamp
 *      - updatedAt: Timestamp
 * 
 * 2. Collection: `/conversations/{conversationId}`
 *    Fields:
 *      - conversationId: string
 *      - leadId: string (optional foreign key)
 *      - messages: Array<{ id, role, content, timestamp, toolCalls, suggestedReplies }>
 *      - state: "GREETING" | "COLLECTING_BANT" | "OFFERING_PROPOSAL" | "SCHEDULING_DEMO" | "BOOKED" | ...
 *      - startedAt: Timestamp
 *      - lastMessageAt: Timestamp
 * 
 * 3. Collection: `/bookings/{bookingId}`
 *    Fields:
 *      - bookingId: string
 *      - slotId: string
 *      - leadId: string
 *      - contactEmail: string
 *      - startTime: Timestamp
 *      - endTime: Timestamp
 *      - status: "confirmed" | "cancelled" | "completed"
 *      - createdAt: Timestamp
 * 
 * 4. Collection: `/eval_suites/{suiteId}`
 *    Fields:
 *      - suiteId: string
 *      - name: string
 *      - description: string
 *      - testCaseIds: string[]
 *      - createdAt: Timestamp
 * 
 * 5. Collection: `/eval_reports/{reportId}`
 *    Fields:
 *      - suiteId: string
 *      - ranAt: Timestamp
 *      - overallPassRate: number
 *      - extractionAccuracy: number
 *      - hallucinationCount: number
 *      - results: Array<EvalCaseResult>
 */

import { IFirebaseAdapter } from "@/types/firebase";
import { Lead } from "@/types/lead";
import { ChatMessage } from "@/types/chat";
import { DemoSlot, INITIAL_DEMO_SLOTS } from "@/config/slots";
import { EvalSuiteReport } from "@/types/evaluations";
import { PipelineStage } from "@/types/pipeline";
import { getFirebaseClient } from "./client";
import { FirestoreAdapter } from "./firestore-adapter";

/**
 * Local in-memory adapter implementing the IFirebaseAdapter contract
 * for local development, tests, and fallback when cloud credentials are not active.
 */
export class LocalFirebaseAdapter implements IFirebaseAdapter {
  private leadsMap = new Map<string, Lead>();
  private conversationsMap = new Map<string, ChatMessage[]>();
  private slots: DemoSlot[] = JSON.parse(JSON.stringify(INITIAL_DEMO_SLOTS));
  private evalReports: EvalSuiteReport[] = [];
  private evalSuitesMap = new Map<string, {
    suiteId: string;
    name: string;
    description: string;
    testCaseIds: string[];
    createdAt: string;
    createdBy: string;
  }>();

  constructor(initialLeads: Lead[] = []) {
    for (const lead of initialLeads) {
      this.leadsMap.set(lead.id, lead);
    }
  }

  isConfigured(): boolean {
    return false; // Local mock adapter indicates Firebase cloud credentials are not active
  }

  async getLead(leadId: string): Promise<Lead | null> {
    return this.leadsMap.get(leadId) || null;
  }

  async listLeads(filter?: { stage?: string; limit?: number }): Promise<Lead[]> {
    let list = Array.from(this.leadsMap.values());
    if (filter?.stage && filter.stage !== "all") {
      list = list.filter((l) => l.stage === filter.stage);
    }
    list.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    if (filter?.limit) {
      list = list.slice(0, filter.limit);
    }
    return list;
  }

  async saveLead(lead: Lead): Promise<void> {
    this.leadsMap.set(lead.id, {
      ...lead,
      updatedAt: new Date().toISOString(),
    });
  }

  async updateLeadStage(
    leadId: string,
    stage: string,
    adminId: string,
    reason: string
  ): Promise<void> {
    const existing = this.leadsMap.get(leadId);
    if (!existing) {
      throw new Error(`Lead with ID '${leadId}' not found.`);
    }

    const updated: Lead = {
      ...existing,
      stage: stage as PipelineStage,
      stageOverrides: [
        ...existing.stageOverrides,
        {
          targetStage: stage as PipelineStage,
          reason,
          adminId,
          timestamp: new Date().toISOString(),
        },
      ],
      updatedAt: new Date().toISOString(),
    };
    this.leadsMap.set(leadId, updated);
  }

  async addLeadNote(leadId: string, content: string, author: string): Promise<void> {
    const existing = this.leadsMap.get(leadId);
    if (!existing) {
      throw new Error(`Lead with ID '${leadId}' not found.`);
    }

    const updated: Lead = {
      ...existing,
      notes: [
        ...existing.notes,
        {
          id: `note-${Date.now()}`,
          author,
          role: "admin",
          content,
          createdAt: new Date().toISOString(),
        },
      ],
      updatedAt: new Date().toISOString(),
    };
    this.leadsMap.set(leadId, updated);
  }

  async saveConversationTurn(conversationId: string, message: ChatMessage): Promise<void> {
    const history = this.conversationsMap.get(conversationId) || [];
    history.push(message);
    this.conversationsMap.set(conversationId, history);
  }

  async getConversationHistory(conversationId: string): Promise<ChatMessage[]> {
    return this.conversationsMap.get(conversationId) || [];
  }

  async getAvailableSlots(): Promise<DemoSlot[]> {
    return this.slots;
  }

  async createBooking(
    slotId: string,
    leadId: string,
    contactEmail: string
  ): Promise<{ bookingId: string }> {
    const slotIndex = this.slots.findIndex((s) => s.slotId === slotId);
    if (slotIndex === -1) {
      throw new Error(`Slot '${slotId}' not found`);
    }
    if (this.slots[slotIndex].isBooked) {
      throw new Error(`Slot '${slotId}' is already booked`);
    }

    this.slots[slotIndex] = {
      ...this.slots[slotIndex],
      isBooked: true,
      bookedLeadId: leadId,
      bookedByEmail: contactEmail,
    };

    const bookingId = `book-${Date.now()}`;
    return { bookingId };
  }

  async saveEvalReport(report: EvalSuiteReport): Promise<void> {
    this.evalReports.unshift(report);
  }

  async getLatestEvalReport(): Promise<EvalSuiteReport | null> {
    return this.evalReports[0] || null;
  }

  async saveEvalSuite(suite: {
    suiteId: string;
    name: string;
    description: string;
    testCaseIds: string[];
    createdAt: string;
    createdBy: string;
  }): Promise<void> {
    this.evalSuitesMap.set(suite.suiteId, suite);
  }

  async getEvalSuite(suiteId: string): Promise<{
    suiteId: string;
    name: string;
    description: string;
    testCaseIds: string[];
    createdAt: string;
    createdBy: string;
  } | null> {
    return this.evalSuitesMap.get(suiteId) || null;
  }

  async listEvalSuites(): Promise<Array<{
    suiteId: string;
    name: string;
    description: string;
    testCaseIds: string[];
    createdAt: string;
    createdBy: string;
  }>> {
    return Array.from(this.evalSuitesMap.values());
  }
}

/**
 * Adapter Factory
 * Returns FirestoreAdapter if valid credentials exist, or falls back to LocalFirebaseAdapter.
 */
export function createFirebaseAdapter(fallbackLeads: Lead[] = []): IFirebaseAdapter {
  const client = getFirebaseClient();
  if (client.isConfigured && client.db) {
    return new FirestoreAdapter(client.db, fallbackLeads);
  }
  return new LocalFirebaseAdapter(fallbackLeads);
}
