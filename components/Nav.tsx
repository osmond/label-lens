"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import AppLogo from "./AppLogo";

export default function Nav() {
  const path = usePathname();
  return (
    <nav className="hidden sm:block glass border-b border-black/[0.08] sticky top-0 z-10">
      <div className="max-w-2xl mx-auto px-6 h-12 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AppLogo size={26} />
          <span className="font-semibold text-warm-900 text-[15px] tracking-tight">Label Lens</span>
        </div>
        <div className="flex gap-1">
          {[{href:"/",label:"Scan"},{href:"/history",label:"History"},{href:"/profile",label:"Profile"}].map(({href,label})=>(
            <Link key={href} href={href} className={`px-3 py-1.5 rounded-[10px] text-[13px] font-medium transition-colors ${
              path===href ? "bg-brand-500 text-white" : "text-warm-600 hover:bg-warm-100"
            }`}>{label}</Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
