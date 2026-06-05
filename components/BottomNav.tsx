"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  {
    href: "/",
    label: "Scan",
    icon: (active: boolean) => (
      <svg viewBox="0 0 28 28" className="w-[26px] h-[26px]" fill="none">
        {active ? (
          <>
            <rect x="3" y="3" width="8" height="8" rx="2" fill="currentColor"/>
            <rect x="17" y="3" width="8" height="8" rx="2" fill="currentColor"/>
            <rect x="3" y="17" width="8" height="8" rx="2" fill="currentColor"/>
            <circle cx="21" cy="21" r="4" fill="currentColor"/>
          </>
        ) : (
          <>
            <rect x="3" y="3" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.7"/>
            <rect x="17" y="3" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.7"/>
            <rect x="3" y="17" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.7"/>
            <circle cx="21" cy="21" r="4" stroke="currentColor" strokeWidth="1.7"/>
          </>
        )}
      </svg>
    ),
  },
  {
    href: "/history",
    label: "History",
    icon: (active: boolean) => (
      <svg viewBox="0 0 28 28" className="w-[26px] h-[26px]" fill="none">
        <circle cx="14" cy="14" r="10" stroke="currentColor" strokeWidth={active ? 0 : 1.7} fill={active ? "currentColor" : "none"}/>
        {active && <circle cx="14" cy="14" r="10" fill="currentColor"/>}
        <path d="M14 9v5.5l3 3" stroke={active ? "white" : "currentColor"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    href: "/profile",
    label: "Profile",
    icon: (active: boolean) => (
      <svg viewBox="0 0 28 28" className="w-[26px] h-[26px]" fill="none">
        <circle cx="14" cy="10" r="4.5" stroke="currentColor" strokeWidth="1.7" fill={active ? "currentColor" : "none"}/>
        <path d="M5 23c0-4 4-7 9-7s9 3 9 7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" fill="none"/>
      </svg>
    ),
  },
];

export default function BottomNav() {
  const path = usePathname();

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 sm:hidden tab-bar safe-bottom">
      <div className="flex h-[52px]">
        {TABS.map(({ href, label, icon }) => {
          const active = path === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex-1 flex flex-col items-center justify-center gap-[3px] pressable transition-colors ${
                active ? "text-brand-500" : "text-warm-400"
              }`}
            >
              {icon(active)}
              <span className={`text-[10px] font-semibold tracking-tight ${active ? "text-brand-500" : "text-warm-400"}`}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
