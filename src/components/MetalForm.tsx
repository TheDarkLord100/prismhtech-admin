"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

interface MetalFormProps {
  initial?: {
    name: string;
    lot_size: number;
    minimum_quantity: number;
  };
  onSubmit: (data: {
    name: string;
    lot_size: number;
    minimum_quantity: number;
  }) => Promise<void>;
  submitLabel: string;
}

export function MetalForm({
  initial,
  onSubmit,
  submitLabel,
}: MetalFormProps) {
  const [name, setName] = useState(initial?.name || "");
  const [lotSize, setLotSize] = useState(initial?.lot_size || "");
  const [minQty, setMinQty] = useState(initial?.minimum_quantity || "");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setLoading(true);
    await onSubmit({
      name,
      lot_size: Number(lotSize),
      minimum_quantity: Number(minQty),
    });
    setLoading(false);
  }

  return (
    <div className="space-y-4">
      <div>
        <Label>Name</Label>
        <Input value={name} onChange={(e) => setName(e.target.value)} />
      </div>

      <div>
        <Label>Lot Size</Label>
        <Input
          type="number"
          value={lotSize}
          onChange={(e) => setLotSize(e.target.value)}
        />
      </div>

      <div>
        <Label>Minimum Quantity</Label>
        <Input
          type="number"
          value={minQty}
          onChange={(e) => setMinQty(e.target.value)}
        />
      </div>

      <Button onClick={handleSubmit} disabled={loading}>
        {submitLabel}
      </Button>
    </div>
  );
}
