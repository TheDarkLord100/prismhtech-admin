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
    "Order Placed",
    "Order accepted",
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
    const [sendMail, setSendMail] = useState(true);
    const [attachPdf, setAttachPdf] = useState(false);
    const [invoiceFile, setInvoiceFile] = useState<File | null>(null);


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
        const formData = new FormData();

        formData.append("new_status", newStatus);
        formData.append("description", statusNote);
        formData.append("notify_customer", String(sendMail));

        if (invoiceFile) {
            formData.append("invoice_pdf", invoiceFile);
        }

        const res = await fetch(`/api/orders/${id}`, {
            method: "PATCH",
            headers: {
                Authorization: `Bearer ${token}`,
            },
            body: formData,
        });

        const data = await res.json();

        if (!res.ok) {
            notify(Notification.FAILURE, data.error);
            return;
        }

        notify(Notification.SUCCESS, "Order status updated");

        setOrder((prev: any) => ({
            ...prev,
            status: data.order.status,
            status_description: data.order.status_description,
            history: data.history,
        }));

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

                {/* User Details */}
                <Card className="p-4 bg-white text-black">
                    <h2 className="font-semibold mb-3">Customer Details</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                        <div>
                            <span className="font-medium text-gray-600">Name</span>
                            <p>{order.user?.name ?? "—"}</p>
                        </div>

                        <div>
                            <span className="font-medium text-gray-600">Email</span>
                            <p className="break-all">{order.user?.email ?? "—"}</p>
                        </div>

                        <div>
                            <span className="font-medium text-gray-600">Phone</span>
                            <p>{order.user?.phone ?? "—"}</p>
                        </div>

                        <div>
                            <span className="font-medium text-gray-600">GST Number</span>
                            <p>{order.user?.gstin ?? "Not provided"}</p>
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
                                    <td className="p-2 font-medium">
                                        {i.product?.name ?? "—"}
                                    </td>

                                    <td className="p-2 text-gray-700">
                                        {i.variant?.name ?? "—"}
                                    </td>

                                    <td className="p-2">{i.quantity}</td>

                                    <td className="p-2">₹{i.price}</td>

                                    <td className="p-2 font-medium">
                                        ₹{i.price * i.quantity}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </Card>

                {/* GST Breakdown */}
                <Card className="p-4 bg-white text-black">
                    <h2 className="font-semibold mb-4">GST & Pricing</h2>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                            <span className="font-medium text-gray-600">Subtotal</span>
                            <p>₹{order.subtotal_amount}</p>
                        </div>

                        <div>
                            <span className="font-medium text-gray-600">GST Type</span>
                            <p>{order.gst_type}</p>
                        </div>

                        {order.gst_type === "CGST_SGST" ? (
                            <>
                                <div>
                                    <span className="font-medium text-gray-600">CGST (9%)</span>
                                    <p>₹{order.cgst_amount}</p>
                                </div>

                                <div>
                                    <span className="font-medium text-gray-600">SGST (9%)</span>
                                    <p>₹{order.sgst_amount}</p>
                                </div>
                            </>
                        ) : (
                            <div>
                                <span className="font-medium text-gray-600">IGST (18%)</span>
                                <p>₹{order.igst_amount}</p>
                            </div>
                        )}

                        <div className="col-span-2 md:col-span-4 border-t pt-3 mt-2">
                            <span className="font-semibold text-lg">Total Paid</span>
                            <p className="text-xl font-bold text-green-700">
                                ₹{order.total_amount}
                            </p>
                        </div>
                    </div>
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
                        <div className="flex flex-col gap-2 text-sm">
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={sendMail}
                                    onChange={(e) => setSendMail(e.target.checked)}
                                />
                                Send status update email to customer
                            </label>

                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={attachPdf}
                                    onChange={(e) => setAttachPdf(e.target.checked)}
                                    disabled={!sendMail}
                                />
                                Attach PDF (invoice / document)
                            </label>
                        </div>

                        <div className="flex flex-col gap-2 text-sm">
                            <label className="font-medium">Attach PDF (optional)</label>

                            <Input
                                type="file"
                                accept="application/pdf"
                                disabled={!sendMail}
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file && file.type !== "application/pdf") {
                                        notify(Notification.FAILURE, "Only PDF files allowed");
                                        return;
                                    }
                                    setInvoiceFile(file ?? null);
                                }}
                            />

                            {invoiceFile && (
                                <p className="text-xs text-gray-600">
                                    Selected: {invoiceFile.name}
                                </p>
                            )}
                        </div>

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
