import { NextResponse } from "next/server";
import { authoriseAdmin } from "../../../utils/authorise";
import { createAdminSupabaseClient } from "@/utils/supabase/adminClient";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await authoriseAdmin(req, ["manage_live_prices"]);

    const { searchParams } = new URL(req.url);
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    const supabase = createAdminSupabaseClient();

    let query = supabase
      .from("metal_price_history")
      .select("price_date, price")
      .eq("metal_id", id)
      .order("price_date", { ascending: true });

    if (from) query = query.gte("price_date", from);
    if (to) query = query.lte("price_date", to);

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Unauthorized" },
      { status: 401 }
    );
  }
}
