"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useUserStore } from "@/utils/store/userStore";
import { notify, Notification } from "@/utils/notify";

const ORDER_STATUSES = [
    "Order placed",
    "Order accepted",
    "Packed",
    "Shipped",
    "Delivered",
    "Cancelled",
];

export default function OrderDetailsPage() {
    const { id } = useParams();
    const token = useUserStore((s) => s.token);
    const router = useRouter();
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [newStatus, setNewStatus] = useState("");
    const [statusNote, setStatusNote] = useState("");
    const [currentStatusIndex, setCurrentStatusIndex] = useState(0);

    useEffect(() => {
        if (!token) return;

        async function load() {
            const res = await fetch(`/api/orders/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const data = await res.json();
            console.log(data);
            if (!res.ok) {
                notify(Notification.FAILURE, data.error);
                return;
            }
            setCurrentStatusIndex(ORDER_STATUSES.indexOf(data.order.status));
            setOrder(data.order);
            setNewStatus(data.order.status);
            setLoading(false);
        }

        load();
    }, [token, id]);

    async function updateStatus() {
        const res = await fetch(`/api/orders/${id}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                new_status: newStatus,
                description: statusNote,
            }),
        });

        const data = await res.json();

        if (!res.ok) {
            notify(Notification.FAILURE, data.error);
            return;
        }

        notify(Notification.SUCCESS, "Order status updated");

        // reload order
        const refreshed = await fetch(`/api/orders/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
        }).then((r) => r.json());

        setOrder(refreshed.order);
        setStatusNote("");
    }

    const isStatusDisabled = (status: string) => {
        const statusIndex = ORDER_STATUSES.indexOf(status);

        // disable:
        // 1. all previous statuses
        // 2. the current status itself
        return statusIndex <= currentStatusIndex;
    };

    if (loading) {
        return <div className="p-8">Loading...</div>;
    }

    const { shipping_address, billing_address } = order;
    const generateInvoice = () => {
    }

    return (
        <div className="flex h-screen bg-gradient-to-r from-[#16463B] via-[#317A45] to-[#4CAF50]">
            <Sidebar />

            <main className="flex-1 p-8 text-white overflow-y-auto space-y-6">
                {/* Header */}
                {/* Header */}
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold">Order #{order.id}</h1>

                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            className="bg-white text-[#16463B]"
                            onClick={() => router.push(`/payments/${order.id}`)}
                        >
                            Payment Details
                        </Button>

                        <Button
                            variant="outline"
                            className="bg-white text-[#16463B]"
                            onClick={generateInvoice}
                        >
                            Invoice
                        </Button>
                    </div>
                </div>


                {/* Order Summary */}
                <Card className="p-4 bg-white text-black">
                    <h2 className="font-semibold mb-2">Order Summary</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                            <span className="font-medium">Status</span>
                            <p>{order.status}</p>
                        </div>
                        <div>
                            <span className="font-medium">Total Amount</span>
                            <p>₹{order.total_amount}</p>
                        </div>
                        <div>
                            <span className="font-medium">Payment</span>
                            <p>{order.payment_type}</p>
                        </div>
                        <div>
                            <span className="font-medium">Order Time</span>
                            <p>{new Date(order.created_at).toLocaleString()}</p>
                        </div>
                    </div>
                </Card>

                {/* Addresses */}
                <div className="grid md:grid-cols-2 gap-6">
                    {[shipping_address, billing_address].map((addr: any, idx: number) => (
                        <Card key={idx} className="p-4 bg-white text-black">
                            <h2 className="font-semibold mb-2">
                                {idx === 0 ? "Shipping Address" : "Billing Address"}
                            </h2>
                            <p>{addr.name}</p>
                            <p>{addr.phone}</p>
                            <p>
                                {addr.address_l1}, {addr.address_l2}
                            </p>
                            <p>
                                {addr.city}, {addr.state} - {addr.pincode}
                            </p>
                            <p>{addr.country}</p>
                        </Card>
                    ))}
                </div>

                {/* Order Items */}
                <Card className="p-4 bg-white text-black">
                    <h2 className="font-semibold mb-4">Items</h2>

                    <table className="w-full text-sm">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="p-2 text-left">Product</th>
                                <th className="p-2 text-left">Variant</th>
                                <th className="p-2 text-left">Qty</th>
                                <th className="p-2 text-left">Price</th>
                                <th className="p-2 text-left">Subtotal</th>
                            </tr>
                        </thead>
                        <tbody>
                            {order.items.map((i: any) => (
                                <tr key={i.id} className="border-t">
                                    <td className="p-2">{i.product_name}</td>
                                    <td className="p-2">{i.variant_name}</td>
                                    <td className="p-2">{i.quantity}</td>
                                    <td className="p-2">₹{i.price}</td>
                                    <td className="p-2">₹{i.price * i.quantity}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </Card>

                {/* Update Status */}
                <Card className="p-4 bg-white text-black">
                    <h2 className="font-semibold mb-4">Update Status</h2>

                    <div className="grid md:grid-cols-3 gap-4">
                        <Select value={newStatus} onValueChange={setNewStatus}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>

                            <SelectContent>
                                {ORDER_STATUSES.map((s) => (
                                    <SelectItem
                                        key={s}
                                        value={s}
                                        disabled={isStatusDisabled(s)}
                                    >
                                        {s}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>


                        <Textarea
                            placeholder="Status description (optional)"
                            value={statusNote}
                            onChange={(e) => setStatusNote(e.target.value)}
                        />

                        <Button
                            className="bg-[#4CAF50] text-white"
                            onClick={updateStatus}
                            disabled={order.status === "Delivered" || order.status === "Cancelled"}
                        >
                            Update
                        </Button>
                    </div>
                </Card>

                {/* Status History */}
                <Card className="p-4 bg-white text-black">
                    <h2 className="font-semibold mb-4">Status History</h2>

                    <ul className="space-y-3 text-sm">
                        {order.history.map((h: any) => (
                            <li key={h.id} className="border-l-2 pl-4">
                                <p>
                                    <strong>{h.old_status}</strong> →{" "}
                                    <strong>{h.new_status}</strong>
                                </p>
                                {h.note && <p className="text-gray-600">{h.note}</p>}
                                <p className="text-xs text-gray-500">
                                    {new Date(h.changed_at).toLocaleString()}
                                </p>
                            </li>
                        ))}
                    </ul>
                </Card>
            </main>
        </div>
    );
}
