
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createAdminSupabaseClient } from "@/utils/supabase/adminClient";
import { authoriseAdmin } from "../../utils/authorise";

export async function POST(req: Request) {
    try {
        await authoriseAdmin(req, ["manage_admins"]);

        const supabase = createAdminSupabaseClient();

        const { name, email, username, password, role_id } = await req.json();
        
        if (!email || !password || !role_id || !username || !name) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        }

        const { data: existingEmail, error: fetchError } = await supabase
            .from("admin_users")
            .select("*")
            .eq("email", email)
            .single();

        if (existingEmail) {
            return NextResponse.json({ error: "Email already in use" }, { status: 400 });
        }

        const { data: existingUsername, error: fetchErrorByUsername } = await supabase
            .from("admin_users")
            .select("*")
            .eq("username", username)
            .single();

        if (existingUsername) {
            return NextResponse.json({ error: "Username already in use" }, { status: 400 });
        }

        const password_hash = await bcrypt.hash(password, 10);

        const { error } = await supabase.from("admin_users").insert({
            name,
            email,
            username,
            password_hash,
            role_id,
        });

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        return NextResponse.json({ message: "Admin user created" });
    } catch (error) {
        return NextResponse.json({ error: `Server error ${error}` }, { status: 500 });
    }
}