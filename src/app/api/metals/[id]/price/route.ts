import { NextResponse } from "next/server";
import { authoriseAdmin } from "../../../utils/authorise";
import { createAdminSupabaseClient } from "@/utils/supabase/adminClient";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await authoriseAdmin(req, ["manage_live_prices"]);

    const { price, make_visible } = await req.json();

    if (!price || price <= 0) {
      return NextResponse.json(
        { error: "Valid price is required" },
        { status: 400 }
      );
    }

    const supabase = createAdminSupabaseClient();

    // 1. Update live price
    const { error: liveError } = await supabase
      .from("metals_live_prices")
      .update({
        live_price: price,
        is_visible: !!make_visible,
        last_updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (liveError) {
      return NextResponse.json({ error: liveError.message }, { status: 500 });
    }

    // 2. Upsert history for today
    const today = new Date().toISOString().slice(0, 10);

    const { error: historyError } = await supabase
      .from("metal_price_history")
      .upsert(
        {
          metal_id: id,
          price,
          price_date: today,
        },
        {
          onConflict: "metal_id,price_date",
        }
      );

    if (historyError) {
      return NextResponse.json(
        { error: historyError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Unauthorized" },
      { status: 401 }
    );
  }
}
