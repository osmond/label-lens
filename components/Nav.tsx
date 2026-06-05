"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Nav() {
  const path = usePathname();
  const link = (href: string, label: string) => (
    <Link
      href={href}
      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
        path === href
          ? "bg-indigo-600 text-white"
          : "text-slate-600 hover:bg-slate-200"
      }`}
    >
      {label}
    </Link>
  );

  return (
    <nav className="hidden sm:block bg-white border-b border-slate-200 sticky top-0 z-10">
      <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">🔬</span>
          <span className="font-bold text-slate-800 text-lg">Label Lens</span>
        </div>
        <div className="flex gap-1">
          {link("/", "Scan")}
          {link("/history", "History")}
          {link("/compare", "Compare")}
          {link("/profile", "Profile")}
        </div>
      </div>
    </nav>
  );
}
