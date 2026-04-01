import { getUserOrg } from "@/lib/helpers/get-user-org";
import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import MessageThread from "./components/MessageThread";
import MessageComposer from "./components/MessageComposer";
import type { Message } from "@/lib/types/database";

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ contactId: string }>;
}) {
  const { contactId } = await params;
  const result = await getUserOrg();
  if (!result) redirect("/login");

  const supabase = await createClient();

  // Fetch the contact (RLS ensures org isolation)
  const { data: contact } = await supabase
    .from("contacts")
    .select("*")
    .eq("id", contactId)
    .eq("org_id", result.orgId)
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
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-gray-200 px-4 py-3">
        <Link
          href="/dashboard"
          className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
        </Link>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-medium text-blue-700">
          {(contact.name || contact.phone_number).charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900">
            {contact.name || contact.phone_number}
          </p>
          {contact.name && (
            <p className="text-xs text-gray-500">{contact.phone_number}</p>
          )}
        </div>
      </div>

      {/* Messages */}
      <MessageThread
        initialMessages={(messages || []) as Message[]}
        contactId={contactId}
        orgId={result.orgId}
      />

      {/* Composer */}
      <MessageComposer contactId={contactId} />
    </div>
  );
}
