"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"

export default function MobileNav({
  activeSaksiTab = "realcount",
  onChangeSaksiTab,
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [role, setRole] = useState("relawan")

  useEffect(() => {
    const raw = localStorage.getItem("mytps_user")
    if (!raw) {
      router.replace("/login")
      return
    }
    try {
      const user = JSON.parse(raw)
      const userRole = user.peran || "relawan"
      setRole(userRole)

      if (userRole === "relawan" && pathname.startsWith("/saksi-tps")) {
        router.replace("/input-cepat-warga")
      } else if (
        userRole === "saksi" &&
        (pathname.startsWith("/input-cepat-warga") ||
          pathname.startsWith("/beranda-setoran"))
      ) {
        router.replace("/saksi-tps")
      }
    } catch {
      router.replace("/login")
    }
  }, [pathname, router])

  function handleLogout() {
    localStorage.removeItem("mytps_user")
    router.push("/login")
  }

  return (
    <nav
      aria-label="Navigasi Utama"
      className="fixed bottom-0 inset-x-0 w-full z-50 pb-safe bg-surface-card border-t border-surface-border shadow-[0_-2px_12px_rgba(0,0,0,0.06)]"
    >
      <div className="grid items-center h-16 max-w-lg grid-cols-5 gap-1 px-2 mx-auto">
        {role === "saksi" ? (
          <>
            <button
              type="button"
              onClick={() =>
                onChangeSaksiTab
                  ? onChangeSaksiTab("realcount")
                  : router.push("/saksi-tps")
              }
              className={`col-span-2 flex flex-col items-center justify-center min-h-[48px] rounded-xl transition-colors ${
                activeSaksiTab === "realcount"
                  ? "bg-status-kita-bg text-status-kita-text font-bold border border-status-kita-border"
                  : "text-on-surface-variant hover:bg-surface-container-low"
              }`}
            >
              <span className="material-symbols-outlined text-[22px]">
                calculate
              </span>
              <span className="text-[11px] mt-0.5 truncate">
                1. Input Realcount
              </span>
            </button>

            <button
              type="button"
              onClick={() =>
                onChangeSaksiTab
                  ? onChangeSaksiTab("pengunjung")
                  : router.push("/saksi-tps")
              }
              className={`col-span-2 flex flex-col items-center justify-center min-h-[48px] rounded-xl transition-colors ${
                activeSaksiTab === "pengunjung"
                  ? "bg-status-kita-bg text-status-kita-text font-bold border border-status-kita-border"
                  : "text-on-surface-variant hover:bg-surface-container-low"
              }`}
            >
              <span className="material-symbols-outlined text-[22px]">
                how_to_reg
              </span>
              <span className="text-[11px] mt-0.5 truncate">
                2. Pengunjung TPS
              </span>
            </button>
          </>
        ) : (
          <>
            <Link
              href="/input-cepat-warga"
              className={`col-span-2 flex flex-col items-center justify-center min-h-[48px] rounded-xl transition-colors ${
                pathname === "/input-cepat-warga"
                  ? "bg-status-kita-bg text-status-kita-text font-bold border border-status-kita-border"
                  : "text-on-surface-variant hover:bg-surface-container-low"
              }`}
            >
              <span className="material-symbols-outlined text-[22px]">
                person_add
              </span>
              <span className="text-[11px] mt-0.5 truncate">
                1. Input Pemilih
              </span>
            </Link>

            <Link
              href="/beranda-setoran"
              className={`col-span-2 flex flex-col items-center justify-center min-h-[48px] rounded-xl transition-colors ${
                pathname === "/beranda-setoran"
                  ? "bg-status-kita-bg text-status-kita-text font-bold border border-status-kita-border"
                  : "text-on-surface-variant hover:bg-surface-container-low"
              }`}
            >
              <span className="material-symbols-outlined text-[22px]">
                fact_check
              </span>
              <span className="text-[11px] mt-0.5 truncate">
                2. Data Terinput
              </span>
            </Link>
          </>
        )}

        <button
          type="button"
          onClick={handleLogout}
          className="col-span-1 flex flex-col items-center justify-center min-h-[48px] rounded-xl text-status-lain-text hover:bg-status-lain-bg transition-colors"
          title="Keluar Akun"
        >
          <span className="material-symbols-outlined text-[20px]">logout</span>
          <span className="text-[11px] font-semibold mt-0.5">Keluar</span>
        </button>
      </div>
    </nav>
  )
}
