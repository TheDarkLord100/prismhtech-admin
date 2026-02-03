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
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    useEffect(() => {
        setCurrentPage(1);
    }, [search, rowsPerPage]);


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

    const totalRows = filteredProducts.length;
    const totalPages = Math.max(1, Math.ceil(totalRows / rowsPerPage));

    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;

    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

    const from = totalRows === 0 ? 0 : startIndex + 1;
    const to = Math.min(endIndex, totalRows);

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

                            {paginatedProducts.map((p) => (
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
                    {/* Pagination */}
                    <div className="flex items-center justify-between mt-4 px-2 py-2 text-sm text-black">
                        {/* Rows per page */}
                        <div className="flex items-center gap-2">
                            <span>Rows per page</span>
                            <select
                                className="rounded-md border bg-white text-black px-2 py-1"
                                value={rowsPerPage}
                                onChange={(e) => setRowsPerPage(Number(e.target.value))}
                            >
                                {[5, 10, 20, 50].map((n) => (
                                    <option key={n} value={n}>
                                        {n}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Page info */}
                        <div>
                            Page <span className="font-medium">{currentPage}</span> of{" "}
                            <span className="font-medium">{totalPages}</span>
                        </div>

                        <div className="text-sm">
                            <span className="font-medium">
                                {from}-{to}
                            </span>{" "}
                            of <span className="font-medium">{totalRows}</span>
                        </div>

                        {/* Navigation */}
                        <div className="flex gap-1">
                            <Button
                                size="sm"
                                variant="outline"
                                className="bg-white text-[#16463B]"
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(1)}
                            >
                                First
                            </Button>

                            <Button
                                size="sm"
                                variant="outline"
                                className="bg-white text-[#16463B]"
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            >
                                Prev
                            </Button>

                            <Button
                                size="sm"
                                variant="outline"
                                className="bg-white text-[#16463B]"
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                            >
                                Next
                            </Button>

                            <Button
                                size="sm"
                                variant="outline"
                                className="bg-white text-[#16463B]"
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage(totalPages)}
                            >
                                Last
                            </Button>
                        </div>
                    </div>
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
