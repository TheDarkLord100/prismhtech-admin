import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/utils/supabase/adminClient";
import { authoriseAdmin } from "../utils/authorise";

export async function POST(req: Request) {
  try {
    await authoriseAdmin(req, ["manage_products", "manage_inventory"]);

    const { product_id, image_url } = await req.json();

    const supabase = createAdminSupabaseClient();

    const { data: last } = await supabase
      .from("productImages")
      .select("priority")
      .eq("product_id", product_id)
      .order("priority", { ascending: false })
      .limit(1)
      .single();

    const priority = (last?.priority ?? 0) + 1;

    const { error } = await supabase
      .from("productImages")
      .insert({ product_id, image_url, priority });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    await authoriseAdmin(req, ["manage_products", "manage_inventory"]);

    const { image_id, new_priority } = await req.json();
    const supabase = createAdminSupabaseClient();

    const { error } = await supabase
      .from("productImages")
      .update({ priority: new_priority })
      .eq("id", image_id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}
