import { NextResponse } from "next/server";
import { authoriseAdmin } from "../utils/authorise";
import { createAdminSupabaseClient } from "@/utils/supabase/adminClient";

export async function GET(req: Request) {
    try {
        // ✅ Only admins with manage_admins can fetch roles
        await authoriseAdmin(req, "manage_admins");
        const supabaseServer = createAdminSupabaseClient();
        const { data, error } = await supabaseServer
            .from("admin_roles")
            .select("id, name")
            .order("id");

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ roles: data });

    } catch (err: any) {
        return NextResponse.json(
            { error: err.message || "Unauthorized" },
            { status: 401 }
        );
    }
}