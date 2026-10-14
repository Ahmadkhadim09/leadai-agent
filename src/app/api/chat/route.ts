import { NextRequest, NextResponse } from "next/server";
import { ChatTurnRequestSchema, ChatTurnResponseSchema } from "@/lib/schemas/chat.schema";
import { chatService } from "@/features/ai/chat-service";

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const parseResult = ChatTurnRequestSchema.safeParse(json);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: "Invalid request payload",
          issues: parseResult.error.issues,
        },
        { status: 400 }
      );
    }

    const response = await chatService.chatTurn(parseResult.data);

    // Validate response adhering to contract
    const validOut = ChatTurnResponseSchema.safeParse(response);
    if (!validOut.success) {
      console.error("Chat turn response schema violation:", validOut.error);
    }

    return NextResponse.json(response);
  } catch (error: unknown) {
    console.error("Chat API error:", error);
    const message = error instanceof Error ? error.message : "Internal server error during chat turn";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
