import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyAdminAuthorization } from "@/lib/auth/server-auth";
import { defaultFirebaseAdapter } from "@/features/leads/leads-store";
import { PipelineStageSchema } from "@/lib/schemas/tools.schema";

const UpdateStageSchema = z.object({
  targetStage: PipelineStageSchema,
  reason: z.string().min(3, "Reason must be at least 3 characters"),
  adminId: z.string().min(1, "Admin ID is required"),
});

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    // Server-Side Authorization: Never trust client UI alone
    const authResult = await verifyAdminAuthorization(req);
    if (!authResult.authorized) {
      return NextResponse.json(
        { error: authResult.error || "Unauthorized: Admin privileges required." },
        { status: authResult.statusCode }
      );
    }

    const json = await req.json();
    const parse = UpdateStageSchema.safeParse(json);
    if (!parse.success) {
      return NextResponse.json(
        { error: "Invalid request payload", issues: parse.error.issues },
        { status: 400 }
      );
    }

    const { targetStage, reason, adminId } = parse.data;

    await defaultFirebaseAdapter.updateLeadStage(id, targetStage, adminId, reason);

    return NextResponse.json({
      success: true,
      leadId: id,
      targetStage,
      updatedBy: authResult.user?.email || adminId,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
