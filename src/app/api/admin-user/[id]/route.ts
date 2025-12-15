import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createAdminSupabaseClient } from "@/utils/supabase/adminClient";
import { authoriseAdmin } from "../../utils/authorise";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // ✅ Permission Check
    await authoriseAdmin(req, ["manage_admins"]);
    const { id } = await params;

    const { name, password, role_id } = await req.json();

    if (!name || !role_id) {
      return NextResponse.json(
        { error: "Name and role are required" },
        { status: 400 }
      );
    }

    const updateData: any = {
      name,
      role_id,
    };

    // ✅ Update password only if provided
    if (password && password.length >= 6) {
      updateData.password_hash = await bcrypt.hash(password, 10);
    }
    const supabaseServer = createAdminSupabaseClient();
    const { error } = await supabaseServer
      .from("admin_users")
      .update(updateData)
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Unauthorized" },
      { status: 401 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // ✅ Permission Check
    const admin = await authoriseAdmin(req, ["manage_admins"]);
    const supabaseServer = createAdminSupabaseClient();
    const { id } = await params;
    // ✅ Fetch target admin
    const { data: target, error: fetchError } = await supabaseServer
      .from("admin_users")
      .select("id, role_id")
      .eq("id", id)
      .single();

    if (fetchError || !target) {
      return NextResponse.json(
        { error: "Admin not found" },
        { status: 404 }
      );
    }

    // ✅ Protect Master Admin (role_id = 1)
    if (target.role_id === 1) {
      return NextResponse.json(
        { error: "Master Admin cannot be deleted" },
        { status: 403 }
      );
    }

    // ✅ Prevent self-delete (optional but very important)
    if (target.id === admin.id) {
      return NextResponse.json(
        { error: "You cannot delete your own account" },
        { status: 403 }
      );
    }
    
    // ✅ Delete
    const { error } = await supabaseServer
      .from("admin_users")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Unauthorized" },
      { status: 401 }
    );
  }
}