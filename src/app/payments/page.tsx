"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { notify, Notification } from "@/utils/notify";
import { useUserStore } from "@/utils/store/userStore";
import { useRouter } from "next/navigation";

interface PaymentRow {
  id: string;
  created_at: string;
  payment_id: string;
  order_id: string | null;
  amount: number | null;
  method: string | null;
  status: string | null;
  transaction_id: string | null;
}

function StatusBadge({ status }: { status: string | null }) {
  const s = status?.toLowerCase();
  switch (s) {
    case "success":
      return <Badge className="bg-green-600">Success</Badge>;
    case "pending":
      return <Badge variant="secondary">Pending</Badge>;
    case "failed":
      return <Badge variant="destructive">Failed</Badge>;
    case "refunded":
      return <Badge className="bg-blue-600">Refunded</Badge>;
    default:
      return <Badge variant="outline">Unknown</Badge>;
  }
}

export default function PaymentsPage() {
  const token = useUserStore((s) => s.token);
  const router = useRouter();

  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;

    async function load() {
      try {
        const res = await fetch("/api/payments", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (!res.ok) {
          notify(Notification.FAILURE, data.error || "Failed to load payments");
          return;
        }

        setPayments(data.payments);
      } catch {
        notify(Notification.FAILURE, "Something went wrong");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [token]);

  return (
    <div className="flex h-screen bg-gradient-to-r from-[#16463B] via-[#317A45] to-[#4CAF50]">
      <Sidebar />

      <main className="flex-1 p-8 text-white overflow-y-auto">
        <h1 className="text-3xl font-bold mb-6">Payments</h1>

        <div className="bg-white text-black rounded-lg shadow-md overflow-hidden">
          <Table>
            <TableHeader className="bg-gray-200">
              <TableRow>
                <TableHead>Payment ID</TableHead>
                <TableHead>Order ID</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Transaction ID</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading && (
                <TableRow>
                  <TableCell colSpan={8} className="p-6 text-center">
                    Loading payments…
                  </TableCell>
                </TableRow>
              )}

              {!loading && payments.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="p-6 text-center text-gray-500"
                  >
                    No payments found
                  </TableCell>
                </TableRow>
              )}

              {payments.map((p) => (
                <TableRow key={p.id} className="hover:bg-gray-50">
                  <TableCell className="font-medium">
                    {p.payment_id}
                  </TableCell>

                  <TableCell className="text-gray-600">
                    {p.order_id ?? "—"}
                  </TableCell>

                  <TableCell className="text-right">
                    {p.amount ? `₹${p.amount}` : "—"}
                  </TableCell>

                  <TableCell>{p.method ?? "—"}</TableCell>

                  <TableCell>
                    <StatusBadge status={p.status} />
                  </TableCell>

                  <TableCell>
                    {p.transaction_id ?? "—"}
                  </TableCell>

                  <TableCell className="text-gray-600">
                    {new Date(p.created_at).toLocaleString()}
                  </TableCell>

                  <TableCell>
                    {p.order_id && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          router.push(`/orders/${p.order_id}`)
                        }
                      >
                        View Order
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </main>
    </div>
  );
}
