import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/utils/supabase/adminClient";
import { authoriseAdmin } from "../../utils/authorise";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await authoriseAdmin(req, ["manage_inventory", "manage_products"]);

    const { name, description, image_url } = await req.json();
    const { id } = await params;
    const supabase = createAdminSupabaseClient();

    const { error } = await supabase
      .from("ProductCategories")
      .update({
        name,
        description,
        image_url,
      })
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
    await authoriseAdmin(req, ["manage_inventory", "manage_products"]);

    const supabase = createAdminSupabaseClient();
    const { id } = await params;
    const { error } = await supabase
      .from("ProductCategories")
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