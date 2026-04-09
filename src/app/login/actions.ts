"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function login(formData: FormData) {
  const supabase = await createClient();

  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const { error } = await supabase.auth.signInWithPassword(data);

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function signup(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { data: authData, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    redirect(`/signup?error=${encodeURIComponent(error.message)}`);
  }

  if (authData.user) {
    // Create organization for the new user
    const { data: org, error: orgError } = await supabase
      .from("organizations")
      .insert({ name: `${email}'s Organization` })
      .select()
      .single();

    if (orgError) {
      redirect(`/signup?error=${encodeURIComponent("Failed to create organization")}`);
    }

    // Link user to organization
    await supabase.from("org_members").insert({
      org_id: org.id,
      user_id: authData.user.id,
      role: "admin",
    });

    // Seed demo conversations so new users see a populated inbox
    await seedDemoConversations(supabase, org.id);
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

async function seedDemoConversations(supabase: SupabaseClient, orgId: string) {
  const demoContacts = [
    {
      phone_number: "+4915100000001",
      name: "Sarah M.",
      messages: [
        { direction: "inbound", body: "Hi! I want to help with the food drive next Saturday." },
        { direction: "inbound", body: "Can you tell me where to sign up?" },
        { direction: "outbound", body: "Hi Sarah! Thank you so much for wanting to help. You can sign up at our website: hopefoundation.org/volunteer" },
      ],
    },
    {
      phone_number: "+4917600000002",
      name: "Anna R.",
      messages: [
        { direction: "inbound", body: "I donated €50 last month but haven't received a receipt yet." },
      ],
    },
    {
      phone_number: "+4915112345678",
      name: "Tom W.",
      messages: [
        { direction: "inbound", body: "Hi, I would like to donate to your clean water project!" },
        { direction: "outbound", body: "Thank you so much for your generosity! Your support makes a real difference. You can donate here: hopefoundation.org/donate" },
      ],
    },
    {
      phone_number: "+4917698765432",
      name: "Lisa K.",
      messages: [
        { direction: "inbound", body: "When is the next fundraising event?" },
      ],
    },
  ];

  for (const contact of demoContacts) {
    const { data: newContact } = await supabase
      .from("contacts")
      .insert({
        org_id: orgId,
        phone_number: contact.phone_number,
        name: contact.name,
      })
      .select()
      .single();

    if (newContact) {
      const messagesToInsert = contact.messages.map((msg) => ({
        contact_id: newContact.id,
        org_id: orgId,
        direction: msg.direction,
        body: msg.body,
      }));
      await supabase.from("messages").insert(messagesToInsert);
    }
  }
}
