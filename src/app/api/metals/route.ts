import { NextResponse } from "next/server";
import { authoriseAdmin } from "../utils/authorise";
import { createAdminSupabaseClient } from "@/utils/supabase/adminClient";

export async function GET(req: Request) {
  try {
    await authoriseAdmin(req, ["manage_live_prices"]);

    const supabase = createAdminSupabaseClient();

    const { data, error } = await supabase
      .from("metals_live_prices")
      .select(`
        id,
        name,
        live_price,
        lot_size,
        minimum_quantity,
        is_visible,
        last_updated_at
      `)
      .order("name");

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ metals: data });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Unauthorized" },
      { status: 401 }
    );
  }
}

export async function POST(req: Request) {
  try {
    await authoriseAdmin(req, ["manage_live_prices"]);

    const { name, lot_size, minimum_quantity } = await req.json();

    if (!name || !lot_size || !minimum_quantity) {
      return NextResponse.json(
        { error: "Name, lot size and minimum quantity are required" },
        { status: 400 }
      );
    }

    const supabase = createAdminSupabaseClient();

    const { error } = await supabase
      .from("metals_live_prices")
      .insert({
        name,
        lot_size,
        minimum_quantity,
        is_visible: false,
        live_price: null,
      });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Unauthorized" },
      { status: 401 }
    );
  }
}
