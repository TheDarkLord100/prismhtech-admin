import { baseEmailLayout } from "./baseLayout";

export function orderCancelledTemplate({
  order,
  note,
}: {
  order: any;
  note?: string | null;
}) {
  const bodyHtml = `
    <p style="color:#333; font-size:15px;">
      Hi <strong>${order.user.name ?? "Customer"}</strong>,
    </p>

    <p style="color:#555; font-size:15px;">
      Your order <strong>#${order.id}</strong> has been cancelled.
    </p>

    ${
      note
        ? `<p style="background:#fff4f4; padding:12px; border-left:4px solid #e53935;">
             <strong>Reason:</strong> ${note}
           </p>`
        : ""
    }

    <p style="color:#777; font-size:13px;">
      If any amount was charged, it will be refunded as per our policy.
    </p>
  `;

  return {
    subject: `Order Cancelled – ${order.id}`,
    html: baseEmailLayout({
      title: "Order Cancelled",
      subtitle: "Order Update",
      bodyHtml,
    }),
  };
}
