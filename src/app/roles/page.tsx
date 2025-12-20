"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { notify, Notification } from "@/utils/notify";
import { useUserStore } from "@/utils/store/userStore";

interface Permission {
    id: number;
    name: string;
    description: string | null;
}

interface Role {
    id: number;
    name: string;
    description: string | null;
    permissions: Permission[];
}

export default function RolesPage() {
    const token = useUserStore((s) => s.token);

    const [roles, setRoles] = useState<Role[]>([]);
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [loading, setLoading] = useState(true);

    // dialog state
    const [open, setOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [editingRole, setEditingRole] = useState<Role | null>(null);

    // form state
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);

    useEffect(() => {
        if (!token) return;

        async function load() {
            const res = await fetch("/api/roles", {
                headers: { Authorization: `Bearer ${token}` },
            });

            const data = await res.json();

            if (!res.ok) {
                notify(Notification.FAILURE, data.error);
                return;
            }

            setRoles(data.roles);
            setPermissions(data.permissions);
            setLoading(false);
        }

        load();
    }, [token]);

    function openCreate() {
        setEditingRole(null);
        setName("");
        setDescription("");
        setSelectedPermissions([]);
        setOpen(true);
    }

    function openEdit(role: Role) {
        setEditingRole(role);
        setName(role.name);
        setDescription(role.description ?? "");
        setSelectedPermissions(role.permissions.map((p) => p.id));
        setOpen(true);
    }

    async function saveRole() {
        const payload = {
            name,
            description,
            permissions: selectedPermissions,
        };

        const url = editingRole
            ? `/api/roles/${editingRole.id}`
            : "/api/roles";

        const method = editingRole ? "PUT" : "POST";

        const res = await fetch(url, {
            method,
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

        notify(
            Notification.SUCCESS,
            editingRole ? "Role updated" : "Role created"
        );

        if (editingRole) {
            setRoles((prev) =>
                prev.map((r) => {
                    if (r.id !== editingRole.id) return r;

                    return {
                        ...r,
                        name,
                        description,
                        permissions: permissions.filter((p) =>
                            selectedPermissions.includes(p.id)
                        ),
                    };
                })
            );
        } else {
            setRoles((prev) => [...prev, data.role]);
        }


        setOpen(false);
    }

    async function deleteRole() {
        if (!editingRole) return;

        const res = await fetch(`/api/roles/${editingRole.id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();

        if (!res.ok) {
            notify(Notification.FAILURE, data.error);
            return;
        }

        notify(Notification.SUCCESS, "Role deleted");
        setRoles((prev) => prev.filter((r) => r.id !== editingRole.id));
        setDeleteOpen(false);
        setEditingRole(null);
    }

    return (
        <div className="flex h-screen bg-gradient-to-r from-[#16463B] via-[#317A45] to-[#4CAF50]">
            <Sidebar />

            <main className="flex-1 p-8 text-white overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold">Roles & Permissions</h1>
                    <Button onClick={openCreate}>Create Role</Button>
                </div>

                <div className="bg-white text-black rounded-lg shadow-md overflow-hidden">
                    <Table>
                        <TableHeader className="bg-gray-200">
                            <TableRow>
                                <TableHead>Role</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Permissions</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {loading && (
                                <TableRow>
                                    <TableCell colSpan={4} className="p-6 text-center">
                                        Loading roles…
                                    </TableCell>
                                </TableRow>
                            )}

                            {!loading && roles.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={4} className="p-6 text-center text-gray-500">
                                        No roles found
                                    </TableCell>
                                </TableRow>
                            )}

                            {roles.map((role) => (
                                <TableRow key={role.id}>
                                    <TableCell className="font-medium">{role.name}</TableCell>
                                    <TableCell>{role.description ?? "—"}</TableCell>
                                    <TableCell className="max-w-[400px]">
                                        <div className="flex flex-wrap gap-1">
                                            {role.permissions.map((p) => (
                                                <Badge key={p.id} variant="secondary">
                                                    {p.name}
                                                </Badge>
                                            ))}
                                        </div>
                                    </TableCell>

                                    <TableCell className="space-x-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => openEdit(role)}
                                        >
                                            Edit
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="destructive"
                                            onClick={() => {
                                                setEditingRole(role);
                                                setDeleteOpen(true);
                                            }}
                                        >
                                            Delete
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                {/* Permissions reference */}
                <div className="mt-10">
                    <h2 className="text-2xl font-semibold text-white mb-4">
                        Permissions Reference
                    </h2>

                    <div className="bg-white text-black rounded-lg shadow-md overflow-hidden">
                        <Table>
                            <TableHeader className="bg-gray-200">
                                <TableRow>
                                    <TableHead className="w-[280px]">Permission</TableHead>
                                    <TableHead>Description</TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {permissions.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={2} className="p-6 text-center text-gray-500">
                                            No permissions found
                                        </TableCell>
                                    </TableRow>
                                )}

                                {permissions.map((p) => (
                                    <TableRow key={p.id} className="hover:bg-gray-50">
                                        <TableCell className="font-medium whitespace-nowrap">
                                            {p.name}
                                        </TableCell>

                                        <TableCell className="text-gray-600 break-words">
                                            {p.description ?? "—"}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>


                {/* Create / Edit dialog */}
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogContent className="max-w-xl">
                        <DialogHeader>
                            <DialogTitle>
                                {editingRole ? "Edit Role" : "Create Role"}
                            </DialogTitle>
                        </DialogHeader>

                        <div className="space-y-4">
                            <Input
                                placeholder="Role name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                            <Textarea
                                placeholder="Role description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />

                            <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto border p-3 rounded">
                                {permissions.map((p) => (
                                    <label key={p.id} className="flex gap-2 text-sm">
                                        <Checkbox
                                            checked={selectedPermissions.includes(p.id)}
                                            onCheckedChange={(checked) =>
                                                setSelectedPermissions((prev) =>
                                                    checked
                                                        ? [...prev, p.id]
                                                        : prev.filter((id) => id !== p.id)
                                                )
                                            }
                                        />
                                        {p.name}
                                    </label>
                                ))}
                            </div>
                        </div>

                        <DialogFooter>
                            <Button onClick={saveRole}>
                                {editingRole ? "Update Role" : "Create Role"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Delete confirmation */}
                <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>
                                Delete role "{editingRole?.name}"?
                            </AlertDialogTitle>
                        </AlertDialogHeader>

                        <AlertDialogFooter>
                            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
                                Cancel
                            </Button>
                            <Button variant="destructive" onClick={deleteRole}>
                                Delete
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </main>
        </div>
    );
}
