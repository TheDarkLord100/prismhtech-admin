import { baseEmailLayout } from "./baseLayout";
import { orderItemsTable } from "../components/orderItemsTable";
import { orderProgressBar } from "../components/orderProgressBar";

export function orderDeliveredTemplate({
  order,
  orderUrl,
}: {
  order: any;
  orderUrl: string;
}) {
  const bodyHtml = `
    <p style="color:#333; font-size:15px;">
      Hi <strong>${order.user.name ?? "Customer"}</strong>,
    </p>

    <p style="color:#555; font-size:15px;">
      Your order <strong>#${order.id}</strong> has been delivered successfully.
    </p>

    <p style="color:#555; font-size:14px;">
      We hope everything met your expectations.
    </p>

    ${orderProgressBar("Delivered")}

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
        View Order
      </a>
    </div>
  `;

  return {
    subject: `Order Delivered – ${order.id}`,
    html: baseEmailLayout({
      title: "Order Delivered",
      subtitle: "Thank You for Your Purchase",
      bodyHtml,
    }),
  };
}
