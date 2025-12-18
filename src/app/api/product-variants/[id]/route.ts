import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/utils/supabase/adminClient";
import { authoriseAdmin } from "../../utils/authorise";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await authoriseAdmin(req, ["manage_products", "manage_inventory"]);

    const { name, price, quantity } = await req.json();
    const supabase = createAdminSupabaseClient();
    const { id } = await params;
    const { error } = await supabase
      .from("ProductVariants")
      .update({ name, price, quantity })
      .eq("pvr_id", id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await authoriseAdmin(req, ["manage_products", "manage_inventory"]);

    const supabase = createAdminSupabaseClient();
    const { id } = await params;
    const { error } = await supabase
      .from("ProductVariants")
      .delete()
      .eq("pvr_id", id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}