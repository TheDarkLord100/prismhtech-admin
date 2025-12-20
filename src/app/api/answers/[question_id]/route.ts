import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/utils/supabase/adminClient";
import { authoriseAdmin } from "@/app/api/utils/authorise";

export async function PUT(
  req: Request,
  { params }: { params: { question_id: string } }
) {
  try {
    await authoriseAdmin(req, ["manage_questions"]);
    const supabase = createAdminSupabaseClient();

    const { body } = await req.json();

    if (!body) {
      return NextResponse.json(
        { error: "Answer body required" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("answers")
      .update({ body })
      .eq("question_id", params.question_id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to update answer" },
      { status: err.status || 500 }
    );
  }
}
