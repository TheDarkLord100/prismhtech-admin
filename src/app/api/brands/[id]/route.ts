import { NextResponse } from "next/server";
import { authoriseAdmin } from "../../utils/authorise";
import { createAdminSupabaseClient } from "@/utils/supabase/adminClient";

export async function PUT(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        await authoriseAdmin(req, ["manage_brands"]);

        const supabaseServer = createAdminSupabaseClient();

        const { name, logo_url } = await req.json();

        const { error } = await supabaseServer
            .from("Brands")
            .update({ name, logo_url })
            .eq("id", params.id);

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
    { params }: { params: { id: string } }
) {
    try {
        await authoriseAdmin(req, ["manage_brands"]);
        const supabaseServer = createAdminSupabaseClient();

        const { error } = await supabaseServer
            .from("Brands")
            .delete()
            .eq("id", params.id);
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