import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_KEY!
);

export async function POST(req: Request) {
    try {
        const { identifier, password } = await req.json();

        if (!identifier || !password) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        }
        const { data: userbyEmail, error: fetchError } = await supabase
            .from("admin_users")
            .select("*")
            .eq("email", identifier)
            .maybeSingle();

        const { data: userbyId, error: fetchErrorById } = await supabase
            .from("admin_users")
            .select("*")
            .eq("username", identifier)
            .maybeSingle();

        let user = userbyEmail || userbyId;

        if (fetchError && fetchError.code !== 'PGRST116') {
            throw fetchError;
        }
        if (fetchErrorById && fetchErrorById.code !== 'PGRST116') {
            throw fetchErrorById;
        }
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const passwordMatch = await bcrypt.compare(password, user.password_hash);
        if (!passwordMatch) {
            return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
        }

        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                role_id: user.role_id,
                username: user.username,
                is_admin: true
            },
            process.env.JWT_SECRET!
        );

        // 1️⃣ Fetch role -> permission mapping
        const { data: rolePerms, error: rolePermError } = await supabase
            .from("role_permissions")
            .select("permission_id")
            .eq("role_id", user.role_id);

        if (rolePermError) {
            throw rolePermError;
        }
        let permissionList: string[] = [];

        if (rolePerms && rolePerms.length > 0) {
            const permissionIds = rolePerms.map((rp) => rp.permission_id);

            // 2️⃣ Fetch permission names
            const { data: permissions, error: permError } = await supabase
                .from("permissions")
                .select("name")
                .in("id", permissionIds);

            if (permError) {
                throw permError;
            }

            permissionList = permissions.map((p) => p.name);
        }

        const userData = {
            id: user.id,
            name: user.name,
            email: user.email,
            username: user.username,
            role_id: user.role_id,
            permissions: permissionList,
        }

        const response = NextResponse.json({
            success: true,
            message: "Login successful",
            token,
            user: userData
        });

        return response;

    } catch (error) {
        return NextResponse.json({ error: "Server error: " + (error instanceof Error ? error.message : "Unknown error") }, { status: 500 });
    }
}