"use client";

import { useEffect, useState, useMemo } from "react";
import { Sidebar } from "@/components/sidebar";
import { notify, Notification } from "@/utils/notify";
import { useUserStore } from "@/utils/store/userStore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { AppUser } from "@/types/AppUser";

export default function UsersPage() {
    const [users, setUsers] = useState<AppUser[]>([]);
    const [loading, setLoading] = useState(true);

    const token = useUserStore((s) => s.token);

    useEffect(() => {
        if (!token) return;

        async function loadUsers() {
            setLoading(true);

            const res = await fetch("/api/users", {
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

            setUsers(data.users);
            setLoading(false);
        }

        loadUsers();
    }, [token]);

    const [search, setSearch] = useState("");
    const [filterVerified, setFilterVerified] = useState(false);
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);

    const filteredUsers = useMemo(() => {
        const term = search.toLowerCase().trim();

        return users.filter((u) => {
            const matchesSearch =
                u.name.toLowerCase().includes(term) ||
                u.email.toLowerCase().includes(term) ||
                (u.location?.toLowerCase().includes(term) ?? false);

            const matchesVerified = filterVerified ? u.email_verified : true;

            return matchesSearch && matchesVerified;
        });
    }, [users, search, filterVerified]);

    const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));

    const paginatedUsers = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filteredUsers.slice(start, start + pageSize);
    }, [filteredUsers, currentPage, pageSize]);

    useEffect(() => {
        setCurrentPage(1);
    }, [search, filterVerified, pageSize]);

    function exportToCSV() {
        if (paginatedUsers.length === 0) {
            notify(Notification.FAILURE, "No users to export");
            return;
        }

        const headers = [
            "Name",
            "Email",
            "Phone",
            "Location",
            "GSTIN",
            "Email Verified",
            "Joined",
        ];

        function escapeCSV(value: string | number | boolean) {
            const str = String(value ?? "");
            const escaped = str.replace(/"/g, '""'); // escape quotes
            return `"${escaped}"`; // wrap in quotes to protect commas
        }

        const rows = paginatedUsers.map((u) => [
            escapeCSV(u.name),
            escapeCSV(u.email),
            escapeCSV(u.phone || ""),
            escapeCSV(u.location || ""),
            escapeCSV(u.gstin || ""),
            escapeCSV(u.email_verified ? "Yes" : "No"),
            escapeCSV(new Date(u.created_at).toLocaleDateString()),
        ]);

        const csvContent =
            [headers, ...rows].map((r) => r.join(",")).join("\n");

        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = "users.csv";
        a.click();

        URL.revokeObjectURL(url);
    }

    return (
        <div className="flex min-h-screen bg-gradient-to-r from-[#16463B] via-[#317A45] to-[#4CAF50]">
            <Sidebar />

            <main className="flex-1 p-8 text-white">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold">Users</h1>
                </div>

                <div className="flex flex-wrap gap-4 items-center bg-white p-4 rounded-lg mb-4 text-black">
                    {/* Search */}
                    <Input
                        placeholder="Search by name, email or location..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-72"
                    />

                    {/* Verified Only */}
                    <div className="flex items-center gap-2">
                        <Checkbox
                            checked={filterVerified}
                            onCheckedChange={(v) => setFilterVerified(Boolean(v))}
                        />
                        <span>Verified only</span>
                    </div>

                    {/* Page Size */}
                    <Select
                        value={String(pageSize)}
                        onValueChange={(v) => setPageSize(Number(v))}
                    >
                        <SelectTrigger className="w-28">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="10">10 rows</SelectItem>
                            <SelectItem value="25">25 rows</SelectItem>
                            <SelectItem value="50">50 rows</SelectItem>
                            <SelectItem value="100">100 rows</SelectItem>
                        </SelectContent>
                    </Select>

                    {/* CSV Export */}
                    <Button onClick={exportToCSV}>Export CSV</Button>
                </div>

                <div className="bg-white text-black rounded-lg overflow-hidden shadow-md">
                    <table className="w-full">
                        <thead className="bg-gray-200">
                            <tr>
                                <th className="p-3 text-left">Name</th>
                                <th className="p-3 text-left">Email</th>
                                <th className="p-3 text-left">Phone</th>
                                <th className="p-3 text-left">Location</th>
                                <th className="p-3 text-left">GSTIN</th>
                                <th className="p-3 text-left">Email Verified</th>
                                <th className="p-3 text-left">Joined</th>
                            </tr>
                        </thead>

                        <tbody>
                            {loading && (
                                <tr>
                                    <td colSpan={7} className="p-6 text-center">
                                        Loading users...
                                    </td>
                                </tr>
                            )}

                            {!loading && paginatedUsers.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="p-6 text-center text-gray-500">
                                        No users found
                                    </td>
                                </tr>
                            )}

                            {paginatedUsers.map((user) => (
                                <tr key={user.id} className="border-t hover:bg-gray-50">
                                    <td className="p-3">{user.name}</td>
                                    <td className="p-3">{user.email}</td>
                                    <td className="p-3">{user.phone || "-"}</td>
                                    <td className="p-3">{user.location || "-"}</td>
                                    <td className="p-3">{user.gstin || "-"}</td>
                                    <td className="p-3">
                                        {user.email_verified ? (
                                            <Badge className="bg-green-600">Verified</Badge>
                                        ) : (
                                            <Badge variant="destructive">Not Verified</Badge>
                                        )}
                                    </td>
                                    <td className="p-3">
                                        {new Date(user.created_at).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="flex justify-between items-center mt-4 text-white">
                    <span>
                        Page {currentPage} of {totalPages}
                    </span>

                    <div className="flex gap-2">
                        <Button
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage((p) => p - 1)}
                        >
                            Previous
                        </Button>

                        <Button
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage((p) => p + 1)}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            </main>
        </div>
    );
}