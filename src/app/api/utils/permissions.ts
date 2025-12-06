import { createAdminSupabaseClient } from "@/utils/supabase/adminClient";

export async function getPermissionsForRole(role_id: number, token: string): Promise<Set<string>> {
    const supabase = createAdminSupabaseClient();

    const { data, error } = await supabase
        .from("role_permissions")
        .select(`
        id,
        permission_id,
        permissions:permissions(name)
    `)
        .eq("role_id", role_id);
    return new Set(data?.map((p: any) => p.permissions.name));
}
