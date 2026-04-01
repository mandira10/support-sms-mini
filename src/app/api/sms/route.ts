import { createClient } from "@supabase/supabase-js";
import twilio from "twilio";

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(request: Request) {
  const supabaseAdmin = getSupabaseAdmin();
  const formData = await request.formData();
  const from = formData.get("From") as string;
  const body = formData.get("Body") as string;

  // Validate Twilio signature (skip in dev if configured)
  if (process.env.TWILIO_AUTH_TOKEN && process.env.NODE_ENV === "production") {
    const signature = request.headers.get("x-twilio-signature") || "";
    const url = `${process.env.NEXT_PUBLIC_APP_URL}/api/sms`;
    const params: Record<string, string> = {};
    formData.forEach((value, key) => {
      params[key] = value as string;
    });
    const isValid = twilio.validateRequest(
      process.env.TWILIO_AUTH_TOKEN,
      signature,
      url,
      params
    );
    if (!isValid) {
      return new Response("Unauthorized", { status: 403 });
    }
  }

  if (!from || !body) {
    return new Response("Missing From or Body", { status: 400 });
  }

  const orgId = process.env.DEFAULT_ORG_ID;
  if (!orgId) {
    console.error("DEFAULT_ORG_ID not set");
    return new Response("<Response/>", {
      headers: { "Content-Type": "text/xml" },
    });
  }

  // Find or create contact
  let { data: contact } = await supabaseAdmin
    .from("contacts")
    .select("id")
    .eq("org_id", orgId)
    .eq("phone_number", from)
    .single();

  if (!contact) {
    const { data: newContact } = await supabaseAdmin
      .from("contacts")
      .insert({ org_id: orgId, phone_number: from })
      .select("id")
      .single();
    contact = newContact;
  }

  if (!contact) {
    console.error("Failed to create contact");
    return new Response("<Response/>", {
      headers: { "Content-Type": "text/xml" },
    });
  }

  // Save inbound message
  await supabaseAdmin.from("messages").insert({
    contact_id: contact.id,
    org_id: orgId,
    direction: "inbound",
    body: body,
  });

  // Return empty TwiML (no auto-reply)
  return new Response("<Response/>", {
    headers: { "Content-Type": "text/xml" },
  });
}
