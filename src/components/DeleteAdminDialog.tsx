"use client";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { notify, Notification } from "@/utils/notify";
import { useUserStore } from "@/utils/store/userStore";

export default function DeleteAdminDialog({
  admin,
  onClose,
  onSuccess,
}: {
  admin: any;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const token = useUserStore((s) => s.token);

  async function handleDelete() {
    const res = await fetch(`/api/admin-user/${admin.id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();

    if (!res.ok) {
      notify(Notification.FAILURE, data.error);
      return;
    }

    notify(Notification.SUCCESS, "Admin deleted");
    onSuccess();
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Admin User</DialogTitle>
        </DialogHeader>

        <p>
          Are you sure you want to delete{" "}
          <b>{admin.name}</b>?
        </p>

        <DialogFooter className="gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>

          <Button variant="destructive" onClick={handleDelete}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
