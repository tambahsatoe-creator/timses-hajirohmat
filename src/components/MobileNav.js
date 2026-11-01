"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

export default function MobileNav() {
  const pathname = usePathname()

  const navItems = [
    {
      label: "Setoran",
      href: "/beranda-setoran",
      icon: "how_to_vote",
      isCenter: false,
    },
    {
      label: "Input",
      href: "/input-cepat-warga",
      icon: "person_add",
      isCenter: true,
    },
    {
      label: "Saksi TPS",
      href: "/saksi-tps",
      icon: "fact_check",
      isCenter: false,
    },
    {
      label: "War Room",
      href: "/overview",
      icon: "space_dashboard",
      isCenter: false,
    },
  ]

  return (
    <nav
      aria-label="Navigasi Utama Lapangan"
      className="fixed bottom-0 inset-x-0 w-full z-50 pb-safe bg-surface-card/95 backdrop-blur-md border-t border-surface-border shadow-[0_-2px_12px_rgba(0,0,0,0.05)]"
    >
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-space-xs">
        {navItems.map((item) => {
          const isActive = pathname === item.href

          if (item.isCenter) {
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={`flex flex-col items-center justify-center min-w-[64px] min-h-[44px] py-1 transition-colors rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                  isActive
                    ? "text-primary font-label-md"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                <div className="flex items-center justify-center w-10 h-10 -mt-3 rounded-full shadow-sm bg-primary-container text-on-primary">
                  <span className="material-symbols-outlined text-[22px]">
                    {item.icon}
                  </span>
                </div>
                <span className="font-label-sm text-label-sm mt-0.5">
                  {item.label}
                </span>
              </Link>
            )
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={`flex flex-col items-center justify-center min-w-[64px] min-h-[44px] py-1 transition-colors rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                isActive
                  ? "text-primary font-bold"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              <span className="material-symbols-outlined text-[24px]">
                {item.icon}
              </span>
              <span className="font-label-sm text-label-sm mt-0.5">
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
