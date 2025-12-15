"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { notify, Notification } from "@/utils/notify";
import { useUserStore } from "@/utils/store/userStore";
import CategoryModal from "@/components/CategoryModal"
import DeleteCategoryDialog from "./deleteCategory";
import type { ProductCategory } from "@/types/productCategory";

export default function ProductCategoriesPage() {
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<ProductCategory | null>(null);
  const [toDelete, setToDelete] = useState<ProductCategory | null>(null);

  const token = useUserStore((s) => s.token);

  async function loadCategories() {
    if (!token) return;

    setLoading(true);

    const res = await fetch("/api/product-categories", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();

    if (!res.ok) {
      notify(Notification.FAILURE, data.error);
      setLoading(false);
      return;
    }

    setCategories(data.categories);
    setLoading(false);
  }

  useEffect(() => {
    loadCategories();
  }, [token]);

  return (
    <div className="flex h-screen bg-gradient-to-r from-[#16463B] via-[#317A45] to-[#4CAF50]">
      <Sidebar />

      <main className="flex-1 p-8 text-white overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Product Categories</h1>

          <Button
            className="bg-white text-[#16463B]"
            onClick={() => {
              setEditing(null);
              setShowModal(true);
            }}
          >
            + Add Category
          </Button>
        </div>

        {/* Table */}
        <div className="bg-white text-black rounded-lg shadow-md">
          <table className="w-full">
            <thead className="bg-gray-200">
              <tr>
                <th className="p-3 text-left">ID</th>
                <th className="p-3 text-left">Image</th>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Description</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading && (
                <tr>
                  <td colSpan={5} className="p-6 text-center">
                    Loading categories…
                  </td>
                </tr>
              )}

              {!loading && categories.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-gray-500">
                    No categories found
                  </td>
                </tr>
              )}

              {categories.map((cat) => (
                <tr key={cat.id} className="border-t hover:bg-gray-50">
                  <td className="p-3 text-xs text-gray-500">{cat.id}</td>

                  <td className="p-3">
                    {cat.image_url ? (
                      <img
                        src={cat.image_url}
                        alt={cat.name}
                        className="h-10 w-10 object-contain"
                      />
                    ) : (
                      <span className="text-gray-400">No image</span>
                    )}
                  </td>

                  <td className="p-3 font-medium">{cat.name}</td>

                  <td className="p-3 text-sm text-gray-600">
                    {cat.description || "—"}
                  </td>

                  <td className="p-3 flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditing(cat);
                        setShowModal(true);
                      }}
                    >
                      Edit
                    </Button>

                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => setToDelete(cat)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modals */}
        {showModal && (
          <CategoryModal
            category={editing}
            onClose={() => setShowModal(false)}
            onSuccess={() => {
              setShowModal(false);
              loadCategories();
            }}
          />
        )}

        {toDelete && (
          <DeleteCategoryDialog
            category={toDelete}
            onClose={() => setToDelete(null)}
            onSuccess={() => {
              setToDelete(null);
              loadCategories();
            }}
          />
        )}
      </main>
    </div>
  );
}
