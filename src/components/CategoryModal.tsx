"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import MediaPickerDialog from "@/components/MediaPickerDialog";
import { useUserStore } from "@/utils/store/userStore";
import { notify, Notification } from "@/utils/notify";
import type { ProductCategory } from "@/types/productCategory";

export default function CategoryModal({
  category,
  onClose,
  onSuccess,
}: {
  category: ProductCategory | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const token = useUserStore((s) => s.token);
  const isEdit = Boolean(category);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    if (category) {
      setName(category.name);
      setDescription(category.description || "");
      setImageUrl(category.image_url || null);
    }
  }, [category]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !description || !imageUrl) {
        notify(Notification.FAILURE, "Please fill in all required fields");
        return;
    }

    const res = await fetch(
      isEdit
        ? `/api/product-categories/${category!.id}`
        : `/api/product-categories`,
      {
        method: isEdit ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          description,
          image_url: imageUrl,
        }),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      notify(Notification.FAILURE, data.error);
      return;
    }

    notify(Notification.SUCCESS, isEdit ? "Category updated" : "Category created");
    onSuccess();
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Category" : "Add Category"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder="Category name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <Textarea
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          {/* Image */}
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 border rounded flex items-center justify-center bg-gray-50">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  className="h-full w-full object-contain"
                />
              ) : (
                <span className="text-xs text-gray-400">No image</span>
              )}
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={() => setShowPicker(true)}
            >
              Choose Image
            </Button>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {isEdit ? "Update" : "Create"}
            </Button>
          </div>
        </form>

        {showPicker && (
          <MediaPickerDialog
            bucket="product_categories"
            open={showPicker}
            onClose={() => setShowPicker(false)}
            onSelect={(url) => {
              setImageUrl(url);
              setShowPicker(false);
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
