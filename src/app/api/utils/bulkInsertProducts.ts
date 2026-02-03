import { createAdminSupabaseClient } from "@/utils/supabase/adminClient";
import { BulkPreviewProduct } from "@/types/bulkUpload";

export async function bulkInsertProducts(preview: BulkPreviewProduct[]) {
  const supabase = createAdminSupabaseClient();

  // -----------------------------
  // 1. Insert products
  // -----------------------------
  const productsToInsert = preview.map((p) => ({
    name: p.name,
    description: p.description,
    brand_id: p.brand_id,
    product_category_id: p.category_id,
  }));

  const { data: insertedProducts, error: productError } = await supabase
    .from("products")
    .insert(productsToInsert)
    .select("id, name");

  if (productError) {
    throw new Error(`Product insert failed: ${productError.message}`);
  }

  // -----------------------------
  // 2. Map product_key → product_id
  // -----------------------------
  const productIdMap = new Map<string, string>();

  preview.forEach((p, idx) => {
    productIdMap.set(p.product_key, insertedProducts[idx].id);
  });

  // -----------------------------
  // 3. Insert variants
  // -----------------------------
  const variantsToInsert = preview.flatMap((p) =>
    p.variants.map((v) => ({
      product_id: productIdMap.get(p.product_key),
      name: v.name,
      price: v.price,
    }))
  );

  const { error: variantError } = await supabase
    .from("ProductVariants")
    .insert(variantsToInsert);

  if (variantError) {
    throw new Error(`Variant insert failed: ${variantError.message}`);
  }

  // -----------------------------
  // 4. Compute & update inventory
  // -----------------------------
  for (const p of preview) {
    const totalQuantity = p.variants.reduce(
      (sum, v) => sum,
      0
    );

    await supabase
      .from("products")
      .update({ total_quantity: totalQuantity })
      .eq("id", productIdMap.get(p.product_key));
  }

  return {
    products_created: preview.length,
    variants_created: variantsToInsert.length,
  };
}
