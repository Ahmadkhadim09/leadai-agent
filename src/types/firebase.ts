import { Lead } from "./lead";
import { ChatMessage } from "./chat";
import { EvalSuiteReport } from "./evaluations";
import { DemoSlot } from "@/config/slots";

/**
 * Planned Firestore Collection Schemas
 */
export interface FirestoreCollections {
  /**
   * Collection: 'leads'
   * Document ID: leadId (e.g. lead-uuid)
   */
  leads: Lead;

  /**
   * Collection: 'conversations'
   * Document ID: conversationId
   */
  conversations: {
    conversationId: string;
    leadId?: string;
    messages: ChatMessage[];
    startedAt: string;
    lastMessageAt: string;
    state: string;
  };

  /**
   * Collection: 'eval_suites'
   * Document ID: suiteId
   */
  eval_suites: {
    suiteId: string;
    name: string;
    description: string;
    testCaseIds: string[];
    createdAt: string;
    createdBy: string;
  };

  /**
   * Collection: 'eval_reports'
   * Document ID: reportId
   */
  eval_reports: EvalSuiteReport;

  /**
   * Collection: 'bookings'
   * Document ID: bookingId
   */
  bookings: {
    bookingId: string;
    slotId: string;
    leadId: string;
    contactEmail: string;
    startTime: string;
    endTime: string;
    status: "confirmed" | "cancelled" | "completed";
    createdAt: string;
  };
}

export type FirestoreCollectionName = keyof FirestoreCollections;

/**
 * Firebase Adapter Interface
 * Provides typed contract for future Firestore & Firebase Auth integration.
 */
export interface IFirebaseAdapter {
  isConfigured(): boolean;
  
  // Leads
  getLead(leadId: string): Promise<Lead | null>;
  listLeads(filter?: { stage?: string; limit?: number }): Promise<Lead[]>;
  saveLead(lead: Lead): Promise<void>;
  updateLeadStage(leadId: string, stage: string, adminId: string, reason: string): Promise<void>;
  addLeadNote(leadId: string, content: string, author: string): Promise<void>;

  // Conversations
  saveConversationTurn(conversationId: string, message: ChatMessage): Promise<void>;
  getConversationHistory(conversationId: string): Promise<ChatMessage[]>;

  // Bookings
  getAvailableSlots(): Promise<DemoSlot[]>;
  createBooking(slotId: string, leadId: string, contactEmail: string): Promise<{ bookingId: string }>;

  // Evaluations
  saveEvalReport(report: EvalSuiteReport): Promise<void>;
  getLatestEvalReport(): Promise<EvalSuiteReport | null>;
  saveEvalSuite(suite: FirestoreCollections["eval_suites"]): Promise<void>;
  getEvalSuite(suiteId: string): Promise<FirestoreCollections["eval_suites"] | null>;
  listEvalSuites(): Promise<FirestoreCollections["eval_suites"][]>;
}
