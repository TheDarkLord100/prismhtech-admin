export interface ProductCSVRow {
  product_key: string;
  name: string;
  description?: string;
  brand: string;
  category: string;
}

export interface VariantCSVRow {
  product_key: string;
  variant_name: string;
  price: string;
  quantity: string;
}

export interface BulkValidationError {
  file: "products.csv" | "variants.csv";
  row: number;
  message: string;
}

export interface BulkPreviewProduct {
  product_key: string;
  name: string;
  description?: string;
  brand: string;
  category: string;
  brand_id: string;
  category_id: string;
  variants: {
    name: string;
    price: number;
    quantity: number;
  }[];
}

export interface BulkConfirmPayload {
  preview: BulkPreviewProduct[];
}
