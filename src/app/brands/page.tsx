"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { notify, Notification } from "@/utils/notify";
import { useUserStore } from "@/utils/store/userStore";
import BrandModal from "@/components/BrandModal";
import DeleteBrandDialog from "./deleteBrand";
import type { Brand } from "@/types/brand";


export default function BrandsPage() {
    const [brands, setBrands] = useState<Brand[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
    const [deleteBrand, setDeleteBrand] = useState<Brand | null>(null);

    const token = useUserStore((s) => s.token);

    async function loadBrands() {
        if (!token) return;

        setLoading(true);

        const res = await fetch("/api/brands", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        const data = await res.json();
        console.log(data);

        if (!res.ok) {
            notify(Notification.FAILURE, data.error);
            setLoading(false);
            return;
        }

        setBrands(data.brands);
        setLoading(false);
    }

    useEffect(() => {
        loadBrands();
    }, [token]);

    return (
        <div className="flex h-screen bg-gradient-to-r from-[#16463B] via-[#317A45] to-[#4CAF50]">
            <Sidebar />

            <main className="flex-1 p-8 text-white overflow-y-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold">Brands</h1>

                    <Button
                        className="bg-white text-[#16463B]"
                        onClick={() => {
                            setEditingBrand(null);
                            setShowModal(true);
                        }}
                    >
                        + Add Brand
                    </Button>
                </div>

                {/* Table */}
                <div className="bg-white text-black rounded-lg overflow-hidden shadow-md">
                    <table className="w-full">
                        <thead className="bg-gray-200">
                            <tr>
                                <th className="p-3 text-left">Brand ID</th>
                                <th className="p-3 text-left">Logo</th>
                                <th className="p-3 text-left">Brand Name</th>
                                <th className="p-3 text-left">Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {loading && (
                                <tr>
                                    <td colSpan={4} className="p-6 text-center">
                                        Loading brands…
                                    </td>
                                </tr>
                            )}

                            {!loading && brands.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="p-6 text-center text-gray-500">
                                        No brands found
                                    </td>
                                </tr>
                            )}

                            {brands.map((brand) => (
                                <tr key={brand.id} className="border-t hover:bg-gray-50">
                                    <td className="p-3 text-sm text-gray-600">
                                        {brand.id}
                                    </td>

                                    <td className="p-3">
                                        {brand.logo_url ? (
                                            <img
                                                src={brand.logo_url}
                                                alt={brand.name}
                                                className="h-10 w-10 object-contain"
                                            />
                                        ) : (
                                            <span className="text-gray-400">No logo</span>
                                        )}
                                    </td>

                                    <td className="p-3 font-medium">{brand.name}</td>

                                    <td className="p-3 flex gap-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => {
                                                setEditingBrand(brand);
                                                setShowModal(true);
                                            }}
                                        >
                                            Edit
                                        </Button>

                                        <Button
                                            size="sm"
                                            variant="destructive"
                                            onClick={() => setDeleteBrand(brand)}
                                        >
                                            Delete
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Add / Edit Modal */}
                {showModal && (
                    <BrandModal
                        brand={editingBrand}
                        onClose={() => setShowModal(false)}
                        onSuccess={() => {
                            setShowModal(false);
                            loadBrands();
                        }}
                    />
                )}

                {deleteBrand && (
                    <DeleteBrandDialog
                        brand={deleteBrand}
                        onClose={() => setDeleteBrand(null)}
                        onSuccess={() => {
                            setDeleteBrand(null);
                            loadBrands();
                        }}
                    />
                )}

            </main>
        </div>
    );
}
