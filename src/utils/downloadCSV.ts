export function downloadCSV(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export const PRODUCTS_TEMPLATE = `product_key,name,description,brand,category
P001,Sample Product,Sample description,Brand Name,Category Name
`;

export const VARIANTS_TEMPLATE = `product_key,variant_name,price,quantity
P001,Default Variant,100,10
`;
