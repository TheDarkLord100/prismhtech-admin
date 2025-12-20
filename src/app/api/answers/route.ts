import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/utils/supabase/adminClient";
import { authoriseAdmin } from "@/app/api/utils/authorise";

export async function POST(req: Request) {
  try {
    const admin = await authoriseAdmin(req, ["manage_admins"]);
    const supabase = createAdminSupabaseClient();

    const { question_id, body } = await req.json();

    if (!question_id || !body) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    // 1️⃣ Insert answer
    const { error: answerError } = await supabase
      .from("answers")
      .insert({
        question_id,
        admin_id: admin.id,
        body,
      });

    if (answerError) throw answerError;

    // 2️⃣ Update question status
    await supabase
      .from("questions")
      .update({ status: "answered" })
      .eq("id", question_id);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to submit answer" },
      { status: err.status || 500 }
    );
  }
}
