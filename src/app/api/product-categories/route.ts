import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/utils/supabase/adminClient";
import { authoriseAdmin } from "../utils/authorise";

export async function GET(req: Request) {
  try {
    await authoriseAdmin(req, ["manage_inventory", "manage_products"]);

    const supabase = createAdminSupabaseClient();

    const { data, error } = await supabase
      .from("ProductCategories")
      .select("id, name, description, image_url, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ categories: data });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Unauthorized" },
      { status: 401 }
    );
  }
}

export async function POST(req: Request) {
  try {
    await authoriseAdmin(req, ["manage_inventory", "manage_products"]);

    const { name, description, image_url } = await req.json();

    if (!name) {
      return NextResponse.json(
        { error: "Category name is required" },
        { status: 400 }
      );
    }

    const supabase = createAdminSupabaseClient();

    const { error } = await supabase
      .from("ProductCategories")
      .insert({
        name,
        description,
        image_url,
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
