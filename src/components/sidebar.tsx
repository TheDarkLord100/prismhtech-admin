"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useUserStore } from "@/utils/store/userStore";

/**
 * Sidebar menu item definition
 */
type MenuItem = {
  name: string;
  href: string;
  permission?: string; // undefined = visible to all admins
};

/**
 * Single source of truth for sidebar navigation
 */
const menu: MenuItem[] = [
  { name: "Dashboard", href: "/" },

  { name: "Users", href: "/users", permission: "manage_users" },

  { name: "Products", href: "/products", permission: "manage_products" },
  {
    name: "Product Categories",
    href: "/product-categories",
    permission: "manage_categories",
  },
  { name: "Brands", href: "/brands", permission: "manage_brands" },

  { name: "Orders", href: "/orders", permission: "manage_orders" },
  { name: "Payments", href: "/payments", permission: "manage_payments" },

  { name: "Questions", href: "/questions", permission: "manage_questions" },

  { name: "Admin Users", href: "/admin-users", permission: "manage_admins" },
  {
    name: "Roles and Permissions",
    href: "/roles",
    permission: "manage_admins",
  },
  {
    name: "Live Prices", href: "/live-prices"
  }
];

/**
 * Permission helper
 */
function hasPermission(
  userPermissions: string[] | undefined,
  required?: string
) {
  if (!required) return true;
  if (!userPermissions) return false;
  return userPermissions.includes(required);
}

export function Sidebar() {
  const user = useUserStore((s) => s.user);
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    try {
      await fetch("/api/admin-user/logout", { method: "POST" });
    } finally {
      useUserStore.getState().logout();
      router.push("/login");
    }
  }

  return (
    <div className="w-64 h-screen flex flex-col bg-[#FFFFEF] bg-opacity-90 shadow-lg">
      {/* Header */}
      <div className="p-6 border-b border-gray-300">
        <h1 className="text-xl font-bold text-[#16463B]">Admin Panel</h1>
        <p className="text-sm text-gray-600 mt-1">
          Logged in as{" "}
          <span className="font-semibold">
            {user?.username ?? "—"}
          </span>
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {menu
          .filter((item) =>
            hasPermission(user?.permissions, item.permission)
          )
          .map((item) => {
            const active =
              pathname === item.href ||
              pathname.startsWith(item.href + "/");

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
