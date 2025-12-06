"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function Navbar({ type = "transparent" }: { type?: string }) {
  const [hidden, setHidden] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Hide on scroll down, show on scroll up
  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;

      if (currentY > lastScrollY && currentY > 50) {
        setHidden(true);
      } else {
        setHidden(false);
      }

      setLastScrollY(currentY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <nav
      className={`fixed inset-x-0 top-0 z-50 transition-transform duration-300
        ${
          type !== "transparent"
            ? "bg-gradient-to-r from-[#16463B] via-[#317A45] to-[#4CAF50]"
            : ""
        }
        ${hidden ? "-translate-y-full" : "translate-y-0"}
      `}
    >
      {/* Background blur */}
      <div className="absolute inset-0 bg-transparent backdrop-blur-md z-0" />

      {/* Navbar content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center">
          <Link href="/" className="flex h-full items-center py-1.5">
            <Image
              src="/Assets/Logo.png"
              alt="Logo"
              width={150}
              height={80}
              unoptimized
              className="h-full w-auto object-contain"
            />
          </Link>
        </div>
      </div>
    </nav>
  );
}
