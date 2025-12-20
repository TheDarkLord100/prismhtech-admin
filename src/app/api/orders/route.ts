import { NextResponse } from "next/server";
import { authoriseAdmin } from "../utils/authorise";
import { createAdminSupabaseClient } from "@/utils/supabase/adminClient";

export async function GET(req: Request) {
  try {
    await authoriseAdmin(req, ["manage_orders"]);

    const supabase = createAdminSupabaseClient();

    const { data, error } = await supabase
      .from("Orders")
      .select(`
        id,
        created_at,
        total_amount,
        status,
        OrderItems (
          id
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const orders = data.map((o: any) => ({
      id: o.id,
      created_at: o.created_at,
      total_amount: o.total_amount,
      status: o.status,
      items_count: o.OrderItems?.length || 0,
    }));

    return NextResponse.json({ orders });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
