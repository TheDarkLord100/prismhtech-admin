import { NextResponse } from "next/server";
import { authoriseAdmin } from "../utils/authorise";
import { createAdminSupabaseClient } from "@/utils/supabase/adminClient";

export async function GET(req: Request) {
  try {
    // ✅ Only admins with view_users can access
    await authoriseAdmin(req, ["manage_users"]);
    const supabaseServer = createAdminSupabaseClient();
    const { data, error } = await supabaseServer
      .from("users")
      .select(`
        id,
        name,
        email,
        phone,
        dob,
        location,
        gstin,
        created_at,
        email_verified
      `)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ users: data });

  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Unauthorized" },
      { status: 401 }
    );
  }
}