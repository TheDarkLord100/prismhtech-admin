"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useUserStore } from "@/utils/store/userStore";

const menu = [
  { name: "Dashboard", href: "/" },
  { name: "Users", href: "/admin/users" },
  { name: "Products", href: "/admin/products" },
  { name: "Orders", href: "/admin/orders" },
];

const superAdminMenu = [
  { name: "Admin Users", href: "/admin-users" },
  { name: "Roles and Permissions", href: "/roles" },
]

export function Sidebar() {

  const user = useUserStore((s) => s.user);

  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/admin-user/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <div className="w-64 h-screen flex flex-col bg-[#FFFFEF] bg-opacity-90 shadow-lg">

      {/* Header / Profile */}
      <div className="p-6 border-b border-gray-300">
        <h1 className="text-xl font-bold text-[#16463B]">Admin Panel</h1>
        <p className="text-sm text-gray-600 mt-1">
          Logged in as <span className="font-semibold">{user?.username}</span>
        </p>
      </div>

      {/* Menu */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {menu.map((item) => {
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "block px-3 py-2 rounded-md text-sm font-medium transition",
                active
                  ? "bg-[#4CAF50] text-white"
                  : "hover:bg-[#e6f4ea] hover:text-[#16463B]"
              )}
            >
              {item.name}
            </Link>
          );
        })}
        {/* Super Admin Menu */}
        {user?.role_id === 1 && superAdminMenu.map((item) => {
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "block px-3 py-2 rounded-md text-sm font-medium transition",
                active
                  ? "bg-[#4CAF50] text-white"
                  : "hover:bg-[#e6f4ea] hover:text-[#16463B]"
              )}
            >
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="w-full rounded-md bg-red-500 text-white py-2 text-sm font-semibold hover:bg-red-600 transition"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
