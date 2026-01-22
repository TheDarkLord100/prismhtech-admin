"use client";

import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useEffect, useState } from "react";
import { notify, Notification } from "@/utils/notify";
import { useUserStore } from "@/utils/store/userStore";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { MetalForm } from "@/components/MetalForm";
import { UpdatePriceForm } from "@/components/UpdatePriceForm";
import { MetalPriceChart } from "@/components/MetalPriceChart";


interface MetalRow {
    id: string;
    name: string;
    live_price: number | null;
    lot_size: number;
    minimum_quantity: number;
    is_visible: boolean;
}

export default function MetalsAdminPage() {
    const router = useRouter();
    const [metals, setMetals] = useState<MetalRow[]>([]);
    const token = useUserStore((state) => state.token);
    const [loading, setLoading] = useState<boolean>(false);
    const [selected, setSelected] = useState<string[]>([]);
    const [addOpen, setAddOpen] = useState<boolean>(false);
    const [editMetal, setEditMetal] = useState<MetalRow | null>(null);
    const [priceMetal, setPriceMetal] = useState<MetalRow | null>(null);
    const [chartMetal, setChartMetal] = useState<MetalRow | null>(null);

    useEffect(() => {
        if (!token) return;

        async function loadMetals() {
            setLoading(true);

            const res = await fetch("/api/metals", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await res.json();
            console.log("Fetched metals:", data);
            if (!res.ok) {
                notify(Notification.FAILURE, data.error);
                setLoading(false);
                return;
            }

            setMetals(data.metals);
            setLoading(false);
        }

        loadMetals();
    }, [token]);

    const allSelected =
        metals.length > 0 && selected.length === metals.length;

    const toggleSelectAll = () => {
        setSelected(allSelected ? [] : metals.map((m) => m.id));
    };

    const toggleSelectRow = (id: string) => {
        setSelected((prev) =>
            prev.includes(id)
                ? prev.filter((x) => x !== id)
                : [...prev, id]
        );
    };

    async function setBulkVisibility(isVisible: boolean) {
        const res = await fetch("/api/metals/visibility", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                metal_ids: selected,
                is_visible: isVisible,
            }),
        });

        const data = await res.json();

        if (!res.ok) {
            notify(Notification.FAILURE, data.error);
            return;
        }

        notify(Notification.SUCCESS, "Visibility updated");

        setMetals((prev) =>
            prev.map((m) =>
                selected.includes(m.id)
                    ? { ...m, is_visible: isVisible }
                    : m
            )
        );

        setSelected([]);
    }


    return (
        <div className="flex h-screen bg-gradient-to-r from-[#16463B] via-[#317A45] to-[#4CAF50]">
            <Sidebar />

            <main className="flex-1 p-8 text-white overflow-y-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold">Metal Prices</h1>

                    <div className="flex gap-2">
                        {selected.length > 0 && (
                            <Button
                                className="bg-white text-[#16463B]"
                                onClick={() => setBulkVisibility(true)}
                            >
                                Set Visible ({selected.length})
                            </Button>
                        )}

                        <Button
                            className="bg-white text-[#16463B]"
                            onClick={() => setAddOpen(true)}
                        >
                            + Add Metal
                        </Button>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white text-black rounded-lg shadow-md overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-200">
                            <tr>
                                <th className="p-3 w-10">
                                    <Checkbox
                                        checked={allSelected}
                                        onCheckedChange={toggleSelectAll}
                                    />
                                </th>
                                <th className="p-3 text-left">Name</th>
                                <th className="p-3 text-left">Live Price (₹)</th>
                                <th className="p-3 text-left">Lot Size</th>
                                <th className="p-3 text-left">Min Qty</th>
                                <th className="p-3 text-left">Visible</th>
                                <th className="p-3 text-left">Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {loading && (
                                <tr>
                                    <td colSpan={7} className="p-6 text-center">
                                        Loading metals…
                                    </td>
                                </tr>
                            )}
                            {metals.map((m) => (
                                <tr
                                    key={m.id}
                                    className="border-t hover:bg-gray-50"
                                >
                                    <td className="p-3">
                                        <Checkbox
                                            checked={selected.includes(m.id)}
                                            onCheckedChange={() => toggleSelectRow(m.id)}
                                        />
                                    </td>

                                    <td className="p-3 font-medium">{m.name}</td>

                                    <td className="p-3">
                                        {m.live_price ? `₹ ${m.live_price}` : "—"}
                                    </td>

                                    <td className="p-3">{m.lot_size}</td>

                                    <td className="p-3">{m.minimum_quantity}</td>

                                    <td className="p-3">
                                        {m.is_visible ? (
                                            <span className="text-green-600 font-medium">
                                                Yes
                                            </span>
                                        ) : (
                                            <span className="text-gray-500">No</span>
                                        )}
                                    </td>

                                    <td className="p-3 flex gap-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => setPriceMetal(m)}
                                        >
                                            Update Price
                                        </Button>

                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() =>
                                                setEditMetal(m)
                                            }
                                        >
                                            Edit
                                        </Button>

                                        <Button
                                            size="sm"
                                            variant="secondary"
                                            onClick={() => setChartMetal(m)}
                                        >
                                            Chart
                                        </Button>
                                    </td>
                                </tr>
                            ))}

                            {metals.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={7}
                                        className="p-6 text-center text-gray-500"
                                    >
                                        No metals found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </main>
            <Dialog open={addOpen} onOpenChange={setAddOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Metal</DialogTitle>
                    </DialogHeader>

                    <MetalForm
                        submitLabel="Create Metal"
                        onSubmit={async (values) => {
                            const res = await fetch("/api/metals", {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json",
                                    Authorization: `Bearer ${token}`,
                                },
                                body: JSON.stringify(values),
                            });

                            const data = await res.json();

                            if (!res.ok) {
                                notify(Notification.FAILURE, data.error);
                                return;
                            }

                            notify(Notification.SUCCESS, "Metal created");
                            setAddOpen(false);

                            // refresh list
                            setMetals((prev) => [...prev, data.metal].sort((a, b) => a.name.localeCompare(b.name)));
                        }}
                    />
                </DialogContent>
            </Dialog>

            <Dialog open={!!editMetal} onOpenChange={() => setEditMetal(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Metal</DialogTitle>
                    </DialogHeader>

                    {editMetal && (
                        <MetalForm
                            initial={editMetal}
                            submitLabel="Save Changes"
                            onSubmit={async (values) => {
                                const res = await fetch(`/api/metals/${editMetal.id}`, {
                                    method: "PUT",
                                    headers: {
                                        "Content-Type": "application/json",
                                        Authorization: `Bearer ${token}`,
                                    },
                                    body: JSON.stringify(values),
                                });

                                const data = await res.json();

                                if (!res.ok) {
                                    notify(Notification.FAILURE, data.error);
                                    return;
                                }

                                notify(Notification.SUCCESS, "Metal updated");

                                setMetals((prev) =>
                                    prev.map((m) =>
                                        m.id === editMetal.id ? { ...m, ...values } : m
                                    )
                                );

                                setEditMetal(null);
                            }}
                        />
                    )}
                </DialogContent>
            </Dialog>
            <Dialog open={!!priceMetal} onOpenChange={() => setPriceMetal(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Update Price</DialogTitle>
                    </DialogHeader>

                    {priceMetal && (
                        <UpdatePriceForm
                            metal={priceMetal}
                            token={token!}
                            onSuccess={(updated) => {
                                setMetals((prev) =>
                                    prev.map((m) =>
                                        m.id === updated.id ? updated : m
                                    )
                                );
                                setPriceMetal(null);
                            }}
                        />
                    )}
                </DialogContent>
            </Dialog>
            <Dialog open={!!chartMetal} onOpenChange={() => setChartMetal(null)}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Price Chart</DialogTitle>
                    </DialogHeader>

                    {chartMetal && (
                        <MetalPriceChart
                            metalId={chartMetal.id}
                            metalName={chartMetal.name}
                            token={token!}
                        />
                    )}
                </DialogContent>
            </Dialog>

        </div>
    );
}
