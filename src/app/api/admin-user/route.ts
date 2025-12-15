import { NextResponse } from "next/server";
import { authoriseAdmin } from "../utils/authorise";
import { createAdminSupabaseClient } from "@/utils/supabase/adminClient";

export async function GET(req: Request) {
  try {
    // Check JWT & permissions
    const admin = await authoriseAdmin(req, ["manage_admins"]);

    // Only SuperAdmin allowed
    if (admin.role_id !== 1) {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      );
    }

    const supabase = createAdminSupabaseClient();

    const { data, error } = await supabase
      .from("admin_users")
      .select(`id, 
        name, 
        email, 
        username, 
        role_id, 
        admin_roles:admin_roles(name)`);

    if (error) throw error;

    return NextResponse.json({ users: data });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch admin users" },
      { status: 500 }
    );
  }
}
