import { ProductCSVRow, VariantCSVRow, BulkValidationError, BulkPreviewProduct } from "@/types/bulkUpload";
import { createAdminSupabaseClient } from "@/utils/supabase/adminClient";

export async function validateBulkProducts(
  products: ProductCSVRow[],
  variants: VariantCSVRow[]
): Promise<{ preview: BulkPreviewProduct[]; errors: BulkValidationError[] }> {

  const supabase = createAdminSupabaseClient();
  const errors: BulkValidationError[] = [];

  // -----------------------------
  // 1. Validate product keys
  // -----------------------------
  const productKeySet = new Set<string>();

  products.forEach((p, i) => {
    if (!p.product_key) {
      errors.push({
        file: "products.csv",
        row: i + 2,
        message: "product_key is required",
      });
    } else if (productKeySet.has(p.product_key)) {
      errors.push({
        file: "products.csv",
        row: i + 2,
        message: `Duplicate product_key '${p.product_key}'`,
      });
    }
    productKeySet.add(p.product_key);
  });

  // -----------------------------
  // 2. Load Brands & Categories
  // -----------------------------
  const [{ data: brands }, { data: categories }] = await Promise.all([
    supabase.from("Brands").select("id, name"),
    supabase.from("ProductCategories").select("id, name"),
  ]);

  const brandMap = new Map(brands?.map((b) => [b.name.toLowerCase(), b.id]));
  const categoryMap = new Map(categories?.map((c) => [c.name.toLowerCase(), c.id]));

  // -----------------------------
  // 3. Validate products.csv
  // -----------------------------
  products.forEach((p, i) => {
    if (!p.name) {
      errors.push({
        file: "products.csv",
        row: i + 2,
        message: "Product name is required",
      });
    }

    if (!brandMap.has(p.brand?.toLowerCase())) {
      errors.push({
        file: "products.csv",
        row: i + 2,
        message: `Brand '${p.brand}' does not exist`,
      });
    }

    if (!categoryMap.has(p.category?.toLowerCase())) {
      errors.push({
        file: "products.csv",
        row: i + 2,
        message: `Category '${p.category}' does not exist`,
      });
    }
  });

  // -----------------------------
  // 4. Group variants by product_key
  // -----------------------------
  const variantMap = new Map<string, VariantCSVRow[]>();

  variants.forEach((v, i) => {
    if (!productKeySet.has(v.product_key)) {
      errors.push({
        file: "variants.csv",
        row: i + 2,
        message: `Unknown product_key '${v.product_key}'`,
      });
      return;
    }

    const price = Number(v.price);
    const quantity = Number(v.quantity);

    if (isNaN(price) || price < 0) {
      errors.push({
        file: "variants.csv",
        row: i + 2,
        message: "Invalid price",
      });
    }

    if (isNaN(quantity) || quantity < 0) {
      errors.push({
        file: "variants.csv",
        row: i + 2,
        message: "Invalid quantity",
      });
    }

    if (!variantMap.has(v.product_key)) {
      variantMap.set(v.product_key, []);
    }

    variantMap.get(v.product_key)!.push(v);
  });

  // -----------------------------
  // 5. Ensure at least 1 variant per product
  // -----------------------------
  products.forEach((p, i) => {
    if (!variantMap.has(p.product_key)) {
      errors.push({
        file: "variants.csv",
        row: i + 2,
        message: `No variants provided for product_key '${p.product_key}'`,
      });
    }
  });

  // ❌ Abort if errors
  if (errors.length > 0) {
    return { preview: [], errors };
  }

  // -----------------------------
  // 6. Build Preview Payload
  // -----------------------------
  const preview: BulkPreviewProduct[] = products.map((p) => ({
    product_key: p.product_key,
    name: p.name,
    description: p.description,
    brand: p.brand,
    category: p.category,
    brand_id: brandMap.get(p.brand.toLowerCase())!,
    category_id: categoryMap.get(p.category.toLowerCase())!,
    variants: variantMap.get(p.product_key)!.map((v) => ({
      name: v.variant_name,
      price: Number(v.price),
      quantity: Number(v.quantity),
    })),
  }));

  return { preview, errors: [] };
}
