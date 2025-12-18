import { NextResponse } from "next/server";
import { authoriseAdmin } from "../../utils/authorise";
import { bulkInsertProducts } from "../../utils/bulkInsertProducts";
import { BulkConfirmPayload } from "@/types/bulkUpload";

export async function POST(req: Request) {
  try {
    await authoriseAdmin(req, ["manage_products", "manage_inventory"]);

    const { preview }: BulkConfirmPayload = await req.json();

    if (!preview || !Array.isArray(preview) || preview.length === 0) {
      return NextResponse.json(
        { error: "Invalid or empty bulk upload payload" },
        { status: 400 }
      );
    }

    const result = await bulkInsertProducts(preview);

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Bulk upload failed" },
      { status: 500 }
    );
  }
}
