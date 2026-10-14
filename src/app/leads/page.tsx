import React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { defaultFirebaseAdapter } from "@/features/leads/leads-store";
import { LeadTable } from "@/components/leads/LeadTable";
import { Users, Plus } from "lucide-react";
import Link from "next/link";

export default async function LeadsPage() {
  const leads = await defaultFirebaseAdapter.listLeads();

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-6 h-6 text-blue-600" />
                <span>Inbound Deals Pipeline</span>
              </h1>
              <span className="px-3 py-1 text-xs font-bold rounded-full bg-slate-100 text-slate-700 border border-slate-200 font-mono">
                {leads.length} Records
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Searchable CRM database of autonomously qualified prospects with BANT scores, pipeline stages, and audit notes.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/chat"
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold flex items-center gap-2 transition-colors shadow-sm shadow-blue-600/30"
            >
              <Plus className="w-4 h-4" />
              <span>Simulate New Lead</span>
            </Link>
          </div>
        </div>

        {/* Lead Table */}
        <LeadTable leads={leads} />
      </div>
    </AppShell>
  );
}
