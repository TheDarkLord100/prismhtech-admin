import { NextResponse } from "next/server";
import { authoriseAdmin } from "../../../utils/authorise";
import { parseCSV } from "../../../utils/parseCSV";
import { validateBulkProducts } from "../../../utils/bulkValidateProducts";

export async function POST(req: Request) {
  try {
    await authoriseAdmin(req, ["manage_products", "manage_inventory"]);

    const formData = await req.formData();
    const productsFile = formData.get("productsFile") as File;
    const variantsFile = formData.get("variantsFile") as File;

    if (!productsFile || !variantsFile) {
      return NextResponse.json(
        { error: "Both products and variants CSV files are required" },
        { status: 400 }
      );
    }

    const products = parseCSV(
      Buffer.from(await productsFile.arrayBuffer())
    ) as any[];
    const variants = parseCSV(
      Buffer.from(await variantsFile.arrayBuffer())
    ) as any[];

    const { preview, errors } = await validateBulkProducts(products, variants);

    if (errors.length > 0) {
      return NextResponse.json({ valid: false, errors });
    }

    return NextResponse.json({
      valid: true,
      preview,
      summary: {
        products: preview.length,
        variants: preview.reduce((acc, p) => acc + p.variants.length, 0),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Bulk validation failed" },
      { status: 500 }
    );
  }
}
