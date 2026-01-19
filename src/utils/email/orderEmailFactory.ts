import { orderAcceptedTemplate } from "./templates/orderConfirmed";
import { orderShippedTemplate } from "./templates/orderShipped";
import { orderDeliveredTemplate } from "./templates/orderDelivered";
import { orderCancelledTemplate } from "./templates/orderCancelled";
import { genericStatusTemplate } from "./templates/genericStatus";
import { EmailTemplateResult } from "./types";

type TemplateArgs = {
  order: any;               // full order object
  status: string;
  note?: string | null;
  orderUrl: string;
};

export function getOrderStatusTemplate(
  args: TemplateArgs
): EmailTemplateResult {
  switch (args.status) {
    case "Order accepted":
      return orderAcceptedTemplate({
        order: args.order,
        orderUrl: args.orderUrl,
      });

    case "Shipped":
      return orderShippedTemplate({
        order: args.order,
        orderUrl: args.orderUrl,
        note: args.note,
      });

    case "Delivered":
      return orderDeliveredTemplate({
        order: args.order,
        orderUrl: args.orderUrl,
      });

    case "Cancelled":
      return orderCancelledTemplate({
        order: args.order,
        note: args.note,
      });

    default:
      return genericStatusTemplate({
        order: args.order,
        status: args.status,
        note: args.note,
        orderUrl: args.orderUrl,
      });
  }
}
