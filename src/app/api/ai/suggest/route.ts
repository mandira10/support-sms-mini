import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import OpenAI from "openai";

function getOpenAI() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
}

const SYSTEM_PROMPT = `You are a helpful SMS reply assistant for a charity/fundraising organization.
Generate ONE concise SMS reply (maximum 160 characters) based on the conversation.
Be warm, grateful, and professional. Match the supporter's tone.
Only output the SMS text itself, nothing else. No quotes, no labels, no formatting.`;

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { contactId } = await request.json();

  if (!contactId) {
    return NextResponse.json(
      { error: "Missing contactId" },
      { status: 400 }
    );
  }

  // Fetch recent messages for context
  const { data: messages } = await supabase
    .from("messages")
    .select("direction, body")
    .eq("contact_id", contactId)
    .order("created_at", { ascending: true })
    .limit(10);

  if (!messages || messages.length === 0) {
    return NextResponse.json(
      { suggestion: "Thank you for reaching out! How can we help you today?" },
    );
  }

  // Build conversation history for OpenAI
  const conversationHistory = messages.map((msg) => ({
    role: (msg.direction === "inbound" ? "user" : "assistant") as
      | "user"
      | "assistant",
    content: msg.body,
  }));

  try {
    const completion = await getOpenAI().chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...conversationHistory,
      ],
      max_tokens: 100,
      temperature: 0.7,
    });

    const suggestion =
      completion.choices[0]?.message?.content?.trim() || "Thank you for your message!";

    return NextResponse.json({ suggestion });
  } catch (error) {
    console.error("OpenAI error:", error);
    return NextResponse.json(
      { error: "Failed to generate suggestion" },
      { status: 500 }
    );
  }
}
