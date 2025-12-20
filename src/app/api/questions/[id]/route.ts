import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/utils/supabase/adminClient";
import { authoriseAdmin } from "@/app/api/utils/authorise";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await authoriseAdmin(req, ["manage_admins"]);

    const supabase = createAdminSupabaseClient();

    const { data, error } = await supabase
      .from("questions")
      .select(`
        id,
        title,
        body,
        created_at,
        status,
        question_images(image_url),
        question_tag_map(tags(name)),
        question_likes(count),
        answers(body)
      `)
      .eq("id", params.id)
      .single();

    if (error) throw error;

    return NextResponse.json({
      question: {
        id: data.id,
        title: data.title,
        body: data.body,
        created_at: data.created_at,
        status: data.status,
        images: data.question_images.map((i: any) => i.image_url),
        tags: data.question_tag_map.map((t: any) => t.tags.name),
        like_count: data.question_likes[0]?.count ?? 0,
        answer: data.answers?.[0] ?? null,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to load question" },
      { status: err.status || 500 }
    );
  }
}
