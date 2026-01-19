import { baseEmailLayout } from "./baseLayout";
import { orderItemsTable } from "../components/orderItemsTable";
import { orderProgressBar } from "../components/orderProgressBar";

export function orderAcceptedTemplate({
  order,
  orderUrl,
}: {
  order: any;
  orderUrl: string;
}) {
  const bodyHtml = `
    <p style="color:#333; font-size:15px; line-height:1.6;">
      Hi <strong>${order.user.name ?? "Customer"}</strong>,
    </p>

    <p style="color:#555; font-size:15px; line-height:1.6;">
      Your order <strong>#${order.id}</strong> has been accepted and is now being processed.
    </p>

    ${orderProgressBar("Order Confirmed")}

    ${orderItemsTable(order.items ?? [])}

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
    subject: `Order Accepted – ${order.id}`,
    html: baseEmailLayout({
      title: "Order Accepted",
      subtitle: "Order Update",
      bodyHtml,
    }),
  };
}
