"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { notify, Notification } from "@/utils/notify";
import { useUserStore } from "@/utils/store/userStore";
import AdminModal from "@/components/AdminModal";
import DeleteAdminDialog from "@/components/DeleteAdminDialog";
import { Button } from "@/components/ui/button";

export default function ManageAdminsPage() {
  const [admins, setAdmins] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<any | null>(null);
  const [deleteAdmin, setDeleteAdmin] = useState<any | null>(null);

  const token = useUserStore((s) => s.token);

  async function loadAdmins() {
      const res = await fetch("/api/admin-user", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        notify(Notification.FAILURE, data.error);
        return;
      }

      setAdmins(data.users);
    }

  useEffect(() => {
    if (!token) return;
    loadAdmins();
  }, [token]);


  return (
    <div className="flex min-h-screen bg-gradient-to-r from-[#16463B] via-[#317A45] to-[#4CAF50]">
      <Sidebar />

      <main className="flex-1 p-8 text-white">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Manage Admin Users</h1>

          <Button
            onClick={() => {
              setEditingAdmin(null);
              setShowModal(true);
            }}
            className="bg-white text-[#16463B]"
          >
            + Add Admin User
          </Button>
        </div>

        {/* Table */}
        <table className="w-full bg-white text-black rounded-lg overflow-hidden">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">Username</th>
              <th className="p-3 text-left">Role</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>

          <tbody>
            {admins.map((u: any) => (
              <tr key={u.id} className="border-t">
                <td className="p-3">{u.name}</td>
                <td className="p-3">{u.email}</td>
                <td className="p-3">{u.username}</td>
                <td className="p-3">{u.admin_roles?.name}</td>

                <td className="p-3 flex gap-3">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditingAdmin(u);
                      setShowModal(true);
                    }}
                  >
                    Edit
                  </Button>

                  {u.admin_roles?.name !== "Master Admin" && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => setDeleteAdmin(u)}
                    >
                      Delete
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* ADD / EDIT MODAL */}
        {showModal && (
          <AdminModal
            admin={editingAdmin}
            onClose={() => setShowModal(false)}
            onSuccess={() => {
              setShowModal(false);
              loadAdmins();
            }}
          />
        )}

        {/* DELETE CONFIRMATION */}
        {deleteAdmin && (
          <DeleteAdminDialog
            admin={deleteAdmin}
            onClose={() => setDeleteAdmin(null)}
            onSuccess={() => {
              setDeleteAdmin(null);
              loadAdmins();
            }}
          />
        )}
      </main>
    </div>
  );
}
