import { Suspense } from "react";
import AuthForm from "@/components/ui/AuthForm";
import { login } from "./actions";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
          <p className="mt-1 text-sm text-gray-500">
            Sign in to SupportSMS Mini
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <Suspense>
            <AuthForm
              action={login}
              buttonLabel="Sign In"
              linkHref="/signup"
              linkLabel="Don't have an account? Sign up"
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
