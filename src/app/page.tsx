import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
      <div className="text-center">
        <div className="mb-4 inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
          Portfolio Demo
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          SupportSMS Mini
        </h1>
        <p className="mt-4 text-lg text-gray-600 max-w-md mx-auto">
          Two-way SMS inbox with AI-suggested replies. Built for charity and
          fundraising teams.
        </p>
        <div className="mt-8 flex gap-3 justify-center">
          <Link
            href="/login"
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
          >
            Log In
          </Link>
          <Link
            href="/signup"
            className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Sign Up
          </Link>
        </div>
        <p className="mt-12 text-xs text-gray-400">
          Next.js &middot; Supabase &middot; Twilio &middot; OpenAI &middot; Tailwind
        </p>
      </div>
    </div>
  );
}
