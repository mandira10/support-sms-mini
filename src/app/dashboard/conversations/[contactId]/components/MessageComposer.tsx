"use client";

import { useState } from "react";

export default function MessageComposer({
  contactId,
}: {
  contactId: string;
}) {
  const [body, setBody] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [warning, setWarning] = useState<string | null>(null);

  async function handleSend() {
    if (!body.trim()) return;
    setIsSending(true);
    setWarning(null);
    try {
      const res = await fetch("/api/sms/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contactId, body: body.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        setBody("");
        if (data.warning) {
          setWarning(data.warning);
        }
      }
    } finally {
      setIsSending(false);
    }
  }

  async function handleSuggest() {
    setIsSuggesting(true);
    try {
      const res = await fetch("/api/ai/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contactId }),
      });
      if (res.ok) {
        const data = await res.json();
        setBody(data.suggestion);
      }
    } finally {
      setIsSuggesting(false);
    }
  }

  return (
    <div className="border-t border-gray-200 bg-white p-4">
      <div className="flex gap-2 items-end">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Type a message..."
          rows={3}
          className="flex-1 resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={isSending}
        />
        <div className="flex flex-col gap-2">
          <button
            onClick={handleSuggest}
            disabled={isSuggesting}
            className="rounded-lg border border-purple-300 bg-purple-50 px-3 py-2 text-sm font-medium text-purple-700 hover:bg-purple-100 disabled:opacity-50 transition-colors"
            title="AI Suggest Reply"
          >
            {isSuggesting ? "..." : "AI"}
          </button>
          <button
            onClick={handleSend}
            disabled={isSending || !body.trim()}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {isSending ? "..." : "Send"}
          </button>
        </div>
      </div>
      {warning && (
        <div className="mt-2 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-700">
          {warning}
        </div>
      )}
      <p className="mt-1 text-xs text-gray-400">
        {body.length}/160 characters
      </p>
    </div>
  );
}
