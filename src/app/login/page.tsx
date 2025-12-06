"use client";

import { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useRouter, useSearchParams } from "next/navigation";
import { notify, Notification } from "@/utils/notify";
import { useUserStore } from "@/utils/store/userStore";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);


  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectedFrom") || "/";
  const { setAuth } = useUserStore();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/admin-user/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        console.log("Login failed:", data.error);
        notify(Notification.FAILURE, data.error || "Login failed");
        setLoading(false);
        return;
      }

      notify(Notification.SUCCESS, "Login successful!");
      console.log("Login successful:", data);
      setAuth(data.user, data.token);
      router.push(redirectTo);

    } catch (error) {
      if (error instanceof Error) {
        console.error("Error during sign in:", error.message);
        notify(Notification.FAILURE, error.message);
      } else {
        console.error("Unexpected error:", error);
        notify(Notification.FAILURE, "Something went wrong during login.");
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    const error = searchParams.get("error");
    if (error === "unauthorized") {
      notify(Notification.FAILURE, "You must log in to continue");
    }
  }, [searchParams]);

  return (
    <div className="bg-gradient-to-r from-[#16463B] via-[#317A45] to-[#4CAF50]">
      <Navbar />
      <main className="flex min-h-screen items-center justify-center px-4">
        <div className="relative w-full max-w-md rounded-2xl bg-[#FFFFEF] p-10 shadow-[0px_0px_25px_5px_rgba(0,0,0,0.5)]">
          {/* Heading */}
          <h1 className="mb-8 text-3xl font-bold text-[#16463B]">Sign in</h1>

          {/* Email */}
          <div className="mb-2">
            <input
              type="text"
              placeholder="Email or username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg bg-[#e0e0db] px-4 py-2 text-base placeholder-gray-500 focus:outline-none"
              required
              disabled={loading}
            />
          </div>

          {/* Password */}
          <div className="mb-2 relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              className="w-full rounded-lg bg-[#e0e0db] px-4 py-2 pr-10 text-base placeholder-gray-500 focus:outline-none"
            />
            <button
              type="button"
              className="absolute right-3 top-2.5 text-[#4CAF50] hover:text-[#9333EA] focus:outline-none"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff size={20} strokeWidth={2.2} />
              ) : (
                <Eye size={20} strokeWidth={2.2} />
              )}
            </button>
          </div>

          {/* Forgot Password */}
          <div className="mb-6 text-left">

          </div>

          {/* Sign in Button */}
          <button
            type="submit"
            onClick={handleLogin}
            disabled={loading}
            className="w-full rounded-lg bg-[#4CAF50] py-3 text-base font-semibold text-white hover:bg-[#9333EA] transition"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </div>
      </main>
      {/* <Footer /> */}
    </div>
  );
}
