"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { notify, Notification } from "@/utils/notify";
import { useUserStore } from "@/utils/store/userStore";
import MediaPickerDialog from "@/components/MediaPickerDialog";

interface ProductRow {
    id: string;
    name: string;
    brand: string;
    category: string;
}

export default function BulkImageUploadPage() {
    const token = useUserStore((s) => s.token);

    const [products, setProducts] = useState<ProductRow[]>([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);

    const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
    const [selectedImages, setSelectedImages] = useState<string[]>([]);
    const [mediaOpen, setMediaOpen] = useState(false);
    const [applying, setApplying] = useState(false);

    // pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    useEffect(() => {
        if (!token) return;

        fetch("/api/products", {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((r) => r.json())
            .then((d) => {
                setProducts(d.products || []);
                setLoading(false);
            });
    }, [token]);

    // ----------------------------
    // Filtering + Pagination
    // ----------------------------
    const filtered = products.filter((p) =>
        `${p.name} ${p.brand} ${p.category}`
            .toLowerCase()
            .includes(search.toLowerCase())
    );

    const filteredProductIds = filtered.map((p) => p.id);


    const allFilteredSelected =
        filteredProductIds.length > 0 &&
        filteredProductIds.every((id) => selectedProductIds.includes(id));

    const someFilteredSelected =
        filteredProductIds.some((id) => selectedProductIds.includes(id)) &&
        !allFilteredSelected;


    const totalRows = filtered.length;
    const totalPages = Math.max(1, Math.ceil(totalRows / rowsPerPage));
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const pageProducts = filtered.slice(startIndex, endIndex);

    const from = totalRows === 0 ? 0 : startIndex + 1;
    const to = Math.min(endIndex, totalRows);

    // ----------------------------
    // Apply Images
    // ----------------------------
    async function applyImages() {
        if (
            !token ||
            selectedImages.length === 0 ||
            selectedProductIds.length === 0
        )
            return;

        setApplying(true);

        try {
            const res = await fetch("/api/product-images/bulk", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    product_ids: selectedProductIds,
                    image_urls: selectedImages,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                notify(Notification.FAILURE, data.error);
                setApplying(false);
                return;
            }

            notify(
                Notification.SUCCESS,
                `Added ${data.inserted} images to ${selectedProductIds.length} products`
            );

            setSelectedImages([]);
            setSelectedProductIds([]);
        } catch {
            notify(Notification.FAILURE, "Failed to apply images");
        }

        setApplying(false);
    }


    return (
        <div className="flex h-screen bg-gradient-to-r from-[#16463B] via-[#317A45] to-[#4CAF50]">
            <Sidebar />

            <main className="flex-1 p-8 text-white overflow-y-auto">
                {/* ================= HEADER ================= */}
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold">Bulk Upload Images</h1>

                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            className="bg-white text-[#16463B]"
                            onClick={() => setMediaOpen(true)}
                        >
                            Select Images
                        </Button>

                        <Button
                            className="bg-white text-[#16463B]"
                            disabled={
                                applying ||
                                selectedImages.length === 0 ||
                                selectedProductIds.length === 0
                            }
                            onClick={applyImages}
                        >
                            {applying ? "Applying..." : "Apply Images"}
                        </Button>
                    </div>
                </div>

                {/* ================= INFO ================= */}
                <Card className="p-4 mb-6 bg-white text-black">
                    <p className="text-sm">
                        Select images once and apply them to multiple products. Images will
                        be appended to each product’s existing images.
                    </p>
                </Card>

                {/* ================= SEARCH ================= */}
                <div className="mb-4 max-w-sm">
                    <Input
                        placeholder="Search products"
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setCurrentPage(1);
                        }}
                    />
                </div>

                <div className="flex gap-12 py-4">
                    {selectedProductIds.length > 0 && (
                        <div className="mb-2 text-sm text-white">
                            <span className="font-medium">
                                {selectedProductIds.length}
                            </span>{" "}
                            product{selectedProductIds.length > 1 ? "s" : ""} selected
                        </div>
                    )}

                    {selectedProductIds.length > 0 && (
                        <Button
                            size="sm"
                            variant="outline"
                            className="ml-2 bg-white text-[#16463B]"
                            onClick={() => setSelectedProductIds([])}
                        >
                            Clear selection
                        </Button>
                    )}
                </div>

                {/* ================= TABLE ================= */}
                <div className="bg-white text-black rounded-lg shadow-md overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-200">
                            <tr>
                                <th className="p-3">
                                    <Checkbox
                                        className="
                                            border border-black
                                            data-[state=checked]:border-black
                                            data-[state=indeterminate]:border-black
                                        "
                                        checked={
                                            allFilteredSelected
                                                ? true
                                                : someFilteredSelected
                                                    ? "indeterminate"
                                                    : false
                                        }
                                        onCheckedChange={(checked) => {
                                            setSelectedProductIds((prev) => {
                                                if (checked === true) {
                                                    // Select ALL filtered products
                                                    const newIds = filteredProductIds.filter(
                                                        (id) => !prev.includes(id)
                                                    );
                                                    return [...prev, ...newIds];
                                                }

                                                // checked === false OR "indeterminate"
                                                // → clear all filtered products
                                                return prev.filter(
                                                    (id) => !filteredProductIds.includes(id)
                                                );
                                            });
                                        }}
                                    />
                                </th>
                                <th className="p-3 text-left">Product Name</th>
                                <th className="p-3 text-left">Category</th>
                                <th className="p-3 text-left">Brand</th>
                            </tr>
                        </thead>

                        <tbody>
                            {loading && (
                                <tr>
                                    <td colSpan={4} className="p-6 text-center">
                                        Loading products…
                                    </td>
                                </tr>
                            )}

                            {!loading && pageProducts.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="p-6 text-center text-gray-500">
                                        No products found
                                    </td>
                                </tr>
                            )}

                            {pageProducts.map((p) => (
                                <tr key={p.id} className="border-t hover:bg-gray-50">
                                    <td className="p-3">
                                        <Checkbox
                                            checked={selectedProductIds.includes(p.id)}
                                            onCheckedChange={(checked) =>
                                                setSelectedProductIds((prev) =>
                                                    checked
                                                        ? [...prev, p.id]
                                                        : prev.filter((id) => id !== p.id)
                                                )
                                            }
                                        />
                                    </td>
                                    <td className="p-3 font-medium">{p.name}</td>
                                    <td className="p-3">{p.category}</td>
                                    <td className="p-3">{p.brand}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* ================= PAGINATION ================= */}
                <div className="flex items-center justify-between mt-4 px-2 text-sm text-white">
                    <div className="flex items-center gap-2">
                        <span>Rows per page</span>
                        <select
                            className="rounded-md border bg-white text-black px-2 py-1"
                            value={rowsPerPage}
                            onChange={(e) => {
                                setRowsPerPage(Number(e.target.value));
                                setCurrentPage(1);
                            }}
                        >
                            {[5, 10, 20, 50].map((n) => (
                                <option key={n} value={n}>
                                    {n}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <span className="font-medium">{from}-{to}</span> of{" "}
                        <span className="font-medium">{totalRows}</span>
                    </div>

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
            </main>

            {/* ================= MEDIA PICKER ================= */}
            <MediaPickerDialog
                bucket="product-images"
                open={mediaOpen}
                onClose={() => setMediaOpen(false)}
                onSelectMultiple={(urls) => setSelectedImages(urls)}
            />
        </div>
    );
}
