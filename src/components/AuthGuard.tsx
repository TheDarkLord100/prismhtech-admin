"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/utils/store/userStore";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const isAuthenticated = useUserStore((s) => s.isAuthenticated);
  const hasHydrated = useUserStore((s) => s.hasHydrated);
  useEffect(() => {
    if (!hasHydrated) {
      return;
    }

    if (!isAuthenticated) {
      router.replace("/login?error=unauthorized");
    }
  }, [isAuthenticated, hasHydrated, router]);

  return <>{children}</>;
}
