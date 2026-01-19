export function orderItemsTable(items: any[]) {
  const rows = items
    .map(
      (item) => `
      <tr>
        <td style="padding:8px 6px; border-bottom:1px solid #eee;">
          <strong>${item.product?.name ?? "Product"}</strong><br/>
          <span style="font-size:12px; color:#666;">
            ${item.variant?.name ?? ""}
          </span>
        </td>
        <td align="center" style="padding:8px 6px; border-bottom:1px solid #eee;">
          ${item.quantity}
        </td>
        <td align="right" style="padding:8px 6px; border-bottom:1px solid #eee;">
          ₹${item.price}
        </td>
      </tr>
    `
    )
    .join("");

  return `
    <table width="100%" cellpadding="0" cellspacing="0"
      style="border-collapse:collapse; margin-top:20px; font-size:14px;">
      <tr style="background-color:#eaf5ef;">
        <th align="left" style="padding:8px;">Item</th>
        <th align="center" style="padding:8px;">Qty</th>
        <th align="right" style="padding:8px;">Price</th>
      </tr>
      ${rows}
    </table>
  `;
}
