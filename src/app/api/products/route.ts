import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/utils/supabase/adminClient";
import { authoriseAdmin } from "../utils/authorise";

export async function GET(req: Request) {
  try {
    await authoriseAdmin(req, [
      "manage_inventory",
      "manage_products",
    ]);

    const supabase = createAdminSupabaseClient();

    const { data, error } = await supabase
      .from("products")
      .select(`
        id,
        name,
        Brands (
          name
        ),
        ProductCategories (
          name
        ),
        ProductVariants (
          pvr_id
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    // compute variant count
    const products = data.map((p: any) => ({
      id: p.id,
      name: p.name,
      brand: p.Brands?.name ?? "-",
      category: p.ProductCategories?.name ?? "-",
      variant_count: p.ProductVariants?.length ?? 0,
    }));

    return NextResponse.json({ products });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Unauthorized" },
      { status: 401 }
    );
  }
}

export async function POST(req: Request) {
  try {
    await authoriseAdmin(req, ["manage_products"]);

    const { name, description, brand_id, product_category_id } = await req.json();

    if (!name || !brand_id || !product_category_id) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const supabase = createAdminSupabaseClient();

    const { data, error } = await supabase
      .from("products")
      .insert({
        name,
        description,
        brand_id,
        product_category_id,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ product: data });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to create product" },
      { status: 500 }
    );
  }
}
