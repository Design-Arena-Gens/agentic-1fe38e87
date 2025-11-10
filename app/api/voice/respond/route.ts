import { NextRequest, NextResponse } from "next/server";
import { getOpenAIClient, DEFAULT_MODEL } from "@/lib/openai";
import {
  ConversationMessage,
  clearConversation,
  getConversation,
  updateConversation,
} from "@/lib/conversation-store";
import {
  matchesGoodbyeIntent,
  renderAssistantReply,
  renderGatherTwiml,
  renderGoodbyeTwiml,
} from "@/lib/twilio";

export const runtime = "nodejs";

const MAX_HISTORY_MESSAGES = 12;

type OpenAIMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

const defaultSystemPrompt = () => {
  const assistantName = process.env.ASSISTANT_NAME ?? "Avery";
  const companyName = process.env.ASSISTANT_COMPANY ?? "our team";
  return [
    `You are ${assistantName}, a warm and professional phone concierge for ${companyName}.`,
    "Speak naturally in short sentences (15 words or fewer) and keep a calm, confident tone.",
    "Always confirm caller intent, gather key details, and reassure the caller that you can help.",
    "Never mention that you are an AI model. Do not invent information you do not have.",
    "If a request requires human follow-up, offer to take a message or schedule a call back.",
    "If the caller asks for a person, check availability, then offer to take contact info or schedule.",
  ].join(" ");
};

function ensureHistoryWindow(
  history: ConversationMessage[]
): ConversationMessage[] {
  if (history.length <= MAX_HISTORY_MESSAGES) {
    return history;
  }
  return history.slice(history.length - MAX_HISTORY_MESSAGES);
}

function buildPromptMessages(opts: {
  transcript: string;
  history: ConversationMessage[];
}): OpenAIMessage[] {
  const systemPrompt = process.env.ASSISTANT_SYSTEM_PROMPT ?? defaultSystemPrompt();
  const historyMessages: OpenAIMessage[] = opts.history.map((message) => ({
    role: message.role,
    content: message.content,
  }));
  return [
    { role: "system", content: systemPrompt },
    ...historyMessages,
    {
      role: "user",
      content: opts.transcript,
    },
  ];
}

function conversationUpdatePayload(
  history: ConversationMessage[],
  userText: string,
  assistantText: string
): ConversationMessage[] {
  const updated: ConversationMessage[] = [
    ...history,
    { role: "user", content: userText },
    { role: "assistant", content: assistantText },
  ];
  return ensureHistoryWindow(updated);
}

export async function POST(request: NextRequest) {
  const origin = request.nextUrl.origin;
  const actionUrl = `${origin}/api/voice/respond`;

  const form = await request.formData();
  const callSid = form.get("CallSid")?.toString();
  const transcript = form.get("SpeechResult")?.toString().trim();

  if (!callSid) {
    const errorResponse = renderGoodbyeTwiml({
      farewell:
        "I ran into a technical issue identifying this call. Please try again later.",
    });
    return new NextResponse(errorResponse, {
      headers: { "Content-Type": "text/xml" },
      status: 400,
    });
  }

  if (!transcript) {
    const promptMessage =
      process.env.ASSISTANT_REPROMPT ??
      "I did not catch that. Could you repeat what you need help with?";
    const twiml = renderGatherTwiml({
      actionUrl,
      spokenPrompt: promptMessage,
      fallbackMessage: "I'll hang up now, but please call again any time.",
    });
    return new NextResponse(twiml, {
      headers: { "Content-Type": "text/xml" },
    });
  }

  if (matchesGoodbyeIntent(transcript)) {
    clearConversation(callSid);
    const farewell =
      process.env.ASSISTANT_FAREWELL ??
      "It was great speaking with you. I'll end the call now. Goodbye!";
    const twiml = renderGoodbyeTwiml({ farewell });
    return new NextResponse(twiml, {
      headers: { "Content-Type": "text/xml" },
    });
  }

  const history = ensureHistoryWindow(getConversation(callSid));

  let assistantReply =
    process.env.ASSISTANT_FALLBACK ??
    "I'm having trouble responding right now, but we'll follow up with you shortly.";

  try {
    const openai = getOpenAIClient();
    const completion = await openai.chat.completions.create({
      model: DEFAULT_MODEL,
      temperature: 0.6,
      max_tokens: 180,
      messages: buildPromptMessages({ transcript, history }),
    });

    assistantReply =
      completion.choices[0]?.message?.content?.trim() ?? assistantReply;
  } catch (error) {
    console.error("OpenAI chat completion error", error);
  }

  updateConversation(
    callSid,
    conversationUpdatePayload(history, transcript, assistantReply)
  );

  const twiml = renderAssistantReply({
    message: assistantReply,
    actionUrl,
  });

  return new NextResponse(twiml, {
    headers: { "Content-Type": "text/xml" },
  });
}
