import { NextResponse } from "next/server";
import { authoriseAdmin } from "../../utils/authorise";
import { createAdminSupabaseClient } from "@/utils/supabase/adminClient";

const VALID_STATUSES = [
  "Order placed",
  "Order accepted",
  "Packed",
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
    const { new_status, description } = await req.json();

    if (!VALID_STATUSES.includes(new_status)) {
      return NextResponse.json(
        { error: "Invalid order status" },
        { status: 400 }
      );
    }

    const supabase = createAdminSupabaseClient();
    const { id: orderId } = await params;

    // 1️⃣ Fetch order + current status
    const { data: order } = await supabase
      .from("Orders")
      .select("status")
      .eq("id", orderId)
      .single();

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const oldStatus = order.status;

    // 2️⃣ Inventory deduction ONLY ON placed → accepted
    if (
      oldStatus === "Order placed" &&
      new_status === "Order accepted"
    ) {
      // Fetch order items
      const { data: items, error: itemsError } = await supabase
        .from("OrderItems")
        .select("variant_id, quantity")
        .eq("ordr_id", orderId);

      if (itemsError) {
        return NextResponse.json(
          { error: "Failed to fetch order items" },
          { status: 500 }
        );
      }

      // Deduct inventory per variant
      for (const item of items) {
        const { error: stockError } = await supabase
          .from("ProductVariants")
          .update({
            quantity: supabase.rpc("decrement_quantity", {
              pvr_id: item.variant_id,
              qty: item.quantity,
            }),
          });

        if (stockError) {
          return NextResponse.json(
            { error: "Insufficient inventory for one or more items" },
            { status: 400 }
          );
        }
      }
    }

    // 3️⃣ Insert status history
    const { error: historyError } = await supabase
      .from("OrderStatusHistory")
      .insert({
        order_id: orderId,
        old_status: oldStatus,
        new_status,
        changed_by: admin.id,
        note: description || null,
      });

    if (historyError) {
      return NextResponse.json(
        { error: historyError.message },
        { status: 500 }
      );
    }

    // 4️⃣ Update order
    const { error: updateError } = await supabase
      .from("Orders")
      .update({
        status: new_status,
        status_description: description || null,
      })
      .eq("id", orderId);

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
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
        total_amount,
        payment_type,
        status,
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
        products:products (
          name
        ),
        variants:ProductVariants (
          name
        )
      `)
      .eq("ordr_id", orderId);

    if (itemsError) {
      return NextResponse.json(
        { error: itemsError.message },
        { status: 500 }
      );
    }

    console.log(items);

    const formattedItems =
      items?.map((i) => ({
        id: i.id,
        product_name: i.products?.[0]?.name || "—",
        variant_name: i.variants?.[0]?.name || "—",
        quantity: i.quantity,
        price: i.price,
      })) || [];
      
    /* ---------------- STATUS HISTORY ---------------- */
    const { data: history } = await supabase
      .from("OrderStatusHistory")
      .select("*")
      .eq("order_id", orderId)
      .order("changed_at", { ascending: true });
      console.log(history);
    /* ---------------- RESPONSE ---------------- */
    return NextResponse.json({
      order: {
        ...order,
        shipping_address,
        billing_address,
        items: formattedItems,
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
