import toast from "react-hot-toast";

export enum Notification {
  SUCCESS = "success",
  FAILURE = "failure",
  INFO = "info",
  WARNING = "warning",
}

export function notify(type: Notification, message: string) {
  switch (type) {
    case Notification.SUCCESS:
      toast.success(message);
      break;
    case Notification.FAILURE:
      toast.error(message);
      break;
    case Notification.INFO:
      toast(message, { icon: "ℹ️" });
      break;
    case Notification.WARNING:
      toast(message, { icon: "⚠️" });
      break;
    default:
      toast(message);
  }
}