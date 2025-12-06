"use client";

import { Sidebar } from "@/components/sidebar";
import { useUserStore } from "@/utils/store/userStore";

export default function HomePage() {
  const user = useUserStore((s) => s.user);


  return (
    <div className="flex min-h-screen bg-gradient-to-r from-[#16463B] via-[#317A45] to-[#4CAF50]">
      <Sidebar />

      <main className="flex-1 p-10 text-white">
        <h2 className="text-3xl font-bold mb-4">
          Welcome, {user?.name || "Admin"} 
        </h2>

        <p className="text-lg opacity-90">
          This is your admin dashboard. Use the sidebar to manage users, products, and orders.
        </p>
      </main>
    </div>
  );
}
