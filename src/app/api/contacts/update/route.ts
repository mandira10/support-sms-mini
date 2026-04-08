import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { contactId, name } = await request.json();

  if (!contactId) {
    return NextResponse.json(
      { error: "Missing contactId" },
      { status: 400 }
    );
  }

  // RLS ensures user can only update contacts in their org
  const { error } = await supabase
    .from("contacts")
    .update({ name: name || null })
    .eq("id", contactId);

  if (error) {
    console.error("Update error:", error);
    return NextResponse.json(
      { error: "Failed to update contact" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
