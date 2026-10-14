import React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PACKAGES_LIST, SAMPLE_PACKAGES_METADATA } from "@/config/packages";
import { INITIAL_DEMO_SLOTS, DEMO_CALENDAR_CONFIG } from "@/config/slots";
import {
  Sliders,
  DollarSign,
  Calendar,
  ShieldCheck,
  Check,
  Clock,
  User,
  Info,
  Lock,
} from "lucide-react";

export default function SettingsPage() {
  return (
    <AppShell>
      <div className="space-y-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Sliders className="w-5 h-5 text-blue-600" />
                <span>System Configuration & Pricing Registry</span>
              </h1>
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                Single Source of Truth
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Canonical package tier registry, SDR calendar scheduling rules, and AI safety guardrails.
            </p>
          </div>
        </div>

        {/* Section 1: Package Pricing Configuration */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                <span>Grounded Commercial Packages</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                The AI offer builder strictly references these pricing tiers. Autonomous discounts are barred.
              </p>
            </div>
            <div className="px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-[11px] font-medium flex items-center gap-1.5 self-start sm:self-auto shadow-xs">
              <Info className="w-3.5 h-3.5 text-blue-600" />
              <span>{SAMPLE_PACKAGES_METADATA.disclaimer}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PACKAGES_LIST.map((pkg) => (
              <div
                key={pkg.id}
                className={`bg-white border rounded-2xl p-6 shadow-xs flex flex-col justify-between relative overflow-hidden ${
                  pkg.id === "growth" ? "border-blue-500 ring-2 ring-blue-100" : "border-slate-200"
                }`}
              >
                {pkg.id === "growth" && (
                  <div className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider shadow-xs">
                    Most Popular
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                      {pkg.name}
                    </span>
                    <p className="text-xs text-slate-500 mt-1">{pkg.tagline}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-100">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-extrabold text-slate-900 font-mono">
                        ${pkg.monthlyPriceUSD.toLocaleString()}
                      </span>
                      <span className="text-xs text-slate-500">/month</span>
                    </div>
                    <div className="text-[11px] text-emerald-700 font-semibold font-mono mt-0.5">
                      ${pkg.annualPriceUSD.toLocaleString()} / year (Billed Annually)
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1">
                      Minimum Qualification Budget: ${pkg.minAnnualBudgetUSD.toLocaleString()}
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                      Tier Capabilities:
                    </span>
                    <ul className="space-y-1.5 text-xs text-slate-600">
                      {pkg.features.map((feat, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 text-[11px] text-slate-500 bg-slate-50 -mx-6 -mb-6 p-4">
                  <strong className="text-slate-800">Target ICP:</strong> {pkg.recommendedFor}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 2: Demo Slot Calendar Settings */}
        <div className="space-y-4 pt-4 border-t border-slate-200">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span>SDR Calendar Scheduling Configuration</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Parameters used by the autonomous scheduling tool (<code className="text-blue-700 font-mono font-medium">bookSlot</code>).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs text-xs space-y-1">
              <span className="text-slate-500">Assigned Solutions Rep</span>
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-blue-600" />
                <span>{DEMO_CALENDAR_CONFIG.assignedRep}</span>
              </div>
              <div className="text-[11px] text-slate-500 font-mono">
                {DEMO_CALENDAR_CONFIG.assignedRepEmail}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs text-xs space-y-1">
              <span className="text-slate-500">Meeting Duration</span>
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-purple-600" />
                <span>{DEMO_CALENDAR_CONFIG.slotDurationMinutes} Minutes</span>
              </div>
              <div className="text-[11px] text-slate-500">
                +{DEMO_CALENDAR_CONFIG.bufferMinutes}m buffer between calls
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs text-xs space-y-1">
              <span className="text-slate-500">Calendar Timezone</span>
              <div className="font-bold text-slate-900 font-mono">
                {DEMO_CALENDAR_CONFIG.timezone}
              </div>
              <div className="text-[11px] text-slate-500">Pacific Daylight Time</div>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs text-xs space-y-1">
              <span className="text-slate-500">Daily Operating Window</span>
              <div className="font-bold text-slate-900 font-mono">
                {DEMO_CALENDAR_CONFIG.businessHoursStart} - {DEMO_CALENDAR_CONFIG.businessHoursEnd}
              </div>
              <div className="text-[11px] text-slate-500">Monday through Friday</div>
            </div>
          </div>

          {/* Active Demo Slots Table */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 text-xs font-bold text-slate-700">
              SDR Calendar Slot Availability
            </div>
            <div className="divide-y divide-slate-100 text-xs">
              {INITIAL_DEMO_SLOTS.map((slot) => (
                <div
                  key={slot.slotId}
                  className="px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-slate-400 text-[11px]">{slot.slotId}</span>
                    <span className="font-semibold text-slate-900">
                      {new Date(slot.startTime).toLocaleDateString(undefined, {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}{" "}
                      at{" "}
                      {new Date(slot.startTime).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    {slot.isBooked ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[11px] font-semibold flex items-center gap-1">
                        <Lock className="w-3 h-3" />
                        <span>Reserved ({slot.bookedByEmail})</span>
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-semibold flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        <span>Available for Booking</span>
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Section 3: Safety Guardrails Policies */}
        <div className="space-y-4 pt-4 border-t border-slate-200">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Safety Guardrail Policies & Boundaries</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Deterministic rule engines preventing jailbreaks, secret leakage, and commercial manipulation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span>Prompt Injection & Admin Escalation Defense</span>
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                Blocks instruction overrides (&ldquo;ignore previous instructions&rdquo;), developer/DAN personas,
                admin privilege requests, and fake tag spoofing. Immediately halts qualification and triggers{" "}
                <code className="text-blue-700 font-mono font-medium">handoffToHuman</code> with critical security alert.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <Lock className="w-4 h-4 text-purple-600" />
                <span>System Prompt & Secret Protection</span>
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                Protects confidential backend prompt templates, API keys (Gemini / Firebase), environment
                variables, and internal scoring weights from extraction probes. Redirects dialogue to commercial topics.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                <span>Strict Pricing Grounding Guardrail</span>
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                The agent is mathematically barred from inventing custom discounts or altering package pricing.
                Offers must strictly originate from the verified packages registry with{" "}
                <code className="text-emerald-700 font-mono font-medium">appliedDiscountPercent: 0</code>.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <Calendar className="w-4 h-4 text-amber-500" />
                <span>Booking Conflict & Duplicate Prevention</span>
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                Verifies calendar slot availability and blocks double-booking of already reserved time slots.
                Flags duplicate appointment requests from identical prospect email addresses.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
