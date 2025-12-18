import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/utils/supabase/adminClient";
import { authoriseAdmin } from "../../utils/authorise";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await authoriseAdmin(req, ["manage_products", "manage_inventory"]);

    const supabase = createAdminSupabaseClient();
    const { id } = await params;
    const { error } = await supabase
      .from("productImages")
      .delete()
      .eq("id", id);
      
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}
