"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Contact } from "@/lib/types/database";

export default function ContactHeader({ contact }: { contact: Contact }) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(contact.name || "");
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  async function handleSave() {
    setSaving(true);
    const res = await fetch("/api/contacts/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contactId: contact.id, name: name.trim() }),
    });
    if (res.ok) {
      setIsEditing(false);
      router.refresh();
    }
    setSaving(false);
  }

  return (
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
      <div className="flex-1 min-w-0">
        {isEditing ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSave();
                if (e.key === "Escape") setIsEditing(false);
              }}
              className="rounded border border-gray-300 px-2 py-0.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Contact name"
              autoFocus
            />
            <button
              onClick={handleSave}
              disabled={saving}
              className="text-xs text-blue-600 hover:underline disabled:opacity-50"
            >
              {saving ? "..." : "Save"}
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="text-xs text-gray-400 hover:underline"
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-gray-900 truncate">
              {contact.name || contact.phone_number}
            </p>
            <button
              onClick={() => setIsEditing(true)}
              className="text-xs text-gray-400 hover:text-gray-600"
              title="Edit name"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
              </svg>
            </button>
          </div>
        )}
        {contact.name && !isEditing && (
          <p className="text-xs text-gray-500">{contact.phone_number}</p>
        )}
        {!contact.name && !isEditing && (
          <p className="text-xs text-gray-400">Click pencil to add a name</p>
        )}
      </div>
    </div>
  );
}
