"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { useUserStore } from "@/utils/store/userStore";
import { notify, Notification } from "@/utils/notify";
import type { Brand } from "@/types/brand";
import type { ProductCategory } from "@/types/productCategory";
import MediaPickerDialog from "@/components/MediaPickerDialog";
import { useRouter } from "next/navigation";

export default function ProductDetailPage() {
    const { id } = useParams();
    const isNew = id === "new";
    const router = useRouter();
    const token = useUserStore((s) => s.token);

    const [product, setProduct] = useState<any>(null);
    const [editMode, setEditMode] = useState(false);
    const [loading, setLoading] = useState(true);
    const [brands, setBrands] = useState<Brand[]>([]);
    const [categories, setCategories] = useState<ProductCategory[]>([]);
    const [showMediaPicker, setShowMediaPicker] = useState(false);

    useEffect(() => {
        if (!token) return;

        async function load() {
            // ✅ Always load brands & categories
            const [bRes, cRes] = await Promise.all([
                fetch("/api/brands", {
                    headers: { Authorization: `Bearer ${token}` },
                }),
                fetch("/api/product-categories", {
                    headers: { Authorization: `Bearer ${token}` },
                }),
            ]);

            const brandsData = await bRes.json();
            const categoriesData = await cRes.json();

            setBrands(brandsData.brands || []);
            setCategories(categoriesData.categories || []);

            // ✅ NEW PRODUCT MODE
            if (isNew) {
                setProduct({
                    name: "",
                    description: "",
                    brand_id: "",
                    product_category_id: "",
                    productImages: [],
                    ProductVariants: [
                        {
                            pvr_id: crypto.randomUUID(),
                            name: "",
                            price: 0,
                            isNew: true,
                        },
                    ],
                });
                setEditMode(true);
                setLoading(false);
                return;
            }

            // ✅ EXISTING PRODUCT
            const res = await fetch(`/api/products/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const data = await res.json();

            if (!res.ok) {
                notify(Notification.FAILURE, data.error);
                return;
            }

            setProduct(data.product);
            setLoading(false);
        }

        load();
    }, [token, id, isNew]);


    if (loading) {
        return <div className="p-8">Loading...</div>;
    }

    function updateVariant(id: string, field: string, value: any) {
        setProduct({
            ...product,
            ProductVariants: product.ProductVariants.map((v: any) =>
                v.pvr_id === id ? { ...v, [field]: value } : v
            ),
        });
    }

    async function saveVariant(v: any) {
        const url = v.isNew
            ? "/api/product-variants"
            : `/api/product-variants/${v.pvr_id}`;

        const method = v.isNew ? "POST" : "PATCH";

        const res = await fetch(url, {
            method,
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                product_id: product.id,
                name: v.name,
                price: v.price
            }),
        });

        if (!res.ok) {
            notify(Notification.FAILURE, "Failed to save variant");
            return;
        }

        notify(Notification.SUCCESS, "Variant saved");

        // refresh product
        const refreshed = await fetch(`/api/products/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
        }).then((r) => r.json());

        setProduct(refreshed.product);
    }


    async function deleteVariant(pvr_id: string) {
        await fetch(`/api/product-variants/${pvr_id}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        setProduct({
            ...product,
            ProductVariants: product.ProductVariants.filter(
                (v: any) => v.pvr_id !== pvr_id
            ),
        });
    }


    async function saveProductCore() {
        const url = isNew ? "/api/products" : `/api/products/${id}`;
        const method = isNew ? "POST" : "PUT";

        const res = await fetch(url, {
            method,
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                name: product.name,
                description: product.description,
                brand_id: product.brand_id,
                product_category_id: product.product_category_id,
            }),
        });

        const data = await res.json();

        if (!res.ok) {
            notify(Notification.FAILURE, data.error);
            return;
        }

        notify(Notification.SUCCESS, isNew ? "Product created" : "Product updated");
        if (isNew) {
            router.replace(`/products/${data.product.id}`);
        } else {
            const refreshed = await fetch(`/api/products/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            }).then((r) => r.json());

            setProduct(refreshed.product);
            setEditMode(false);
        }
    }


    async function deleteImage(imageId: string) {
        await fetch(`/api/product-images/${imageId}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        setProduct({
            ...product,
            productImages: product.productImages.filter(
                (i: any) => i.id !== imageId
            ),
        });
    }

    function moveImage(index: number, direction: "up" | "down") {
        const images = [...product.productImages];
        const target = direction === "up" ? index - 1 : index + 1;

        if (target < 0 || target >= images.length) return;

        [images[index], images[target]] = [images[target], images[index]];

        setProduct({ ...product, productImages: images });
    }

    async function saveImagePriorities() {
        await Promise.all(
            product.productImages.map((img: any, idx: number) =>
                fetch("/api/product-images/reorder", {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        image_id: img.id,
                        new_priority: idx + 1,
                    }),
                })
            )
        );

        notify(Notification.SUCCESS, "Image order updated");
    }

    function LockedNotice() {
        return (
            <div className="mb-4 rounded-lg border border-yellow-300 bg-yellow-50 p-4 text-sm text-yellow-900">
                <p className="font-medium">Complete product details first</p>
                <p>
                    Please save the basic product information. Images and variants will be
                    unlocked after the product is created.
                </p>
            </div>
        );
    }


    return (
        <div className="flex h-screen bg-gradient-to-r from-[#16463B] via-[#317A45] to-[#4CAF50]">
            <Sidebar />

            <main className="flex-1 p-8 text-white overflow-y-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    {editMode ? (
                        <Input
                            value={product.name}
                            className="text-3xl font-bold bg-white text-black"
                            onChange={(e) =>
                                setProduct({ ...product, name: e.target.value })
                            }
                        />
                    ) : (
                        <h1 className="text-3xl font-bold">{product.name}</h1>
                    )}

                    <div className="flex gap-2">
                        {editMode && (
                            <Button
                                className="bg-[#4CAF50] text-white"
                                onClick={saveProductCore}
                            >
                                Save
                            </Button>
                        )}

                        <Button
                            variant="outline"
                            className="bg-white text-[#16463B]"
                            onClick={() => setEditMode(!editMode)}
                        >
                            {editMode ? "Cancel" : "Edit"}
                        </Button>
                    </div>

                </div>

                {/* Description */}
                <div className="mb-6">
                    <label className="block mb-2 font-medium">Description</label>
                    <Textarea
                        value={product.description || ""}
                        disabled={!editMode}
                        className="bg-white text-black"
                        onChange={(e) =>
                            setProduct({ ...product, description: e.target.value })
                        }
                    />
                </div>

                {/* Meta fields */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div>
                        <label className="block mb-1 font-medium">Category</label>

                        {editMode ? (
                            <select
                                className="w-full p-2 rounded bg-white text-black"
                                value={product.product_category_id}
                                onChange={(e) =>
                                    setProduct({ ...product, product_category_id: e.target.value })
                                }
                            >
                                <option value="">Select category</option>
                                {categories.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.name}
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <Input
                                disabled
                                value={product.ProductCategories?.name || ""}
                                className="bg-white text-black"
                            />
                        )}

                    </div>

                    <div>
                        <label className="block mb-1 font-medium">Brand</label>

                        {editMode ? (
                            <select
                                className="w-full p-2 rounded bg-white text-black"
                                value={product.brand_id}
                                onChange={(e) =>
                                    setProduct({ ...product, brand_id: e.target.value })
                                }
                            >
                                <option value="">Select brand</option>
                                {brands.map((b) => (
                                    <option key={b.id} value={b.id}>
                                        {b.name}
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <Input
                                disabled
                                value={product.Brands?.name || ""}
                                className="bg-white text-black"
                            />
                        )}

                    </div>
                </div>

                <div className="mb-8">
                    <h2 className="text-xl font-semibold mb-3">Product Images</h2>
                    {isNew && <LockedNotice />}

                    {!isNew && editMode && (
                        <>
                            <Button
                                variant="outline"
                                className="mt-4 mb-6 bg-white text-[#16463B]"
                                onClick={() => setShowMediaPicker(true)}
                            >
                                + Add Image
                            </Button>

                            <Button
                                variant="outline"
                                className="mt-4 mb-6 ml-4 bg-white text-[#16463B]"
                                onClick={saveImagePriorities}
                            >
                                Save Image Order
                            </Button>
                        </>
                    )}
                    <div className="flex gap-4 overflow-x-auto pb-2">
                        {product.productImages?.length === 0 && (
                            <p className="text-gray-300">No images</p>
                        )}

                        {product.productImages?.map((img: any, idx: number) => (
                            <div className="relative min-w-[160px] h-[160px] bg-white rounded-lg p-2"
                                key={img.id}>
                                <img
                                    src={img.image_url}
                                    className="max-h-full max-w-full object-contain"
                                />

                                {editMode && (
                                    <div className="absolute top-2 right-2 flex gap-1 text-black">
                                        <Button size="icon" variant="outline" onClick={() => moveImage(idx, "up")}>↑</Button>
                                        <Button size="icon" variant="outline" onClick={() => moveImage(idx, "down")}>↓</Button>
                                        <Button size="icon" variant="destructive" onClick={() => deleteImage(img.id)}>✕</Button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <h2 className="text-xl font-semibold mb-3">Variants</h2>
                    {isNew && <LockedNotice />}
                    {!isNew && editMode && (
                        <Button
                            variant="outline"
                            className="mb-6 bg-white text-[#16463B]"
                            onClick={() =>
                                setProduct({
                                    ...product,
                                    ProductVariants: [
                                        ...product.ProductVariants,
                                        { pvr_id: crypto.randomUUID(), name: "", price: 0, isNew: true }
                                    ],
                                })
                            }
                        >
                            + Add Variant
                        </Button>
                    )}
                    {!isNew && <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {product.ProductVariants?.length === 0 && (
                            <p className="text-gray-300">No variants</p>
                        )}

                        {product.ProductVariants?.map((v: any) => (
                            <Card className="p-4 bg-white text-black"
                                key={v.pvr_id}>
                                {editMode ? (
                                    <>
                                        <div className="space-y-2">
                                            <div>
                                                <label className="block text-sm font-medium mb-1">Variant Name</label>
                                                <Input
                                                    value={v.name}
                                                    onChange={(e) => updateVariant(v.pvr_id, "name", e.target.value)}
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium mb-1">Price</label>
                                                <Input
                                                    type="number"
                                                    value={v.price}
                                                    onChange={(e) => updateVariant(v.pvr_id, "price", e.target.value)}
                                                />
                                            </div>
                                        </div>
                                        <Button
                                            onClick={() => saveVariant(v)}
                                            className="bg-[#4CAF50] text-white"
                                        >
                                            Save
                                        </Button>

                                        <Button
                                            variant="destructive"
                                            disabled={product.ProductVariants.length === 1}
                                            onClick={() => deleteVariant(v.pvr_id)}
                                        >
                                            Delete
                                        </Button>

                                    </>
                                ) : (
                                    <>
                                        <h3 className="font-semibold">{v.name}</h3>
                                        <p>Price: ₹{v.price}</p>
                                    </>
                                )}
                            </Card>

                        ))}
                    </div>}
                </div>
            </main>
            <MediaPickerDialog
                bucket="product-images"
                open={showMediaPicker}
                onClose={() => setShowMediaPicker(false)}
                onSelect={async (url) => {
                    const res = await fetch("/api/product-images", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify({
                            product_id: product.id,
                            image_url: url,
                        }),
                    });

                    if (!res.ok) {
                        notify(Notification.FAILURE, "Failed to add image");
                        return;
                    }

                    // reload product images
                    const refreshed = await fetch(`/api/products/${id}`, {
                        headers: { Authorization: `Bearer ${token}` },
                    }).then((r) => r.json());

                    setProduct(refreshed.product);
                    setShowMediaPicker(false);
                }}
            />

        </div>
    );
}
