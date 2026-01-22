import { NextResponse } from "next/server";
import { authoriseAdmin } from "../../utils/authorise";
import { createAdminSupabaseClient } from "@/utils/supabase/adminClient";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await authoriseAdmin(req, ["manage_live_prices"]);

    const supabase = createAdminSupabaseClient();

    const { data, error } = await supabase
      .from("metals_live_prices")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json({ metal: data });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Unauthorized" },
      { status: 401 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await authoriseAdmin(req, ["manage_live_prices"]);

    const { name, lot_size, minimum_quantity } = await req.json();

    const supabase = createAdminSupabaseClient();

    const { error } = await supabase
      .from("metals_live_prices")
      .update({
        name,
        lot_size,
        minimum_quantity,
      })
      .eq("id", id);

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
