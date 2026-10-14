import {
  ExtractLeadInput,
  ExtractLeadOutput,
  ScoreLeadInput,
  ScoreLeadOutput,
  SuggestOfferInput,
  SuggestOfferOutput,
  BookSlotInput,
  BookSlotOutput,
  HandoffToHumanInput,
  HandoffToHumanOutput,
  ToolExecutionRecord,
  LeadFacts,
} from "@/types/tools";
import { ChatTurnRequest, ChatTurnResponse, QualificationState } from "@/types/chat";
import { scoreLeadFacts } from "@/lib/scoring/lead-scorer";
import { buildGroundedOffer } from "@/lib/pricing/offer-builder";
import {
  checkPromptInjection,
  checkSystemPromptLeak,
  checkBookingConflict,
  checkBantCompleteness,
} from "@/lib/guardrails/safety";
import { INITIAL_DEMO_SLOTS, DemoSlot } from "@/config/slots";
import { PipelineStage } from "@/types/pipeline";

/**
 * LocalMockAIAdapter
 * 
 * Provides deterministic, verifiable execution of the 5 AI tools and
 * the strict qualification state machine before connecting LLM APIs or Firebase.
 */
export class LocalMockAIAdapter {
  private activeSlots: DemoSlot[] = JSON.parse(JSON.stringify(INITIAL_DEMO_SLOTS));

  // ========================================================
  // 1. TOOL: extractLead
  // ========================================================
  async extractLead(input: ExtractLeadInput): Promise<ExtractLeadOutput> {
    const existing = input.currentFacts || {};
    const extracted: LeadFacts = { ...existing };

    // Concatenate all user text for deterministic fact extraction
    const userText = input.transcript
      .filter((t) => t.role === "user")
      .map((t) => t.content)
      .join(" ");

    // Extract email
    const emailMatch = userText.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/);
    if (emailMatch && !extracted.contactEmail) {
      extracted.contactEmail = emailMatch[1];
    }

    // Extract budget ($Xk or $X,000 or X dollars)
    const budgetKMatch = userText.match(/\$?(\d+)\s*k\b/i);
    const budgetFullMatch = userText.match(/\$?(\d{1,3}(?:,\d{3})+|\d+)\s*(?:dollars|usd|budget|\/year|\/yr)/i);
    if (budgetKMatch && !extracted.annualBudgetUSD) {
      extracted.annualBudgetUSD = parseInt(budgetKMatch[1], 10) * 1000;
    } else if (budgetFullMatch && !extracted.annualBudgetUSD) {
      extracted.annualBudgetUSD = parseInt(budgetFullMatch[1].replace(/,/g, ""), 10);
    }

    // Extract company name
    const companyMatch = userText.match(
      /(?:at|company is|from|with|we are|we're)\s+([A-Z][A-Za-z0-9&'.\s]{2,25}?(?:Inc|Corp|LLC|Systems|Technologies|Group|Solutions|Labs|Agency|Finance|Logistics|Bakery|Studio)?)(?:\.|\,|\s|$)/i
    );
    if (companyMatch && !extracted.companyName) {
      extracted.companyName = companyMatch[1].trim();
    }

    // Extract role & authority
    const roleMatch = userText.match(/(?:i am|i'm|role is|as)\s+(?:the\s+)?([A-Za-z\s]{3,30}?)(?:\.|,|\sand\b|$)/i);
    if (roleMatch && !extracted.role) {
      extracted.role = roleMatch[1].trim();
    }
    if (/decision maker|hold budget|sign the contract|ceo|founder|cro|vp|head of/i.test(userText)) {
      extracted.isDecisionMaker = true;
    } else if (/need to ask my boss|not decision maker|intern|researching for someone/i.test(userText)) {
      extracted.isDecisionMaker = false;
    }

    // Extract timeline
    if (/immediately|right away|asap|this week|q4 starts/i.test(userText)) {
      extracted.timeline = "immediate";
    } else if (/next month|30 days|few weeks/i.test(userText)) {
      extracted.timeline = "1_month";
    } else if (/next quarter|q1|q2|next year/i.test(userText)) {
      extracted.timeline = "next_quarter";
    } else if (/just browsing|exploring|curious|no rush/i.test(userText)) {
      extracted.timeline = "exploring";
    }

    // Extract pain point
    if (/pain point|problem is|struggling with|need to|looking to\s+([^.!?]+)/i.test(userText)) {
      const match = userText.match(/(?:struggling with|need to|looking to|problem is)\s+([^.!?]+)/i);
      if (match && !extracted.primaryPainPoint) {
        extracted.primaryPainPoint = match[1].trim();
      }
    }

    // Determine missing/unknown fields
    const allKeys: Array<keyof LeadFacts> = [
      "contactEmail",
      "companyName",
      "annualBudgetUSD",
      "timeline",
      "isDecisionMaker",
      "primaryPainPoint",
    ];
    const unknownFields = allKeys.filter((k) => extracted[k] === undefined);

    const confidenceScore = Math.max(0.4, (allKeys.length - unknownFields.length) / allKeys.length);

    return {
      extractedFacts: extracted,
      unknownFields,
      confidenceScore: Math.round(confidenceScore * 100) / 100,
      summary: `Extracted ${allKeys.length - unknownFields.length} of ${allKeys.length} key qualification fields.`,
    };
  }

  // ========================================================
  // 2. TOOL: scoreLead
  // ========================================================
  async scoreLead(input: ScoreLeadInput): Promise<ScoreLeadOutput> {
    return scoreLeadFacts(input.facts);
  }

  // ========================================================
  // 3. TOOL: suggestOffer
  // ========================================================
  async suggestOffer(input: SuggestOfferInput): Promise<SuggestOfferOutput> {
    return buildGroundedOffer(input.facts, input.score);
  }

  // ========================================================
  // 4. TOOL: bookSlot
  // ========================================================
  async bookSlot(input: BookSlotInput): Promise<BookSlotOutput> {
    const conflictCheck = checkBookingConflict(input.slotId, this.activeSlots, input.contactEmail);
    if (!conflictCheck.passed) {
      return {
        bookingId: "",
        slotId: input.slotId,
        confirmedStartTime: "",
        confirmedEndTime: "",
        assignedRep: "",
        assignedRepEmail: "",
        meetingLink: "",
        status: "conflict_detected",
        confirmationMessage: conflictCheck.message,
      };
    }

    const slotIndex = this.activeSlots.findIndex((s) => s.slotId === input.slotId);
    const targetSlot = this.activeSlots[slotIndex];

    this.activeSlots[slotIndex] = {
      ...targetSlot,
      isBooked: true,
      bookedByEmail: input.contactEmail,
      bookedLeadId: `lead-${Date.now()}`,
    };

    const bookingId = `book-${Date.now().toString(36)}`;
    const meetingLink = `https://meet.leadpilot.demo/sdr-room-${bookingId}`;

    return {
      bookingId,
      slotId: input.slotId,
      confirmedStartTime: targetSlot.startTime,
      confirmedEndTime: targetSlot.endTime,
      assignedRep: targetSlot.repName,
      assignedRepEmail: targetSlot.repEmail,
      meetingLink,
      status: "confirmed",
      confirmationMessage: `Demo confirmed for ${input.contactName} (${input.companyName}) on ${targetSlot.startTime} with ${targetSlot.repName}.`,
    };
  }

  // ========================================================
  // 5. TOOL: handoffToHuman
  // ========================================================
  async handoffToHuman(input: HandoffToHumanInput): Promise<HandoffToHumanOutput> {
    const ticketId = `ticket-${Date.now().toString(36).toUpperCase()}`;
    const assignedTeam =
      input.reason === "guardrail_triggered"
        ? "security_officer"
        : input.reason === "complex_enterprise_deal"
        ? "sales_engineering"
        : "tier_3_support";

    return {
      ticketId,
      assignedTeam,
      handoffStatus: "queued",
      messageToUser: `I have routed your inquiry to our ${assignedTeam.replace("_", " ")} team (Reference #${ticketId}). A specialist will review and respond shortly.`,
      timestamp: new Date().toISOString(),
    };
  }

  // ========================================================
  // SERVER-SIDE chatTurn SERVICE
  // ========================================================
  async chatTurn(request: ChatTurnRequest): Promise<ChatTurnResponse> {
    const toolCalls: ToolExecutionRecord[] = [];
    const userMessage = request.message.trim();
    const currentState = request.currentState || "GREETING";

    // Guardrail Check 1: Prompt Injection & Admin Escalation
    const injectionCheck = checkPromptInjection(userMessage);
    if (!injectionCheck.passed) {
      const toolStart = Date.now();
      const handoffOutput = await this.handoffToHuman({
        conversationId: request.conversationId,
        reason: "guardrail_triggered",
        urgency: "high",
        contextSummary: "Blocked prompt injection or unauthorized admin escalation attempt.",
        lastUserMessage: userMessage,
      });

      toolCalls.push({
        toolName: "handoffToHuman",
        input: { reason: "guardrail_triggered", userMessage },
        output: handoffOutput,
        executedAt: new Date().toISOString(),
        durationMs: Date.now() - toolStart,
        success: true,
      });

      return {
        reply: "I am LeadPilot, an AI sales agent designed strictly to assist with lead qualification, pricing packages, and scheduling demos. I cannot execute administrative commands or alter my operational parameters.",
        toolCalls,
        nextState: "HANDED_OFF",
        updatedFacts: request.currentFacts || {},
        pipelineStage: "lost",
        suggestedReplies: ["View standard pricing packages", "Speak with sales specialist"],
        guardrailAlert: {
          type: "prompt_injection",
          details: injectionCheck.message,
          actionTaken: "blocked",
        },
      };
    }

    // Guardrail Check 2: System Prompt Leak Probe
    const leakCheck = checkSystemPromptLeak(userMessage);
    if (!leakCheck.passed) {
      return {
        reply: "My internal system prompts, API keys, and operational credentials are confidential security assets. I am happy to answer any questions about LeadPilot features, our verified pricing tiers, or book an introductory demo for your team.",
        toolCalls,
        nextState: currentState,
        updatedFacts: request.currentFacts || {},
        pipelineStage: "new",
        suggestedReplies: [
          "What packages do you offer?",
          "How does LeadPilot qualify leads?",
          "Can I schedule a 15-min demo?",
        ],
        guardrailAlert: {
          type: "system_prompt_leak",
          details: leakCheck.message,
          actionTaken: "redirected",
        },
      };
    }

    // Step 1: Execute extractLead tool
    const transcriptForTool = [
      ...request.history.map((h) => ({ role: h.role === "assistant" ? ("assistant" as const) : ("user" as const), content: h.content })),
      { role: "user" as const, content: userMessage },
    ];

    const extractStart = Date.now();
    const extractResult = await this.extractLead({
      conversationId: request.conversationId,
      transcript: transcriptForTool,
      currentFacts: request.currentFacts,
    });

    toolCalls.push({
      toolName: "extractLead",
      input: { conversationId: request.conversationId },
      output: extractResult,
      executedAt: new Date().toISOString(),
      durationMs: Date.now() - extractStart,
      success: true,
    });

    const updatedFacts = extractResult.extractedFacts;

    // Step 2: Execute scoreLead tool
    const scoreStart = Date.now();
    const scoreResult = await this.scoreLead({ facts: updatedFacts });
    toolCalls.push({
      toolName: "scoreLead",
      input: { facts: updatedFacts },
      output: scoreResult,
      executedAt: new Date().toISOString(),
      durationMs: Date.now() - scoreStart,
      success: true,
    });

    // Check for explicit disqualification (e.g. Budget < $5k)
    if (updatedFacts.annualBudgetUSD !== undefined && updatedFacts.annualBudgetUSD < 5000 && updatedFacts.annualBudgetUSD > 0) {
      return {
        reply: `Thank you for sharing your budget details (${updatedFacts.annualBudgetUSD ? `$${updatedFacts.annualBudgetUSD}` : "under $5k"}). LeadPilot is built for high-growth inbound teams, and our introductory Starter tier begins at $4,900/year ($490/month). Because your stated budget is below this threshold, an off-the-shelf basic widget may be a more cost-effective match right now.`,
        toolCalls,
        nextState: "DISQUALIFIED",
        updatedFacts,
        currentScore: scoreResult.totalScore,
        pipelineStage: "lost",
        suggestedReplies: ["Review package requirements", "Contact support"],
      };
    }

    // Step 3: Check BANT completeness
    const bantStatus = checkBantCompleteness(updatedFacts);

    // Flow State Machine
    let nextState: QualificationState = currentState;
    let reply = "";
    let suggestedReplies: string[] = [];
    let pipelineStage: PipelineStage = scoreResult.recommendedStage;

    // State 1: GREETING or initial contact
    if (currentState === "GREETING" || !updatedFacts.companyName || !updatedFacts.primaryPainPoint) {
      if (!updatedFacts.companyName) {
        reply = "Welcome to LeadPilot! I can help you evaluate autonomous sales agents for your inbound funnel. To tailor the right solution, what is your company name and main lead qualification challenge?";
        nextState = "COLLECTING_BANT";
        suggestedReplies = [
          "We're Acme Corp, struggling with slow response times",
          "CloudTech SaaS, getting 500+ inbound leads/mo",
          "What pricing packages do you offer?",
        ];
      } else {
        reply = `Great to connect! At ${updatedFacts.companyName}, what is your expected timeline and estimated annual budget for sales automation?`;
        nextState = "COLLECTING_BANT";
        suggestedReplies = [
          "Budget is ~$15k, looking to deploy this month",
          "Around $25k-$35k annual budget, deploying immediately",
          "Just exploring options for next quarter",
        ];
      }
    } else if (!bantStatus.isComplete && nextState === "COLLECTING_BANT") {
      // Missing specific BANT elements
      if (bantStatus.missingFields.includes("budget")) {
        reply = `Thanks for the details regarding ${updatedFacts.companyName}. To ensure we configure the right tier (Starter, Growth, or Enterprise), what is your estimated annual budget?`;
        suggestedReplies = ["$5,000 - $12,000 (Starter)", "$12,000 - $30,000 (Growth)", "$30,000+ (Enterprise)"];
      } else if (bantStatus.missingFields.includes("timeline")) {
        reply = "Understood. When are you looking to launch this in your sales operations?";
        suggestedReplies = ["Immediately / this month", "Next month", "Next quarter"];
      } else if (bantStatus.missingFields.includes("decisionMaker")) {
        reply = "Are you the primary decision-maker for sales tooling, or will other executives be joining the evaluation?";
        suggestedReplies = ["I am the decision maker", "Evaluating with our VP of Sales", "Need team signoff"];
      }
    } else {
      // BANT criteria satisfied! Move to proposal or scheduling
      if (currentState === "COLLECTING_BANT" || currentState === "OFFERING_PROPOSAL") {
        const offerStart = Date.now();
        const offer = await this.suggestOffer({ facts: updatedFacts, score: scoreResult.totalScore });
        toolCalls.push({
          toolName: "suggestOffer",
          input: { facts: updatedFacts, score: scoreResult.totalScore },
          output: offer,
          executedAt: new Date().toISOString(),
          durationMs: Date.now() - offerStart,
          success: true,
        });

        nextState = "OFFERING_PROPOSAL";
        pipelineStage = "proposal_sent";
        reply = `Based on your requirements at ${updatedFacts.companyName} (Budget: $${updatedFacts.annualBudgetUSD?.toLocaleString()}/yr), the recommended tier is **${offer.tierName}** at **$${offer.priceUSD.toLocaleString()}/yr**. It includes ${offer.includedFeatures.slice(0, 3).join(", ")}. Would you like to schedule a 30-minute live demo with our Solutions Lead?`;
        suggestedReplies = [
          "Yes, let's schedule a demo",
          "What slots are available tomorrow?",
          "Can you explain the CRM integration?",
        ];
      }

      // If user asks to schedule or book
      if (/schedule|book|demo|available|slot|tomorrow|calendar/i.test(userMessage)) {
        nextState = "SCHEDULING_DEMO";
        const availableSlots = this.activeSlots.filter((s) => !s.isBooked);
        const slotDesc = availableSlots
          .slice(0, 2)
          .map((s) => `• ${new Date(s.startTime).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })} PT with ${s.repName}`)
          .join("\n");

        reply = `Here are upcoming available slots for a 30-minute architecture review:\n\n${slotDesc}\n\nShall I book one of these for ${updatedFacts.contactEmail || "your email"}?`;
        suggestedReplies = [
          `Book slot: ${availableSlots[0]?.slotId || "slot-20261014-1000"}`,
          "Check different time",
          "Send details by email",
        ];
      }

      // If user confirms a specific slot
      const slotMatch = userMessage.match(/slot-\d+-\d+/);
      if (slotMatch) {
        const slotId = slotMatch[0];
        const bookStart = Date.now();
        const bookingResult = await this.bookSlot({
          slotId,
          contactName: updatedFacts.contactName || "Sales Lead",
          contactEmail: updatedFacts.contactEmail || "lead@company.demo",
          companyName: updatedFacts.companyName || "Company",
        });

        toolCalls.push({
          toolName: "bookSlot",
          input: { slotId, contactEmail: updatedFacts.contactEmail },
          output: bookingResult,
          executedAt: new Date().toISOString(),
          durationMs: Date.now() - bookStart,
          success: bookingResult.status === "confirmed",
        });

        if (bookingResult.status === "confirmed") {
          nextState = "BOOKED";
          pipelineStage = "booked";
          reply = `🎉 Demo successfully scheduled! A calendar invitation has been sent to ${updatedFacts.contactEmail || "your email"} for ${bookingResult.confirmedStartTime}.\n\nMeeting Room: ${bookingResult.meetingLink}\nAssigned Host: ${bookingResult.assignedRep}`;
          suggestedReplies = ["Add to Google Calendar", "Prepare integration checklist", "Return to dashboard"];
        } else {
          reply = `Unable to confirm booking: ${bookingResult.confirmationMessage}. Please select an alternate slot.`;
          suggestedReplies = ["View available slots", "Contact support"];
        }
      }
    }

    return {
      reply,
      toolCalls,
      nextState,
      updatedFacts,
      currentScore: scoreResult.totalScore,
      pipelineStage,
      suggestedReplies,
    };
  }
}

export const defaultMockAIAdapter = new LocalMockAIAdapter();
