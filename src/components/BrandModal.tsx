"use client";

import { useEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useUserStore } from "@/utils/store/userStore";
import { notify, Notification } from "@/utils/notify";
import MediaPickerDialog from "./MediaPickerDialog";
import type { Brand } from "@/types/brand";

export default function BrandModal({
    brand,
    onClose,
    onSuccess,
}: {
    brand: Brand | null;
    onClose: () => void;
    onSuccess: () => void;
}) {
    const token = useUserStore((s) => s.token);

    const [name, setName] = useState("");
    const [logoUrl, setLogoUrl] = useState<string | null>(null);
    const isEdit = Boolean(brand);
    const [showMediaPicker, setShowMediaPicker] = useState(false);

    useEffect(() => {
        if (brand) {
            setName(brand.name);
            setLogoUrl(brand.logo_url || null);
        } else {
            setName("");
            setLogoUrl(null);
        }
    }, [brand]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (!token) {
            notify(Notification.FAILURE, "Not authenticated");
            return;
        }

        const url = isEdit
            ? `/api/brands/${brand!.id}`
            : `/api/brands`;

        const method = isEdit ? "PUT" : "POST";

        const res = await fetch(url, {
            method,
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                name,
                logo_url: logoUrl,
            }),
        });

        const data = await res.json();

        if (!res.ok) {
            notify(Notification.FAILURE, data.error);
            return;
        }

        notify(
            Notification.SUCCESS,
            isEdit ? "Brand updated" : "Brand created"
        );
        onSuccess();
    }

    return (
        <Dialog open onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {isEdit ? "Edit Brand" : "Add Brand"}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Brand Name */}
                    <Input
                        placeholder="Brand name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />

                    {/* Logo Preview */}
                    <div className="flex items-center gap-4">
                        <div className="h-16 w-16 border rounded flex items-center justify-center bg-gray-50">
                            {logoUrl ? (
                                <img
                                    src={logoUrl}
                                    alt="Brand logo"
                                    className="h-full w-full object-contain"
                                />
                            ) : (
                                <span className="text-xs text-gray-400">
                                    No logo
                                </span>
                            )}
                        </div>

                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setShowMediaPicker(true)}
                        >
                            Choose Logo
                        </Button>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                        >
                            Cancel
                        </Button>

                        <Button type="submit">
                            {isEdit ? "Update" : "Create"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
            {showMediaPicker && (
                <MediaPickerDialog
                    bucket="brands"
                    open={showMediaPicker}
                    onClose={() => setShowMediaPicker(false)}
                    onSelect={(url) => {
                        setLogoUrl(url);
                        setShowMediaPicker(false);
                    }}
                />
            )}

        </Dialog>
    );
}
