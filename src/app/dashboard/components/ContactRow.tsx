import Link from "next/link";
import type { Contact, Message } from "@/lib/types/database";

function timeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function ContactRow({
  contact,
  latestMessage,
}: {
  contact: Contact;
  latestMessage: Message | null;
}) {
  return (
    <Link
      href={`/dashboard/conversations/${contact.id}`}
      className="flex items-center gap-3 border-b border-gray-100 px-4 py-3 hover:bg-gray-50 transition-colors"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-medium text-blue-700">
        {(contact.name || contact.phone_number).charAt(0).toUpperCase()}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between">
          <p className="truncate text-sm font-medium text-gray-900">
            {contact.name || contact.phone_number}
          </p>
          {latestMessage && (
            <span className="ml-2 shrink-0 text-xs text-gray-400">
              {timeAgo(latestMessage.created_at)}
            </span>
          )}
        </div>
        {latestMessage && (
          <p className="truncate text-sm text-gray-500">
            {latestMessage.direction === "outbound" && (
              <span className="text-gray-400">You: </span>
            )}
            {latestMessage.body}
          </p>
        )}
      </div>
    </Link>
  );
}
