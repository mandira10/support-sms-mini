import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import twilio from "twilio";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { contactId, body } = await request.json();

  if (!contactId || !body) {
    return NextResponse.json(
      { error: "Missing contactId or body" },
      { status: 400 }
    );
  }

  // Get user's org
  const { data: membership } = await supabase
    .from("org_members")
    .select("org_id")
    .eq("user_id", user.id)
    .single();

  if (!membership) {
    return NextResponse.json({ error: "No organization" }, { status: 403 });
  }

  // Fetch contact (RLS ensures org access)
  const { data: contact } = await supabase
    .from("contacts")
    .select("*")
    .eq("id", contactId)
    .single();

  if (!contact) {
    return NextResponse.json({ error: "Contact not found" }, { status: 404 });
  }

  // Send SMS via Twilio
  try {
    const twilioClient = twilio(
      process.env.TWILIO_ACCOUNT_SID!,
      process.env.TWILIO_AUTH_TOKEN!
    );

    await twilioClient.messages.create({
      body,
      from: process.env.TWILIO_PHONE_NUMBER!,
      to: contact.phone_number,
    });
  } catch (error) {
    console.error("Twilio send error:", error);
    return NextResponse.json(
      { error: "Failed to send SMS" },
      { status: 500 }
    );
  }

  // Save outbound message
  const { error: dbError } = await supabase.from("messages").insert({
    contact_id: contactId,
    org_id: membership.org_id,
    direction: "outbound",
    body,
  });

  if (dbError) {
    console.error("DB insert error:", dbError);
    return NextResponse.json(
      { error: "Message sent but failed to save" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
