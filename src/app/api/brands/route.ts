import { NextResponse } from "next/server";
import { authoriseAdmin } from "../utils/authorise";
import { createAdminSupabaseClient } from "@/utils/supabase/adminClient";

export async function GET(req: Request) {
  try {
    await authoriseAdmin(req, ["manage_brands"]);
    const supabaseServer = createAdminSupabaseClient();
    const { data, error } = await supabaseServer
      .from("Brands")
      .select("id, name, logo_url, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ brands: data });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Unauthorized" },
      { status: 401 }
    );
  }
}

export async function POST(req: Request) {
  try {
    await authoriseAdmin(req, ["manage_brands"]);

    const { name, logo_url } = await req.json();

    if (!name) {
      return NextResponse.json(
        { error: "Brand name is required" },
        { status: 400 }
      );
    }
    const supabaseServer = createAdminSupabaseClient();
    const { error } = await supabaseServer
      .from("Brands")
      .insert({ name, logo_url });

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