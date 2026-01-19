export function orderProgressBar(currentStatus: string) {
  const steps = [
    { label: "Confirmed", value: "Order Confirmed" },
    { label: "Shipped", value: "Shipped" },
    { label: "Out for delivery", value: "Out for delivery" },
    { label: "Delivered", value: "Delivered" },
  ];

  const currentIndex = steps.findIndex(
    (s) => s.value === currentStatus
  );

  const stepHtml = steps
    .map((step, index) => {
      const isCompleted = index <= currentIndex;

      return `
        <td align="center" style="width:25%;">
          <div style="
            width:22px;
            height:22px;
            border-radius:50%;
            background-color:${isCompleted ? "#0ea5a4" : "#e5e7eb"};
            color:#fff;
            font-size:12px;
            line-height:22px;
            margin:0 auto;
          ">
            ${isCompleted ? "✓" : ""}
          </div>
          <div style="font-size:12px; margin-top:6px; color:#333;">
            ${step.label}
          </div>
        </td>
      `;
    })
    .join("");

  const barHtml = `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;">
      <tr>
        ${stepHtml}
      </tr>
    </table>
  `;

  return barHtml;
}
