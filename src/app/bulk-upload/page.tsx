"use client";

import { useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { notify, Notification } from "@/utils/notify";
import { useUserStore } from "@/utils/store/userStore";
import { downloadCSV, PRODUCTS_TEMPLATE, VARIANTS_TEMPLATE } from "@/utils/downloadCSV";

interface ValidationError {
    file: string;
    row: number;
    message: string;
}

export default function BulkProductUploadPage() {
    const token = useUserStore((s) => s.token);

    const [productsFile, setProductsFile] = useState<File | null>(null);
    const [variantsFile, setVariantsFile] = useState<File | null>(null);

    const [loading, setLoading] = useState(false);
    const [preview, setPreview] = useState<any[]>([]);
    const [errors, setErrors] = useState<ValidationError[]>([]);
    const [summary, setSummary] = useState<{ products: number; variants: number } | null>(null);
    const [expandedProduct, setExpandedProduct] = useState<string | null>(null);


    // ------------------------
    // VALIDATE CSVs
    // ------------------------
    async function validateFiles() {
        if (!productsFile || !variantsFile) {
            notify(Notification.FAILURE, "Both CSV files are required");
            return;
        }

        if (!token) return;

        setLoading(true);
        setErrors([]);
        setPreview([]);
        setSummary(null);

        const formData = new FormData();
        formData.append("productsFile", productsFile);
        formData.append("variantsFile", variantsFile);

        const res = await fetch("/api/products/bulk/validate", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
            },
            body: formData,
        });

        const data = await res.json();
        setLoading(false);

        if (!res.ok || !data.valid) {
            setErrors(data.errors || []);
            notify(Notification.FAILURE, "Validation failed");
            return;
        }

        setPreview(data.preview);
        setSummary(data.summary);
        notify(Notification.SUCCESS, "Validation successful");
    }

    // ------------------------
    // CONFIRM UPLOAD
    // ------------------------
    async function confirmUpload() {
        if (!token || preview.length === 0) return;

        setLoading(true);

        const res = await fetch("/api/products/bulk", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ preview }),
        });

        const data = await res.json();
        setLoading(false);

        if (!res.ok) {
            notify(Notification.FAILURE, data.error);
            return;
        }

        notify(
            Notification.SUCCESS,
            `Uploaded ${data.products_created} products & ${data.variants_created} variants`
        );

        // Reset
        setProductsFile(null);
        setVariantsFile(null);
        setPreview([]);
        setSummary(null);
    }

    return (
        <div className="flex min-h-screen bg-gradient-to-r from-[#16463B] via-[#317A45] to-[#4CAF50]">
            <Sidebar />

            <main className="flex-1 p-8 text-white overflow-y-auto">
                {/* ================= HEADER ================= */}
                <h1 className="text-3xl font-bold mb-6">Bulk Product Upload</h1>

                {/* ================= INFO ================= */}
                <Card className="p-6 mb-8 bg-white text-black space-y-3">
                    <h2 className="text-xl font-semibold">How it works</h2>
                    <ul className="list-disc pl-5 text-sm space-y-1">
                        <li>Upload two CSV files: Products & Variants</li>
                        <li>Brand and Category must already exist</li>
                        <li>Each product must have at least one variant</li>
                        <li>No data is saved until you confirm</li>
                    </ul>

                    <div className="flex gap-3 mt-4">
                        <Button
                            variant="outline"
                            onClick={() => downloadCSV("products_template.csv", PRODUCTS_TEMPLATE)}
                        >
                            Download Products Template
                        </Button>

                        <Button
                            variant="outline"
                            onClick={() => downloadCSV("variants_template.csv", VARIANTS_TEMPLATE)}
                        >
                            Download Variants Template
                        </Button>
                    </div>

                </Card>

                {/* ================= UPLOAD ================= */}
                <Card className="p-6 mb-8 bg-white text-black space-y-4">
                    <h2 className="text-xl font-semibold">Upload CSV Files</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Products CSV */}
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Products CSV
                            </label>
                            <input
                                type="file"
                                accept=".csv"
                                onChange={(e) => setProductsFile(e.target.files?.[0] || null)}
                                className="block w-full text-sm"
                            />
                        </div>

                        {/* Variants CSV */}
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Variants CSV
                            </label>
                            <input
                                type="file"
                                accept=".csv"
                                onChange={(e) => setVariantsFile(e.target.files?.[0] || null)}
                                className="block w-full text-sm"
                            />
                        </div>
                    </div>

                    <Button onClick={validateFiles} disabled={loading}>
                        {loading ? "Validating..." : "Validate Files"}
                    </Button>
                </Card>


                {/* ================= ERRORS ================= */}
                {errors.length > 0 && (
                    <Card className="p-6 mb-8 bg-white text-black">
                        <h2 className="text-xl font-semibold mb-4 text-red-600">Validation Errors</h2>

                        <table className="w-full text-sm border">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="p-2 border">File</th>
                                    <th className="p-2 border">Row</th>
                                    <th className="p-2 border">Message</th>
                                </tr>
                            </thead>
                            <tbody>
                                {errors.map((e, i) => (
                                    <tr key={i}>
                                        <td className="p-2 border">{e.file}</td>
                                        <td className="p-2 border">{e.row}</td>
                                        <td className="p-2 border">{e.message}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </Card>
                )}

                {/* ================= PREVIEW ================= */}
                {preview.length > 0 && (
                    <Card className="p-6 mb-8 bg-white text-black space-y-4">
                        <h2 className="text-xl font-semibold">Preview</h2>

                        {preview.map((p) => {
                            const isOpen = expandedProduct === p.product_key;

                            return (
                                <div
                                    key={p.product_key}
                                    className="border rounded-lg overflow-hidden"
                                >
                                    {/* Product Row */}
                                    <div
                                        className="p-4 cursor-pointer flex justify-between items-center hover:bg-gray-50"
                                        onClick={() =>
                                            setExpandedProduct(isOpen ? null : p.product_key)
                                        }
                                    >
                                        <div>
                                            <p className="font-semibold">{p.name}</p>
                                            <p className="text-sm text-gray-600">
                                                {p.brand} · {p.category}
                                            </p>
                                        </div>

                                        <span className="text-sm text-gray-600">
                                            {p.variants.length} variants
                                        </span>
                                    </div>

                                    {/* Variant Details */}
                                    {isOpen && (
                                        <div className="bg-gray-50 p-4">
                                            <table className="w-full text-sm border">
                                                <thead className="bg-gray-200">
                                                    <tr>
                                                        <th className="p-2 border text-left">Variant</th>
                                                        <th className="p-2 border text-left">Price</th>
                                                        <th className="p-2 border text-left">Quantity</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {p.variants.map((v: any, idx: number) => (
                                                        <tr key={idx}>
                                                            <td className="p-2 border">{v.name}</td>
                                                            <td className="p-2 border">₹{v.price}</td>
                                                            <td className="p-2 border">{v.quantity}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                        {summary && (
                            <p className="font-medium">
                                Total: {summary.products} products, {summary.variants} variants
                            </p>
                        )}

                        <Button onClick={confirmUpload} disabled={loading}>
                            {loading ? "Uploading..." : "Confirm Upload"}
                        </Button>
                    </Card>
                )}

            </main>
        </div>
    );
}
