"use client";

import { useSearchParams } from "next/navigation";
import { useFormStatus } from "react-dom";
import Link from "next/link";

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {pending ? "Loading..." : label}
    </button>
  );
}

export default function AuthForm({
  action,
  buttonLabel,
  linkHref,
  linkLabel,
}: {
  action: (formData: FormData) => void;
  buttonLabel: string;
  linkHref: string;
  linkLabel: string;
}) {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  return (
    <form action={action} className="space-y-4">
      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-200">
          {error}
        </div>
      )}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="you@example.com"
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={6}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="At least 6 characters"
        />
      </div>
      <SubmitButton label={buttonLabel} />
      <p className="text-center text-sm text-gray-500">
        <Link href={linkHref} className="text-blue-600 hover:underline">
          {linkLabel}
        </Link>
      </p>
    </form>
  );
}
