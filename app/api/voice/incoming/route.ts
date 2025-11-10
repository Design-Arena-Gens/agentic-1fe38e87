import { NextRequest, NextResponse } from "next/server";
import { renderGatherTwiml } from "@/lib/twilio";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const origin = request.nextUrl.origin;
  const actionUrl = `${origin}/api/voice/respond`;

  const assistantName = process.env.ASSISTANT_NAME ?? "your assistant";
  const greeting =
    process.env.ASSISTANT_GREETING ??
    `Hi, this is ${assistantName}. I'm here to help. What can I do for you today?`;
  const fallback =
    process.env.ASSISTANT_NO_INPUT_MESSAGE ??
    "I did not hear anything, but you can call back any time.";

  const twiml = renderGatherTwiml({
    actionUrl,
    spokenPrompt: greeting,
    fallbackMessage: fallback,
  });

  return new NextResponse(twiml, {
    headers: {
      "Content-Type": "text/xml",
    },
  });
}

export async function GET() {
  return NextResponse.json({
    status: "ok",
    message:
      "Configure your Twilio phone number to POST incoming voice calls to this endpoint.",
  });
}
