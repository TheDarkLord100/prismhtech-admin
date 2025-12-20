import { NextResponse } from "next/server";
import { authoriseAdmin } from "@/app/api/utils/authorise";
import { createAdminSupabaseClient } from "@/utils/supabase/adminClient";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await authoriseAdmin(req, ["manage_admins"]);

    const supabase = createAdminSupabaseClient();
    const roleId = Number((await params).id);
    const body = await req.json();

    const { name, description, permissions } = body;

    if (!roleId || !Array.isArray(permissions)) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    // 1️⃣ Update role meta
    const { error: roleError } = await supabase
      .from("admin_roles")
      .update({ name, description })
      .eq("id", roleId);

    if (roleError) throw roleError;

    // 2️⃣ Remove old permissions
    const { error: deleteError } = await supabase
      .from("role_permissions")
      .delete()
      .eq("role_id", roleId);

    if (deleteError) throw deleteError;

    // 3️⃣ Insert new permissions
    if (permissions.length > 0) {
      const mappings = permissions.map((permission_id: number) => ({
        role_id: roleId,
        permission_id,
      }));

      const { error: insertError } = await supabase
        .from("role_permissions")
        .insert(mappings);

      if (insertError) throw insertError;
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to update role" },
      { status: err.status || 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await authoriseAdmin(req, ["manage_admins"]);

    const supabase = createAdminSupabaseClient();
    const roleId = Number((await params).id);

    if (!roleId) {
      return NextResponse.json(
        { error: "Invalid role id" },
        { status: 400 }
      );
    }

    // 🚫 Prevent deleting SuperAdmin
    if (roleId === 1) {
      return NextResponse.json(
        { error: "Cannot delete system role" },
        { status: 403 }
      );
    }

    // 🚫 Check if role is assigned to any admin
    const { count } = await supabase
      .from("admin_users")
      .select("id", { count: "exact", head: true })
      .eq("role_id", roleId);

    if (count && count > 0) {
      return NextResponse.json(
        { error: "Role is assigned to users" },
        { status: 409 }
      );
    }

    // 1️⃣ Delete role_permissions first
    await supabase
      .from("role_permissions")
      .delete()
      .eq("role_id", roleId);

    // 2️⃣ Delete role
    const { error } = await supabase
      .from("admin_roles")
      .delete()
      .eq("id", roleId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to delete role" },
      { status: err.status || 500 }
    );
  }
}
