import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectItem, SelectTrigger, SelectValue, SelectContent } from "@/components/ui/select";
import { notify, Notification } from "@/utils/notify";
import { useUserStore } from "@/utils/store/userStore";
import type { AdminRole } from "@/types/AdminRole";

export default function AdminModal({
  admin,
  onClose,
  onSuccess,
}: {
  admin: any | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const token = useUserStore((s) => s.token);
  const [roles, setRoles] = useState<AdminRole[]>([]);

  const [form, setForm] = useState({
    name: "",
    email: "",
    username: "",
    password: "",
    role_id: "",
  });

  const isEdit = !!admin;

  useEffect(() => {
    if (!token) return;

    async function loadRoles() {
      const res = await fetch("/api/admin-roles", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        notify(Notification.FAILURE, data.error);
        return;
      }

      setRoles(data.roles);
    }

    loadRoles();
  }, [token]);


  useEffect(() => {
    if (admin) {
      setForm({
        name: admin.name,
        email: admin.email,
        username: admin.username,
        password: "",
        role_id: String(admin.role_id),
      });
    }
  }, [admin]);

  async function handleSubmit(e: any) {
    e.preventDefault();

    const url = isEdit
      ? `/api/admin-user/${admin.id}`
      : `/api/admin-user/create`;

    const payload: any = {
      name: form.name,
      role_id: form.role_id,
    };

    // Only include these on CREATE
    if (!isEdit) {
      payload.email = form.email;
      payload.username = form.username;
      payload.password = form.password;
    }

    // On edit, only include password if user typed it
    if (isEdit && form.password) {
      payload.password = form.password;
    }

    const res = await fetch(url, {
      method: isEdit ? "PUT" : "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      notify(Notification.FAILURE, data.error);
      return;
    }

    notify(Notification.SUCCESS, isEdit ? "Admin updated" : "Admin created");
    onSuccess();
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Admin User" : "Add New Admin User"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3">
          <Input
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />

          <Input
            placeholder="Email"
            value={form.email}
            disabled={isEdit}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />

          <Input
            placeholder="Username"
            value={form.username}
            disabled={isEdit}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
          />

          <Input
            type="password"
            placeholder={isEdit ? "New Password (optional)" : "Password"}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />

          <Select
            value={form.role_id}
            onValueChange={(v) => setForm({ ...form, role_id: v })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              {roles.map((role) => (
                <SelectItem key={role.id} value={String(role.id)}>
                  {role.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>

            <Button type="submit">
              {isEdit ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
