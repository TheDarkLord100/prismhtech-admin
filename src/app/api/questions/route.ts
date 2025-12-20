import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/utils/supabase/adminClient";
import { authoriseAdmin } from "@/app/api/utils/authorise";

export async function GET(req: Request) {
  try {
    await authoriseAdmin(req, ["manage_admins"]);

    const supabase = createAdminSupabaseClient();
    const { searchParams } = new URL(req.url);

    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "all";
    const sort = searchParams.get("sort") || "new";
    const page = Number(searchParams.get("page") || 1);
    const limit = 10;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from("questions")
      .select(
        `
        id,
        title,
        body,
        created_at,
        status,
        question_images(image_url),
        question_tag_map(tags(name)),
        question_likes(count),
        answers(body)
      `,
        { count: "exact" }
      );

    if (status !== "all") {
      query = query.eq("status", status);
    }

    if (search) {
      query = query.or(
        `title.ilike.%${search}%,body.ilike.%${search}%`
      );
    }

    query =
      sort === "old"
        ? query.order("created_at", { ascending: true })
        : query.order("created_at", { ascending: false });

    const { data, error } = await query.range(from, to);

    if (error) throw error;

    const questions = data.map((q: any) => ({
      id: q.id,
      title: q.title,
      body: q.body,
      created_at: q.created_at,
      status: q.status,
      images: q.question_images.map((i: any) => i.image_url),
      tags: q.question_tag_map.map((t: any) => t.tags.name),
      like_count: q.question_likes[0]?.count ?? 0,
      answer: q.answers?.[0]
        ? { body: q.answers[0].body }
        : undefined,
    }));

    return NextResponse.json({ questions });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to fetch questions" },
      { status: err.status || 500 }
    );
  }
}
