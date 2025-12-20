import { NextResponse } from "next/server";
import { authoriseAdmin } from "@/app/api/utils/authorise";
import { createAdminSupabaseClient } from "@/utils/supabase/adminClient";

export async function GET(req: Request) {
  try {
    await authoriseAdmin(req, ["manage_admins"]);

    const supabase = createAdminSupabaseClient();

    // 1. Fetch all permissions (read-only list)
    const { data: permissions, error: permError } = await supabase
      .from("permissions")
      .select("id, name, description")
      .order("id");

    if (permError) {
      throw permError;
    }

    // 2. Fetch roles with permissions
    const { data: roles, error: rolesError } = await supabase
      .from("admin_roles")
      .select(`
        id,
        name,
        description,
        role_permissions (
          permissions (
            id,
            name,
            description
          )
        )
      `)
      .order("id");

    if (rolesError) {
      throw rolesError;
    }

    // 3. Normalize shape for frontend
    const formattedRoles = roles.map((r: any) => ({
      id: r.id,
      name: r.name,
      description: r.description,
      permissions: r.role_permissions
        .map((rp: any) => rp.permissions)
        .filter(Boolean),
    }));

    return NextResponse.json({
      roles: formattedRoles,
      permissions,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to fetch roles" },
      { status: err.status || 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    await authoriseAdmin(req, ["manage_admins"]);

    const supabase = createAdminSupabaseClient();
    const body = await req.json();

    const { name, description, permissions } = body;

    if (!name || !Array.isArray(permissions)) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    // 1️⃣ Get current max role ID
    const { data: maxRow, error: maxError } = await supabase
      .from("admin_roles")
      .select("id")
      .order("id", { ascending: false })
      .limit(1)
      .single();

    if (maxError && maxError.code !== "PGRST116") {
      throw maxError;
    }

    const nextId = (maxRow?.id ?? 0) + 1;

    // 2️⃣ Insert role with explicit ID
    const { data: role, error: roleError } = await supabase
      .from("admin_roles")
      .insert({
        id: nextId,
        name,
        description,
      })
      .select()
      .single();

    if (roleError) {
      throw roleError;
    }

    // 3️⃣ Insert permission mappings
    if (permissions.length > 0) {
      const mappings = permissions.map((permission_id: number) => ({
        role_id: role.id,
        permission_id,
      }));

      const { error: mapError } = await supabase
        .from("role_permissions")
        .insert(mappings);

      if (mapError) {
        throw mapError;
      }
    }

    // 4️⃣ Fetch permissions for response
    const { data: rolePerms } = await supabase
      .from("role_permissions")
      .select(`
        permissions (
          id,
          name,
          description
        )
      `)
      .eq("role_id", role.id);

    return NextResponse.json({
      role: {
        id: role.id,
        name: role.name,
        description: role.description,
        permissions: rolePerms?.map((r: any) => r.permissions) ?? [],
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to create role" },
      { status: err.status || 500 }
    );
  }
}
