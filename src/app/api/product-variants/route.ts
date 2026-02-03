import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/utils/supabase/adminClient";
import { authoriseAdmin } from "../utils/authorise";

export async function POST(req: Request) {
  try {
    await authoriseAdmin(req, ["manage_products", "manage_inventory"]);

    const { product_id, name, price } = await req.json();

    const supabase = createAdminSupabaseClient();

    const { error } = await supabase
      .from("ProductVariants")
      .insert({
        product_id,
        name,
        price,
      });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}
