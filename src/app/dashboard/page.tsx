import { createClient } from "@/lib/supabase/server";
import InboxList from "./components/InboxList";
import type { Message } from "@/lib/types/database";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: membership } = await supabase
    .from("org_members")
    .select("org_id")
    .eq("user_id", user.id)
    .limit(1)
    .single();

  if (!membership) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">No organization found. Please contact support.</p>
      </div>
    );
  }

  const orgId = membership.org_id;

  // Fetch contacts for this org
  const { data: contacts } = await supabase
    .from("contacts")
    .select("*")
    .eq("org_id", orgId)
    .order("created_at", { ascending: false });

  // Fetch the latest message per contact
  const latestMessages: Record<string, Message> = {};

  if (contacts && contacts.length > 0) {
    const contactIds = contacts.map((c) => c.id);
    const { data: messages } = await supabase
      .from("messages")
      .select("*")
      .in("contact_id", contactIds)
      .order("created_at", { ascending: false });

    if (messages) {
      for (const msg of messages) {
        if (!latestMessages[msg.contact_id]) {
          latestMessages[msg.contact_id] = msg as Message;
        }
      }
    }
  }

  // Sort contacts by latest message time
  const sortedContacts = [...(contacts || [])].sort((a, b) => {
    const msgA = latestMessages[a.id];
    const msgB = latestMessages[b.id];
    if (!msgA && !msgB) return 0;
    if (!msgA) return 1;
    if (!msgB) return -1;
    return new Date(msgB.created_at).getTime() - new Date(msgA.created_at).getTime();
  });

  return (
    <div className="mx-auto h-full max-w-2xl overflow-y-auto bg-white">
      <div className="border-b border-gray-200 px-4 py-3">
        <h2 className="text-lg font-semibold text-gray-900">Inbox</h2>
      </div>
      <InboxList
        contacts={sortedContacts}
        latestMessages={latestMessages}
        orgId={orgId}
      />
    </div>
  );
}
