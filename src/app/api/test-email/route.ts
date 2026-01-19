import { NextResponse } from "next/server";
import { sendOrderStatusEmail } from "@/utils/email/sendEmail";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const orderId = formData.get("order_id") as string;
    const status = formData.get("status") as string;
    const note = formData.get("note") as string | null;
    const pdfFile = formData.get("invoice_pdf") as File | null;

    if (!orderId || !status) {
      return NextResponse.json(
        { error: "order_id and status are required" },
        { status: 400 }
      );
    }

    let attachment:
      | {
          filename: string;
          content: string;
        }
      | undefined;

    if (pdfFile) {
      if (pdfFile.size > 5 * 1024 * 1024) {
        return NextResponse.json(
          { error: "PDF too large (max 5MB)" },
          { status: 400 }
        );
      }

      const buffer = Buffer.from(await pdfFile.arrayBuffer());

      attachment = {
        filename: pdfFile.name || "attachment.pdf",
        content: buffer.toString("base64"),
      };
    }

    await sendOrderStatusEmail({
      orderId,
      status,
      note,
      attachment,
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to send test email" },
      { status: 500 }
    );
  }
}
