import { baseEmailLayout } from "./baseLayout";
import { orderItemsTable } from "../components/orderItemsTable";
import { orderProgressBar } from "../components/orderProgressBar";

export function orderShippedTemplate({
  order,
  orderUrl,
  note,
}: {
  order: any;
  orderUrl: string;
  note?: string | null;
}) {
  const bodyHtml = `
    <p style="color:#333; font-size:15px;">
      Hi <strong>${order.user.name ?? "Customer"}</strong>,
    </p>

    <p style="color:#555; font-size:15px;">
      Your order <strong>#${order.id}</strong> has been shipped.
    </p>

    ${orderProgressBar("Shipped")}

    ${orderItemsTable(order.items ?? [])}
    
    ${note
      ? `<p style="background:#f5f7f6; padding:12px; border-left:4px solid #4CAF50;">
             <strong>Note:</strong> ${note}
           </p>`
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
        Track / View Order
      </a>
    </div>
  `;

  return {
    subject: `Order Shipped – ${order.id}`,
    html: baseEmailLayout({
      title: "Order Shipped",
      subtitle: "Shipping Update",
      bodyHtml,
    }),
  };
}
