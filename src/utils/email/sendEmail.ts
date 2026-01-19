import { Resend } from "resend";
import { getOrderStatusTemplate } from "./orderEmailFactory";
import { createAdminSupabaseClient } from "@/utils/supabase/adminClient";

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function sendOrderStatusEmail({
  orderId,
  status,
  note,
  attachment,
}: {
  orderId: string;
  status: string;
  note?: string | null;
  attachment?: {
    filename: string;
    content: string; // base64
  };
}) {
  const supabase = createAdminSupabaseClient();

  /* ---------------- FETCH ORDER + USER ---------------- */
  const { data: order, error } = await supabase
    .from("Orders")
    .select(`
    id,
    status,
    user:users ( name, email ),
    items:OrderItems (
      quantity,
      price,
      product:products ( name ),
      variant:ProductVariants ( name )
    )
  `)
    .eq("id", orderId)
    .single();


  const user = order?.user as any;
  if (error || !order || !user?.email) {
    // Fail silently: status update should not break if email fails
    return;
  }

  /* ---------------- PREPARE TEMPLATE INPUT ---------------- */
  const orderUrl = `${process.env.SITE_URL}/order?order_id=${order.id}`;

  const template = getOrderStatusTemplate({
    order,
    status,
    note,
    orderUrl,
  });

  /* ---------------- SEND EMAIL ---------------- */
  await resend.emails.send({
    from: `Pervesh Rasayan <${process.env.FROM_EMAIL}>`,
    to: user.email,
    subject: template.subject,
    html: template.html,
    attachments: attachment ? [attachment] : [],
  });
}
