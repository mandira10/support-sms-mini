import { Suspense } from "react";
import AuthForm from "@/components/ui/AuthForm";
import { signup } from "@/app/login/actions";

export default function SignupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Create account</h1>
          <p className="mt-1 text-sm text-gray-500">
            Get started with SupportSMS Mini
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <Suspense>
            <AuthForm
              action={signup}
              buttonLabel="Sign Up"
              linkHref="/login"
              linkLabel="Already have an account? Sign in"
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
