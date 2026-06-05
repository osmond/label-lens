"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Nav() {
  const path = usePathname();
  return (
    <nav className="hidden sm:block glass border-b border-black/[0.08] sticky top-0 z-10">
      <div className="max-w-2xl mx-auto px-6 h-12 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-[7px] bg-brand-500 flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="6" stroke="white" strokeWidth="1.5"/>
              <path d="M5 8a3 3 0 006 0" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="font-semibold text-warm-900 text-[15px] tracking-tight">Label Lens</span>
        </div>
        <div className="flex gap-1">
          {[{href:"/",label:"Scan"},{href:"/history",label:"History"},{href:"/compare",label:"Compare"},{href:"/profile",label:"Profile"}].map(({href,label})=>(
            <Link key={href} href={href} className={`px-3 py-1.5 rounded-[10px] text-[13px] font-medium transition-colors ${
              path===href ? "bg-brand-500 text-white" : "text-warm-600 hover:bg-warm-100"
            }`}>{label}</Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
