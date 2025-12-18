"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import { Input } from "@/components/ui/input";
import { notify, Notification } from "@/utils/notify";
import { useUserStore } from "@/utils/store/userStore";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";


interface ProductRow {
    id: string;
    name: string;
    brand: string;
    category: string;
    total_quantity: number;
    variant_count: number;
}

export default function ProductsPage() {
    const router = useRouter();
    const token = useUserStore((s) => s.token);

    const [products, setProducts] = useState<ProductRow[]>([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [deleteProduct, setDeleteProduct] = useState<ProductRow | null>(null);


    useEffect(() => {
        if (!token) return;

        async function load() {
            const res = await fetch("/api/products", {
                headers: { Authorization: `Bearer ${token}` },
            });

            const data = await res.json();

            if (!res.ok) {
                notify(Notification.FAILURE, data.error);
                return;
            }

            setProducts(data.products);
            setLoading(false);
        }

        load();
    }, [token]);

    const filteredProducts = products.filter((p) =>
        `${p.name} ${p.brand} ${p.category}`
            .toLowerCase()
            .includes(search.toLowerCase())
    );

    return (
        <div className="flex h-screen bg-gradient-to-r from-[#16463B] via-[#317A45] to-[#4CAF50]">
            <Sidebar />

            <main className="flex-1 p-8 text-white overflow-y-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold">Products</h1>

                    <div className="flex gap-2">
                        <Button variant="outline" className="bg-white text-[#16463B]" onClick={() => router.push("/bulk-upload")}>
                            Upload CSV
                        </Button>
                        <Button
                            className="bg-white text-[#16463B]"
                            onClick={() => router.push("/products/new")}
                        >
                            + Add Product
                        </Button>

                    </div>
                </div>

                {/* Search */}
                <div className="mb-4 max-w-sm">
                    <Input
                        placeholder="Search by name, brand or category"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                {/* Table */}
                <div className="bg-white text-black rounded-lg shadow-md overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-200">
                            <tr>
                                <th className="p-3 text-left">Product ID</th>
                                <th className="p-3 text-left">Product Name</th>
                                <th className="p-3 text-left">Category</th>
                                <th className="p-3 text-left">Brand</th>
                                <th className="p-3 text-left">Variants</th>
                                <th className="p-3 text-left">Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {loading && (
                                <tr>
                                    <td colSpan={6} className="p-6 text-center">
                                        Loading products…
                                    </td>
                                </tr>
                            )}

                            {!loading && filteredProducts.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="p-6 text-center text-gray-500">
                                        No products found
                                    </td>
                                </tr>
                            )}

                            {filteredProducts.map((p) => (
                                <tr
                                    key={p.id}
                                    className="border-t hover:bg-gray-50"
                                >
                                    <td className="p-3 text-sm text-gray-600">
                                        {p.id}
                                    </td>
                                    <td className="p-3 font-medium cursor-pointer" onClick={() => router.push(`/products/${p.id}`)}>{p.name}</td>
                                    <td className="p-3">{p.category}</td>
                                    <td className="p-3">{p.brand}</td>
                                    <td className="p-3">{p.variant_count}</td>
                                    <td className="p-3">
                                        <Button
                                            size="sm"
                                            variant="destructive"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setDeleteProduct(p);
                                            }}
                                        >
                                            Delete
                                        </Button>
                                        </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </main>
            {deleteProduct && (
                <AlertDialog open onOpenChange={() => setDeleteProduct(null)}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Delete Product?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This will permanently delete the product and all its variants.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                className="bg-red-600"
                                onClick={async () => {
                                    const res = await fetch(`/api/products/${deleteProduct.id}`, {
                                        method: "DELETE",
                                        headers: {
                                            Authorization: `Bearer ${token}`,
                                        },
                                    });

                                    const data = await res.json();

                                    if (!res.ok) {
                                        notify(Notification.FAILURE, data.error);
                                        return;
                                    }

                                    notify(Notification.SUCCESS, "Product deleted");
                                    setProducts((prev) =>
                                        prev.filter((p) => p.id !== deleteProduct.id)
                                    );
                                    setDeleteProduct(null);
                                }}
                            >
                                Delete
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}

        </div>
    );
}
