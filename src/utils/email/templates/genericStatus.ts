import { baseEmailLayout } from "./baseLayout";
import { EmailTemplateResult } from "../types";

export function genericStatusTemplate({
  order,
  status,
  note,
  orderUrl,
}: {
  order: any;
  status: string;
  note?: string | null;
  orderUrl: string;
}): EmailTemplateResult {
  const bodyHtml = `
    <p style="color:#333; font-size:15px; line-height:1.6;">
      Hi <strong>${order.user?.name ?? "Customer"}</strong>,
    </p>

    <p style="color:#555; font-size:15px; line-height:1.6;">
      The status of your order <strong>#${order.id}</strong> has been updated to
      <strong>${status}</strong>.
    </p>

    ${
      note
        ? `
          <div style="
            margin:16px 0;
            padding:12px;
            background-color:#f5f7f6;
            border-left:4px solid #4CAF50;
            font-size:14px;
          ">
            <strong>Note:</strong> ${note}
          </div>
        `
        : ""
    }

    <div style="text-align:center; margin:30px 0;">
      <a href="${orderUrl}"
        style="
          display:inline-block;
          padding:14px 28px;
          background-color:#4CAF50;
          color:#ffffff;
          text-decoration:none;
          border-radius:6px;
          font-weight:bold;
          font-size:16px;
        ">
        View Order Details
      </a>
    </div>

    <p style="word-break:break-all; font-size:13px; color:#4CAF50;">
      ${orderUrl}
    </p>
  `;

  return {
    subject: `Order Update – ${order.id}`,
    html: baseEmailLayout({
      title: "Order Status Update",
      subtitle: "Order Update",
      bodyHtml,
    }),
  };
}
