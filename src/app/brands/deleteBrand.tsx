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
import type { Brand } from "@/types/brand";

export default function DeleteBrandDialog({
  brand,
  onClose,
  onSuccess,
}: {
  brand: Brand;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const token = useUserStore((s) => s.token);

  async function handleDelete() {
    if (!token) {
      notify(Notification.FAILURE, "Not authenticated");
      return;
    }

    const res = await fetch(
      `/api/brands/${brand.id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await res.json();

    if (!res.ok) {
      notify(Notification.FAILURE, data.error);
      return;
    }

    notify(Notification.SUCCESS, "Brand deleted");
    onSuccess();
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Brand</DialogTitle>
        </DialogHeader>

        <p className="text-sm text-gray-600">
          Are you sure you want to delete the brand{" "}
          <b>{brand.name}</b>?  
          This action cannot be undone.
        </p>

        <DialogFooter className="gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>

          <Button
            variant="destructive"
            onClick={handleDelete}
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
