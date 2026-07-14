"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Newspaper } from "lucide-react";

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="flex-1 px-4 space-y-2 mt-4">
      <Link 
        href="/" 
        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
          pathname === "/" 
            ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" 
            : "text-gray-400 hover:text-white hover:bg-white/5"
        }`}
      >
        <Newspaper className="w-5 h-5" /> Dashboard
      </Link>
      <Link 
        href="/analysis" 
        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
          pathname === "/analysis" 
            ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" 
            : "text-gray-400 hover:text-white hover:bg-white/5"
        }`}
      >
        <BarChart3 className="w-5 h-5" /> Analizler
      </Link>
    </nav>
  );
}
