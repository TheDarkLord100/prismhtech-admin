"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { notify, Notification } from "@/utils/notify";

interface Props {
  metal: {
    id: string;
    name: string;
    live_price: number | null;
    is_visible: boolean;
  };
  token: string;
  onSuccess: (updatedMetal: any) => void;
}

export function UpdatePriceForm({ metal, token, onSuccess }: Props) {
  const [price, setPrice] = useState(
    metal.live_price !== null ? String(metal.live_price) : ""
  );
  const [isVisible, setIsVisible] = useState<boolean>(metal.is_visible);
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (!price || Number(price) <= 0) {
      notify(Notification.FAILURE, "Enter a valid price");
      return;
    }

    setLoading(true);

    const res = await fetch(`/api/metals/${metal.id}/price`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        price: Number(price),
        make_visible: isVisible,
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      notify(Notification.FAILURE, data.error);
      return;
    }

    notify(Notification.SUCCESS, "Price updated for today");

    onSuccess({
      ...metal,
      live_price: Number(price),
      is_visible: isVisible,
    });
  }

  return (
    <div className="space-y-4">
      {/* Metal name */}
      <div className="text-sm text-gray-500">
        Updating price for <strong>{metal.name}</strong>
      </div>

      {/* Current price */}
      {metal.live_price !== null && (
        <div className="text-sm text-gray-500">
          Current price: ₹ {metal.live_price}
        </div>
      )}

      {/* Price input */}
      <div>
        <Label>Today’s Price (₹)</Label>
        <Input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="Enter today's price"
        />
      </div>

      {/* Visibility toggle */}
      <div className="flex items-center gap-2">
        <Checkbox
          checked={isVisible}
          onCheckedChange={(v) => setIsVisible(!!v)}
        />
        <Label>Visible today</Label>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          onClick={() => onSuccess(metal)}
        >
          Cancel
        </Button>

        <Button onClick={submit} disabled={loading}>
          Save Price
        </Button>
      </div>
    </div>
  );
}
