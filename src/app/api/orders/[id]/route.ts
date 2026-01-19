import { NextResponse } from "next/server";
import { authoriseAdmin } from "../../utils/authorise";
import { createAdminSupabaseClient } from "@/utils/supabase/adminClient";
import { sendOrderStatusEmail } from "@/utils/email/sendEmail";

const VALID_STATUSES = [
  "Order placed",
  "Order accepted",
  "Shipped",
  "Delivered",
  "Cancelled",
];

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await authoriseAdmin(req, ["manage_orders"]);
    const formData = await req.formData();

    const new_status = formData.get("new_status") as string;
    const description = formData.get("description") as string | null;
    const notifyCustomer = formData.get("notify_customer") === "true";
    const pdfFile = formData.get("invoice_pdf") as File | null;

    if (!VALID_STATUSES.includes(new_status)) {
      return NextResponse.json(
        { error: "Invalid order status" },
        { status: 400 }
      );
    }

    const supabase = createAdminSupabaseClient();
    const { id: orderId } = await params;

    /* ---------------- ORDER ---------------- */
    const { data: order } = await supabase
      .from("Orders")
      .select("status")
      .eq("id", orderId)
      .single();

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const oldStatus = order.status;

    /* ---------------- INVENTORY LOGIC ---------------- */
    if (oldStatus === "Order placed" && new_status === "Order accepted") {
      const { data: items } = await supabase
        .from("OrderItems")
        .select("variant_id, quantity")
        .eq("ordr_id", orderId);

      for (const item of items ?? []) {
        const { error } = await supabase.rpc("decrement_quantity", {
          pvr_id: item.variant_id,
          qty: item.quantity,
        });

        if (error) {
          return NextResponse.json(
            { error: "Insufficient inventory" },
            { status: 400 }
          );
        }
      }
    }

    /* ---------------- STATUS HISTORY ---------------- */
    await supabase.from("OrderStatusHistory").insert({
      order_id: orderId,
      old_status: oldStatus,
      new_status,
      changed_by: admin.id,
      note: description || null,
    });

    /* ---------------- UPDATE ORDER ---------------- */
    await supabase
      .from("Orders")
      .update({
        status: new_status,
        status_description: description || null,
      })
      .eq("id", orderId);

    /* ---------------- EMAIL ---------------- */
    if (notifyCustomer) {
      let attachment;

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
        status: new_status,
        note: description,
        attachment,
      });
    }

    /* ---------------- FETCH UPDATED ORDER ---------------- */
    const { data: updatedOrder } = await supabase
      .from("Orders")
      .select(`
    id,
    status,
    status_description
  `)
      .eq("id", orderId)
      .single();

    /* ---------------- FETCH UPDATED HISTORY ---------------- */
    const { data: updatedHistory } = await supabase
      .from("OrderStatusHistory")
      .select("*")
      .eq("order_id", orderId)
      .order("changed_at", { ascending: true });

    return NextResponse.json({
      success: true,
      order: updatedOrder,
      history: updatedHistory || [],
    });

  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to update order status" },
      { status: 500 }
    );
  }
}


export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await authoriseAdmin(req, ["manage_orders"]);
    const { id } = await params;
    const supabase = createAdminSupabaseClient();
    const orderId = id;

    /* ---------------- ORDER CORE ---------------- */
    const { data: order, error: orderError } = await supabase
      .from("Orders")
      .select(`
        id,
        created_at,
        user_id,
        subtotal_amount,
        gst_rate,
        gst_type,
        cgst_amount,
        sgst_amount,
        igst_amount,
        total_amount,
        payment_type,
        status,
        status_description,
        shipping_address_id,
        billing_address_id
      `)
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    /* ---------------- USER ---------------- */
    console.log("Fetching user for order:", order.user_id);
    const { data: user, error: userError } = await supabase
      .from("users")
      .select(`
        id,
        name,
        email,
        phone,
        gstin
      `)
      .eq("id", order.user_id)
      .single();

    console.log("Fetched user:", user);
    console.log("User fetch error:", userError);

    /* ---------------- ADDRESSES ---------------- */
    const { data: addresses } = await supabase
      .from("Addresses")
      .select("*")
      .in("adr_id", [
        order.shipping_address_id,
        order.billing_address_id,
      ]);

    const shipping_address = addresses?.find(
      (a) => a.adr_id === order.shipping_address_id
    );
    const billing_address = addresses?.find(
      (a) => a.adr_id === order.billing_address_id
    );

    /* ---------------- ITEMS ---------------- */
    const { data: items, error: itemsError } = await supabase
      .from("OrderItems")
      .select(`
        id,
        quantity,
        price,
        product:products (
          id,
          name
        ),
        variant:ProductVariants (
          pvr_id,
          name,
          price
        )
      `)
      .eq("ordr_id", orderId);

    if (itemsError) {
      return NextResponse.json(
        { error: itemsError.message },
        { status: 500 }
      );
    }

    /* ---------------- STATUS HISTORY ---------------- */
    const { data: history } = await supabase
      .from("OrderStatusHistory")
      .select("*")
      .eq("order_id", orderId)
      .order("changed_at", { ascending: true });

    /* ---------------- RESPONSE ---------------- */
    return NextResponse.json({
      order: {
        ...order,
        user,
        shipping_address,
        billing_address,
        items: items || [],
        history: history || [],
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Internal error" },
      { status: 500 }
    );
  }
}
