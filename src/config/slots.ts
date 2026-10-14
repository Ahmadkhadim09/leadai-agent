/**
 * LeadPilot Demo Slot Configuration
 * 
 * DISCLAIMER / NOTICE:
 * Available slots represent mock SDR calendar availability for the prototype demonstration.
 * In production, this integrates with Google Calendar / Cal.com / Outlook via Cloud Functions.
 */

export interface DemoSlot {
  slotId: string;
  repName: string;
  repEmail: string;
  startTime: string; // ISO 8601
  endTime: string;   // ISO 8601
  isBooked: boolean;
  bookedByEmail?: string;
  bookedLeadId?: string;
}

export const DEMO_CALENDAR_CONFIG = {
  timezone: "America/Los_Angeles",
  slotDurationMinutes: 30,
  bufferMinutes: 15,
  businessHoursStart: "09:00",
  businessHoursEnd: "17:00",
  assignedRep: "Alex Chen (Senior Solutions Lead)",
  assignedRepEmail: "alex.chen@leadpilot.demo",
};

// Realistic mock slots for the upcoming 3 business days
export const INITIAL_DEMO_SLOTS: DemoSlot[] = [
  {
    slotId: "slot-20261014-1000",
    repName: "Alex Chen",
    repEmail: "alex.chen@leadpilot.demo",
    startTime: "2026-10-14T10:00:00-07:00",
    endTime: "2026-10-14T10:30:00-07:00",
    isBooked: false,
  },
  {
    slotId: "slot-20261014-1400",
    repName: "Alex Chen",
    repEmail: "alex.chen@leadpilot.demo",
    startTime: "2026-10-14T14:00:00-07:00",
    endTime: "2026-10-14T14:30:00-07:00",
    isBooked: true, // Example existing booked slot to test conflict guardrail
    bookedByEmail: "sarah@acmecorp.demo",
    bookedLeadId: "lead-001",
  },
  {
    slotId: "slot-20261014-1600",
    repName: "Alex Chen",
    repEmail: "alex.chen@leadpilot.demo",
    startTime: "2026-10-14T16:00:00-07:00",
    endTime: "2026-10-14T16:30:00-07:00",
    isBooked: false,
  },
  {
    slotId: "slot-20261015-1100",
    repName: "Alex Chen",
    repEmail: "alex.chen@leadpilot.demo",
    startTime: "2026-10-15T11:00:00-07:00",
    endTime: "2026-10-15T11:30:00-07:00",
    isBooked: false,
  },
  {
    slotId: "slot-20261015-1530",
    repName: "Alex Chen",
    repEmail: "alex.chen@leadpilot.demo",
    startTime: "2026-10-15T15:30:00-07:00",
    endTime: "2026-10-15T16:00:00-07:00",
    isBooked: false,
  },
  {
    slotId: "slot-20261016-0930",
    repName: "Alex Chen",
    repEmail: "alex.chen@leadpilot.demo",
    startTime: "2026-10-16T09:30:00-07:00",
    endTime: "2026-10-16T10:00:00-07:00",
    isBooked: false,
  },
];
