import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/utils/supabase/adminClient";
import { authoriseAdmin } from "../utils/authorise";
import { uploadToStorage } from "../utils/uploadToStorage";

export async function GET(req: Request) {
  try {
    await authoriseAdmin(req, ["manage_brands", "manage_products"]);

    const { searchParams } = new URL(req.url);
    const bucket = searchParams.get("bucket");

    if (!bucket) {
      return NextResponse.json(
        { error: "Bucket name is required" },
        { status: 400 }
      );
    }

    const supabaseServer = createAdminSupabaseClient();

    const { data, error } = await supabaseServer.storage
      .from(bucket)
      .list("", {
        limit: 100,
        offset: 0,
        sortBy: { column: "created_at", order: "desc" },
      });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    // ✅ Convert file names to public URLs
    const urls =
      data?.map((file) => {
        const { data: urlData } = supabaseServer.storage
          .from(bucket)
          .getPublicUrl(file.name);

        return urlData.publicUrl;
      }) || [];

    return NextResponse.json({ files: urls });

  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Unauthorized" },
      { status: 401 }
    );
  }
}

export async function POST(req: Request) {
  try {
    await authoriseAdmin(req, ["manage_brands", "manage_products"]);

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const bucket = formData.get("bucket") as string;
    const fileName = formData.get("fileName") as string;
    if (!file) {
      return NextResponse.json(
        { error: "File is required" },
        { status: 400 }
      );
    }

    if (!bucket || !fileName) {
      return NextResponse.json(
        { error: "Bucket name is required" },
        { status: 400 }
      );
    }

    const { url } = await uploadToStorage({ file, bucket, fileName });

    return NextResponse.json({ success: "true", url });
    
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Unauthorized" },
      { status: 401 }
    );
  }
}