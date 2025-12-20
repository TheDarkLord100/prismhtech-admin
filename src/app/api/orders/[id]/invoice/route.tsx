// app/api/orders/[id]/invoice/route.tsx
export const runtime = "nodejs";

import React from "react";
import { NextResponse } from "next/server";
import { COMPANY } from "@/utils/company";
import { authoriseAdmin } from "../../../utils/authorise";
import { createAdminSupabaseClient } from "@/utils/supabase/adminClient";
import { pdf } from "@react-pdf/renderer";
import { InvoicePdf } from "@/utils/invoicePdf";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // await authoriseAdmin(req, ["manage_orders"]);
    const { id } = await params;
    const supabase = createAdminSupabaseClient();

    const { data: order } = await supabase
      .from("Orders")
      .select(`
        *,
        billing_address:Addresses!Orders_billing_address_id_fkey(*),
        shipping_address:Addresses!Orders_shipping_address_id_fkey(*),
        items:OrderItems(
          *,
          products(name),
          ProductVariants(name)
        )
      `)
      .eq("id", id)
      .single();

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const invoiceOrder = {
      ...order,
      invoice_no: `${COMPANY.invoice.prefix}-${order.id.slice(0, 8)}`,
      seller: COMPANY,
      items: order.items.map((i: any) => ({
        product_name: i.products?.name,
        variant_name: i.ProductVariants?.name,
        quantity: i.quantity,
        price: i.price,
      })),
    };

    const pdfBuffer = await pdf(
      <InvoicePdf order={invoiceOrder} />
    ).toBuffer();

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename=invoice-${id}.pdf`,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to generate invoice" },
      { status: 500 }
    );
  }
}
