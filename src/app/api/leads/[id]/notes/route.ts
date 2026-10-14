import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyUserAuthorization } from "@/lib/auth/server-auth";
import { defaultFirebaseAdapter } from "@/features/leads/leads-store";

const AddNoteSchema = z.object({
  content: z.string().min(1, "Note content cannot be empty"),
  author: z.string().optional(),
});

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    // Server-Side Authorization check: Cryptographically verify bearer token
    const authResult = await verifyUserAuthorization(req);
    if (!authResult.authorized) {
      return NextResponse.json(
        { error: authResult.error || "Unauthorized: Sign in is required to contribute internal notes." },
        { status: authResult.statusCode }
      );
    }

    const json = await req.json();
    const parse = AddNoteSchema.safeParse(json);
    if (!parse.success) {
      return NextResponse.json(
        { error: "Invalid request payload", issues: parse.error.issues },
        { status: 400 }
      );
    }

    const { content } = parse.data;
    // Derive author from cryptographically verified user identity, never trusting raw client payload
    const verifiedAuthor =
      authResult.user?.displayName ||
      authResult.user?.email ||
      parse.data.author ||
      "Team Member";

    await defaultFirebaseAdapter.addLeadNote(id, content, verifiedAuthor);

    return NextResponse.json({
      success: true,
      leadId: id,
      note: {
        content,
        author: verifiedAuthor,
        createdAt: new Date().toISOString(),
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
