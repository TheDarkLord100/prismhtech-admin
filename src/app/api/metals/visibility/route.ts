import { NextResponse } from "next/server";
import { authoriseAdmin } from "../../utils/authorise";
import { createAdminSupabaseClient } from "@/utils/supabase/adminClient";

export async function POST(req: Request) {
  try {
    await authoriseAdmin(req, ["manage_live_prices"]);

    const { metal_ids, is_visible } = await req.json();

    if (!Array.isArray(metal_ids) || metal_ids.length === 0) {
      return NextResponse.json(
        { error: "metal_ids array is required" },
        { status: 400 }
      );
    }

    const supabase = createAdminSupabaseClient();

    if (is_visible) {
      // Ensure prices are updated today
      const today = new Date().toISOString().slice(0, 10);

      const { data } = await supabase
        .from("metals_live_prices")
        .select("id")
        .in("id", metal_ids)
        .gte("last_updated_at", `${today}T00:00:00`);

      if (!data || data.length !== metal_ids.length) {
        return NextResponse.json(
          { error: "Some metals do not have updated prices for today" },
          { status: 400 }
        );
      }
    }

    const { error } = await supabase
      .from("metals_live_prices")
      .update({ is_visible })
      .in("id", metal_ids);

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
