import { NextResponse } from "next/server";
import { authoriseAdmin } from "@/app/api/utils/authorise";
import { createAdminSupabaseClient } from "@/utils/supabase/adminClient";

export async function GET(req: Request) {
  try {
    // 🔐 Authorise admin (same pattern as orders)
    await authoriseAdmin(req, ["manage_payments"]);

    const supabase = createAdminSupabaseClient();

    const { data, error } = await supabase
      .from("payments")
      .select(`
        id,
        created_at,
        payment_id,
        order_id,
        amount,
        method,
        status,
        transaction_id
      `)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      payments: data,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Unauthorized" },
      { status: err.status || 401 }
    );
  }
}
