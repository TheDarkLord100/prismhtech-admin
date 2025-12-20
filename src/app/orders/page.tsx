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
                  <td className="p-3 text-sm text-gray-600">{o.id}</td>

                  <td className="p-3">
                    {new Date(o.created_at).toLocaleString()}
                  </td>

                  <td className="p-3">{o.items_count}</td>

                  <td className="p-3">₹{o.total_amount}</td>

                  <td className="p-3">
                    <span className="px-2 py-1 rounded bg-gray-100 text-sm">
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
