import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/utils/supabase/adminClient";
import { authoriseAdmin } from "../../utils/authorise";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await authoriseAdmin(req, ["manage_inventory", "manage_products"]);

    const supabase = createAdminSupabaseClient();
    const { id } = await params;
    const { data, error } = await supabase
      .from("products")
      .select(`
        id,
        name,
        description,
        total_quantity,
        brand_id,
        product_category_id,
        Brands (
          id,
          name
        ),
        ProductCategories (
          id,
          name
        ),
        productImages (
          id,
          image_url,
          alt_text,
          priority
        ),
        ProductVariants (
          pvr_id,
          name,
          price,
          quantity
        )
      `)
      .eq("id", id)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ product: data });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Unauthorized" },
      { status: 401 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await authoriseAdmin(req, ["manage_products", "manage_inventory"]);

    const { name, description, brand_id, product_category_id } =
      await req.json();

    const supabase = createAdminSupabaseClient();
    const { id } = await params;
    const { error } = await supabase
      .from("products")
      .update({
        name,
        description,
        brand_id,
        product_category_id,
      })
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


export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await authoriseAdmin(req, ["manage_products"]);
    const { id } = await params;
    const productId = id;
    const supabase = createAdminSupabaseClient();

    // 1️⃣ Delete images
    const { error: imageError } = await supabase
      .from("productImages")
      .delete()
      .eq("product_id", productId);

    if (imageError) {
      return NextResponse.json(
        { error: "Failed to delete product images" },
        { status: 500 }
      );
    }

    // 2️⃣ Delete variants
    const { error: variantError } = await supabase
      .from("ProductVariants")
      .delete()
      .eq("product_id", productId);

    if (variantError) {
      return NextResponse.json(
        { error: "Failed to delete product variants" },
        { status: 500 }
      );
    }

    // 3️⃣ Delete product
    const { error: productError } = await supabase
      .from("products")
      .delete()
      .eq("id", productId);

    if (productError) {
      return NextResponse.json(
        { error: "Failed to delete product" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to delete product" },
      { status: 500 }
    );
  }
}
