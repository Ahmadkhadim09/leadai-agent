import {
  Firestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit as fsLimit,
  arrayUnion,
} from "firebase/firestore";
import { IFirebaseAdapter } from "@/types/firebase";
import { Lead } from "@/types/lead";
import { ChatMessage } from "@/types/chat";
import { DemoSlot, INITIAL_DEMO_SLOTS } from "@/config/slots";
import { EvalSuiteReport } from "@/types/evaluations";
import { PipelineStage, StageOverrideAction } from "@/types/pipeline";

/**
 * Production Firestore Adapter
 * Directly reads and writes to live Firestore collections:
 *   - /leads/{leadId}
 *   - /conversations/{conversationId}
 *   - /bookings/{bookingId}
 *   - /eval_suites/{suiteId}
 *   - /eval_reports/{reportId}
 */
export class FirestoreAdapter implements IFirebaseAdapter {
  constructor(private db: Firestore, private fallbackLeads: Lead[] = []) {}

  isConfigured(): boolean {
    return true;
  }

  // ==========================================
  // Leads Collection (/leads)
  // ==========================================
  async getLead(leadId: string): Promise<Lead | null> {
    try {
      const leadRef = doc(this.db, "leads", leadId);
      const snap = await getDoc(leadRef);
      if (snap.exists()) {
        return snap.data() as Lead;
      }
    } catch {
      // In build or offline state, gracefully fall back
    }
    return this.fallbackLeads.find((l) => l.id === leadId) || null;
  }

  async listLeads(filter?: { stage?: string; limit?: number }): Promise<Lead[]> {
    try {
      const leadsRef = collection(this.db, "leads");
      let q = query(leadsRef);

      if (filter?.stage && filter.stage !== "all") {
        q = query(leadsRef, where("stage", "==", filter.stage));
      } else {
        q = query(leadsRef, orderBy("updatedAt", "desc"));
      }

      if (filter?.limit) {
        q = query(q, fsLimit(filter.limit));
      }

      const snap = await getDocs(q);
      if (!snap.empty) {
        const leads = snap.docs.map((d) => d.data() as Lead);
        leads.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        return leads;
      }
    } catch {
      // In build or offline state, gracefully fall back
    }

    let list = [...this.fallbackLeads];
    if (filter?.stage && filter.stage !== "all") {
      list = list.filter((l) => l.stage === filter.stage);
    }
    if (filter?.limit) {
      list = list.slice(0, filter.limit);
    }
    return list;
  }

  async saveLead(lead: Lead): Promise<void> {
    const leadRef = doc(this.db, "leads", lead.id);
    await setDoc(leadRef, {
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
    const leadRef = doc(this.db, "leads", leadId);
    const override: StageOverrideAction = {
      targetStage: stage as PipelineStage,
      reason,
      adminId,
      timestamp: new Date().toISOString(),
    };

    await updateDoc(leadRef, {
      stage,
      stageOverrides: arrayUnion(override),
      updatedAt: new Date().toISOString(),
    });
  }

  async addLeadNote(leadId: string, content: string, author: string): Promise<void> {
    const leadRef = doc(this.db, "leads", leadId);
    const note = {
      id: `note-${Date.now()}`,
      author,
      role: "admin",
      content,
      createdAt: new Date().toISOString(),
    };

    await updateDoc(leadRef, {
      notes: arrayUnion(note),
      updatedAt: new Date().toISOString(),
    });
  }

  // ==========================================
  // Conversations Collection (/conversations)
  // ==========================================
  async saveConversationTurn(conversationId: string, message: ChatMessage): Promise<void> {
    const convRef = doc(this.db, "conversations", conversationId);
    const snap = await getDoc(convRef);

    if (!snap.exists()) {
      await setDoc(convRef, {
        conversationId,
        messages: [message],
        startedAt: message.timestamp,
        lastMessageAt: message.timestamp,
        state: message.state || "GREETING",
      });
    } else {
      await updateDoc(convRef, {
        messages: arrayUnion(message),
        lastMessageAt: message.timestamp,
        state: message.state || "COLLECTING_BANT",
      });
    }
  }

  async getConversationHistory(conversationId: string): Promise<ChatMessage[]> {
    const convRef = doc(this.db, "conversations", conversationId);
    const snap = await getDoc(convRef);
    if (!snap.exists()) return [];
    const data = snap.data();
    return data.messages || [];
  }

  // ==========================================
  // Bookings Collection (/bookings)
  // ==========================================
  async getAvailableSlots(): Promise<DemoSlot[]> {
    try {
      const bookingsRef = collection(this.db, "bookings");
      const q = query(bookingsRef, where("status", "==", "confirmed"));
      const snap = await getDocs(q);
      const bookedSlotIds = new Set(snap.docs.map((d) => d.data().slotId));

      return INITIAL_DEMO_SLOTS.map((slot) => ({
        ...slot,
        isBooked: slot.isBooked || bookedSlotIds.has(slot.slotId),
      }));
    } catch {
      return INITIAL_DEMO_SLOTS;
    }
  }

  async createBooking(
    slotId: string,
    leadId: string,
    contactEmail: string
  ): Promise<{ bookingId: string }> {
    const bookingId = `book-${Date.now()}`;
    const bookingRef = doc(this.db, "bookings", bookingId);

    const slot = INITIAL_DEMO_SLOTS.find((s) => s.slotId === slotId);

    await setDoc(bookingRef, {
      bookingId,
      slotId,
      leadId,
      contactEmail,
      startTime: slot?.startTime || new Date().toISOString(),
      endTime: slot?.endTime || new Date().toISOString(),
      status: "confirmed",
      createdAt: new Date().toISOString(),
    });

    return { bookingId };
  }

  // ==========================================
  // Evaluations Collections (/eval_suites, /eval_reports)
  // ==========================================
  async saveEvalReport(report: EvalSuiteReport): Promise<void> {
    const reportRef = doc(this.db, "eval_reports", report.suiteId);
    await setDoc(reportRef, report);
  }

  async getLatestEvalReport(): Promise<EvalSuiteReport | null> {
    const reportsRef = collection(this.db, "eval_reports");
    const q = query(reportsRef, orderBy("ranAt", "desc"), fsLimit(1));
    const snap = await getDocs(q);
    if (snap.empty) return null;
    return snap.docs[0].data() as EvalSuiteReport;
  }

  async saveEvalSuite(suite: {
    suiteId: string;
    name: string;
    description: string;
    testCaseIds: string[];
    createdAt: string;
    createdBy: string;
  }): Promise<void> {
    const suiteRef = doc(this.db, "eval_suites", suite.suiteId);
    await setDoc(suiteRef, suite);
  }

  async getEvalSuite(suiteId: string): Promise<{
    suiteId: string;
    name: string;
    description: string;
    testCaseIds: string[];
    createdAt: string;
    createdBy: string;
  } | null> {
    const suiteRef = doc(this.db, "eval_suites", suiteId);
    const snap = await getDoc(suiteRef);
    if (!snap.exists()) return null;
    return snap.data() as {
      suiteId: string;
      name: string;
      description: string;
      testCaseIds: string[];
      createdAt: string;
      createdBy: string;
    };
  }

  async listEvalSuites(): Promise<Array<{
    suiteId: string;
    name: string;
    description: string;
    testCaseIds: string[];
    createdAt: string;
    createdBy: string;
  }>> {
    const suitesRef = collection(this.db, "eval_suites");
    const snap = await getDocs(suitesRef);
    return snap.docs.map((d) => d.data() as {
      suiteId: string;
      name: string;
      description: string;
      testCaseIds: string[];
      createdAt: string;
      createdBy: string;
    });
  }
}
