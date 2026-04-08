import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import ContactHeader from "./components/ContactHeader";
import MessageThread from "./components/MessageThread";
import MessageComposer from "./components/MessageComposer";
import type { Contact, Message } from "@/lib/types/database";

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ contactId: string }>;
}) {
  const { contactId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: membership } = await supabase
    .from("org_members")
    .select("org_id")
    .eq("user_id", user.id)
    .single();

  if (!membership) redirect("/login");

  // Fetch the contact (RLS ensures org isolation)
  const { data: contact } = await supabase
    .from("contacts")
    .select("*")
    .eq("id", contactId)
    .eq("org_id", membership.org_id)
    .single();

  if (!contact) notFound();

  // Fetch all messages for this contact
  const { data: messages } = await supabase
    .from("messages")
    .select("*")
    .eq("contact_id", contactId)
    .order("created_at", { ascending: true });

  return (
    <div className="flex h-full flex-col bg-white mx-auto max-w-2xl">
      <ContactHeader contact={contact as Contact} />
      <MessageThread
        initialMessages={(messages || []) as Message[]}
        contactId={contactId}
        orgId={membership.org_id}
      />
      <MessageComposer contactId={contactId} />
    </div>
  );
}
