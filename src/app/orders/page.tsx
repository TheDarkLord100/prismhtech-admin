"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { notify, Notification } from "@/utils/notify";
import { useUserStore } from "@/utils/store/userStore";
import { useRouter } from "next/navigation";

interface OrderRow {
  id: string;
  created_at: string;
  total_amount: number;
  status: string;
  items_count: number;
}

const STATUS_STYLES: Record<string, string> = {
  CREATED: "bg-gray-100 text-gray-700",
  "Order placed": "bg-blue-100 text-blue-700",
  "Order accepted": "bg-indigo-100 text-indigo-700",
  Packed: "bg-yellow-100 text-yellow-800",
  Shipped: "bg-orange-100 text-orange-800",
  Delivered: "bg-green-100 text-green-700",
  Cancelled: "bg-red-100 text-red-700",
};


export default function OrdersPage() {
  const token = useUserStore((s) => s.token);
  const router = useRouter();

  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;

    async function load() {
      const res = await fetch("/api/orders", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        notify(Notification.FAILURE, data.error);
        return;
      }

      setOrders(data.orders);
      setLoading(false);
    }

    load();
  }, [token]);

  return (
    <div className="flex h-screen bg-gradient-to-r from-[#16463B] via-[#317A45] to-[#4CAF50]">
      <Sidebar />

      <main className="flex-1 p-8 text-white overflow-y-auto">
        <h1 className="text-3xl font-bold mb-6">Orders</h1>

        <div className="bg-white text-black rounded-lg shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-200">
              <tr>
                <th className="p-3 text-left">Order ID</th>
                <th className="p-3 text-left">Order Time</th>
                <th className="p-3 text-left">Items</th>
                <th className="p-3 text-left">Total</th>
                <th className="p-3 text-left">Payment</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>


            <tbody>
              {loading && (
                <tr>
                  <td colSpan={6} className="p-6 text-center">
                    Loading orders…
                  </td>
                </tr>
              )}

              {!loading && orders.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-gray-500">
                    No orders found
                  </td>
                </tr>
              )}

              {orders.map((o) => (
                <tr key={o.id} className="border-t hover:bg-gray-50">
                  <td className="p-3 text-sm text-gray-600">
                    <span title={o.id} className="cursor-help">
                      {o.id.slice(0, 8)}…
                    </span>
                  </td>


                  <td className="p-3">
                    {new Date(o.created_at).toLocaleString()}
                  </td>

                  <td className="p-3">{o.items_count}</td>

                  <td className="p-3">₹{o.total_amount}</td>
                  <td className="p-3">
                    {o.status !== "CREATED" ? (
                      <span className="text-green-700 font-medium">Paid</span>
                    ) : (
                      <span className="text-red-600 font-medium">Pending</span>
                    )}
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded text-sm font-medium ${STATUS_STYLES[o.status] ?? "bg-gray-100 text-gray-700"
                        }`}
                    >
                      {o.status}
                    </span>
                  </td>
                  <td className="p-3">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => router.push(`/orders/${o.id}`)}
                    >
                      View / Update
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
