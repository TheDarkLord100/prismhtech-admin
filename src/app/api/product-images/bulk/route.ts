import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/utils/supabase/adminClient";
import { authoriseAdmin } from "../../utils/authorise";

export async function POST(req: Request) {
  try {
    await authoriseAdmin(req, ["manage_products", "manage_inventory"]);

    const { product_ids, image_urls } = await req.json();

    if (!Array.isArray(product_ids) || !Array.isArray(image_urls)) {
      return NextResponse.json(
        { error: "Invalid payload" },
        { status: 400 }
      );
    }

    if (product_ids.length === 0 || image_urls.length === 0) {
      return NextResponse.json(
        { error: "No products or images provided" },
        { status: 400 }
      );
    }

    const supabase = createAdminSupabaseClient();

    // --------------------------------
    // Fetch current max priority per product
    // --------------------------------
    const { data: existing } = await supabase
      .from("productImages")
      .select("product_id, priority")
      .in("product_id", product_ids)
      .order("priority", { ascending: false });

    const maxPriorityMap = new Map<string, number>();

    existing?.forEach((row) => {
      if (!maxPriorityMap.has(row.product_id)) {
        maxPriorityMap.set(row.product_id, row.priority ?? 0);
      }
    });

    // --------------------------------
    // Build bulk insert payload
    // --------------------------------
    const inserts = [];

    for (const productId of product_ids) {
      let priority = maxPriorityMap.get(productId) ?? 0;

      for (const url of image_urls) {
        priority += 1;
        inserts.push({
          product_id: productId,
          image_url: url,
          priority,
        });
      }
    }

    // --------------------------------
    // Bulk insert
    // --------------------------------
    const { error } = await supabase
      .from("productImages")
      .insert(inserts);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      inserted: inserts.length,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}
