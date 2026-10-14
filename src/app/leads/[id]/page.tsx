import React, { Suspense } from "react";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { defaultFirebaseAdapter, MOCK_LEADS } from "@/features/leads/leads-store";
import { LeadDetailView } from "./LeadDetailView";
import { Loader2 } from "lucide-react";

interface LeadPageProps {
  params: Promise<{ id: string }>;
}

export function generateStaticParams() {
  return MOCK_LEADS.map((lead) => ({ id: lead.id }));
}

async function LeadDetailAsync({ id }: { id: string }) {
  const lead = await defaultFirebaseAdapter.getLead(id);

  if (!lead) {
    notFound();
  }

  return <LeadDetailView initialLead={lead} />;
}

export default async function LeadDetailPage({ params }: LeadPageProps) {
  const { id } = await params;

  return (
    <AppShell>
      <Suspense
        fallback={
          <div className="flex flex-col items-center justify-center p-16 space-y-3">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
            <p className="text-xs text-slate-400">Loading deal records...</p>
          </div>
        }
      >
        <LeadDetailAsync id={id} />
      </Suspense>
    </AppShell>
  );
}
