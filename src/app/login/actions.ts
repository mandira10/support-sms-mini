"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function login(formData: FormData) {
  const supabase = await createClient();

  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const { error } = await supabase.auth.signInWithPassword(data);

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function signup(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { data: authData, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    redirect(`/signup?error=${encodeURIComponent(error.message)}`);
  }

  if (authData.user) {
    // Create organization for the new user
    const { data: org, error: orgError } = await supabase
      .from("organizations")
      .insert({ name: `${email}'s Organization` })
      .select()
      .single();

    if (orgError) {
      redirect(`/signup?error=${encodeURIComponent("Failed to create organization")}`);
    }

    // Link user to organization
    await supabase.from("org_members").insert({
      org_id: org.id,
      user_id: authData.user.id,
      role: "admin",
    });
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}
