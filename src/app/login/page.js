"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

export default function LoginPage() {
  const router = useRouter()
  const [loginId, setLoginId] = useState("")
  const [password, setPassword] = useState("")
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState({
    show: false,
    message: "",
    isError: false,
  })

  function showToast(message, isError = false) {
    setFeedback({ show: true, message, isError })
    setTimeout(() => {
      setFeedback((prev) => ({ ...prev, show: false }))
    }, 3200)
  }

  function routeByRole(peran) {
    if (peran === "admin") {
      router.push("/overview")
    } else if (peran === "saksi") {
      router.push("/saksi-tps")
    } else {
      router.push("/beranda-setoran")
    }
  }

  async function handleLogin(event) {
    event.preventDefault()
    const cleanId = loginId.trim()
    const cleanPass = password.trim()

    if (!cleanId) {
      showToast("Masukkan ID Pengguna atau Nomor WhatsApp", true)
      return
    }
    if (!cleanPass) {
      showToast("Kata sandi wajib diisi", true)
      return
    }

    setLoading(true)

    try {
      if (supabase) {
        const { data, error } = await supabase
          .from("pengguna")
          .select("*")
          .eq("login_id", cleanId)
          .eq("kata_sandi", cleanPass)
          .eq("aktif", true)
          .single()

        if (!error && data) {
          localStorage.setItem("mytps_user", JSON.stringify(data))
          showToast(`Akses diterima. Selamat bertugas, ${data.nama_lengkap}.`)
          setTimeout(() => routeByRole(data.peran), 800)
          return
        }
      }

      // Verifikasi cadangan lokal apabila koneksi internet di lapangan terputus
      const fallbackAccounts = {
        admin: {
          login_id: "admin",
          nama_lengkap: "Ketua Timses Inti",
          peran: "admin",
          wilayah: "Kampung Makmur Jaya",
          tps_kode: "ALL",
        },
        "081234567890": {
          login_id: "081234567890",
          nama_lengkap: "Andi Wijaya",
          peran: "relawan",
          wilayah: "Dusun 01 Krajan",
          tps_kode: "TPS 01",
        },
        saksi01: {
          login_id: "saksi01",
          nama_lengkap: "Fajar Sidiq",
          peran: "saksi",
          wilayah: "Dusun 01 Krajan",
          tps_kode: "TPS 01",
        },
      }

      const matched = fallbackAccounts[cleanId.toLowerCase()]
      if (matched && cleanPass === "rohmat01") {
        localStorage.setItem("mytps_user", JSON.stringify(matched))
        showToast(`Akses diterima. Selamat bertugas, ${matched.nama_lengkap}.`)
        setTimeout(() => routeByRole(matched.peran), 800)
      } else {
        showToast(
          "ID Timses atau Kata Sandi tidak sesuai. Gunakan sandi: rohmat01",
          true,
        )
        setLoading(false)
      }
    } catch {
      showToast(
        "Gagal menghubungi server. Periksa koneksi atau gunakan akun lokal.",
        true,
      )
      setLoading(false)
    }
  }

  function handleQuickDemo(id, label) {
    setLoginId(id)
    setPassword("rohmat01")
    showToast(`Akun ${label} siap digunakan. Klik Masuk Aplikasi.`)
  }

  return (
    <main className="flex-1 flex flex-col relative w-full max-w-md mx-auto pt-safe pb-safe px-4 min-h-screen justify-center bg-bg-base">
      <div className="flex flex-col w-full pb-6 pt-2">
        <div className="flex items-center justify-center gap-2 mb-6 pt-2">
          <div className="inline-flex items-center gap-2 bg-status-kita-bg border border-status-kita-border px-3 py-1 rounded-full">
            <span className="inline-flex rounded-full h-2 w-2 bg-primary"></span>
            <span className="text-[11px] font-bold text-status-kita-text tracking-wide uppercase">
              Kampung Makmur Jaya • Sinyal Aktif
            </span>
          </div>
        </div>

        <div className="bg-surface-card border border-surface-border rounded-3xl p-6 shadow-sm flex flex-col items-center mb-4">
          <div className="flex flex-col items-center text-center mb-7 w-full">
            <div className="w-14 h-14 rounded-2xl bg-primary-container flex items-center justify-center shadow-sm mb-3">
              <span className="font-black text-amber-300 text-xl tracking-tight leading-none">
                MY
              </span>
            </div>
            <h1 className="text-2xl font-black text-on-surface tracking-tight leading-none mb-1.5">
              MY TPS
            </h1>
            <div className="inline-block text-[11px] font-extrabold uppercase tracking-widest text-status-kita-text bg-status-kita-bg px-2.5 py-0.5 rounded-full mb-1">
              TIMSES HAJI ROHMAT
            </div>
            <p className="text-xs text-secondary font-medium">
              Sistem Pengawalan & Tabulasi Suara Pilkades
            </p>
          </div>

          <form className="w-full flex flex-col gap-3" onSubmit={handleLogin}>
            <div className="relative flex items-center">
              <label htmlFor="login-id" className="sr-only">
                Nomor WhatsApp atau ID Timses
              </label>
              <input
                id="login-id"
                type="text"
                required
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                placeholder="Nomor WhatsApp atau ID Timses"
                className="w-full min-h-[48px] px-3.5 pr-11 py-3 bg-bg-base border border-surface-border rounded-xl font-medium text-sm text-on-surface placeholder:text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:bg-surface-card transition-all"
              />
              {loginId && (
                <button
                  type="button"
                  onClick={() => setLoginId("")}
                  title="Bersihkan input"
                  aria-label="Bersihkan input ID"
                  className="absolute right-1.5 min-w-[44px] min-h-[44px] text-secondary hover:text-on-surface flex items-center justify-center rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    cancel
                  </span>
                </button>
              )}
            </div>

            <div className="relative flex items-center">
              <label htmlFor="login-password" className="sr-only">
                Kata Sandi Akun
              </label>
              <input
                id="login-password"
                type={showPass ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Kata Sandi Akun"
                className="w-full min-h-[48px] pl-3.5 pr-12 py-3 bg-bg-base border border-surface-border rounded-xl font-medium text-sm text-on-surface placeholder:text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:bg-surface-card transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                title={showPass ? "Sembunyikan sandi" : "Tampilkan sandi"}
                aria-label={showPass ? "Sembunyikan sandi" : "Tampilkan sandi"}
                className="absolute right-1.5 min-w-[44px] min-h-[44px] text-secondary hover:text-on-surface flex items-center justify-center rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <span className="material-symbols-outlined text-[20px]">
                  {showPass ? "visibility_off" : "visibility"}
                </span>
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full min-h-[48px] h-12 bg-primary-container hover:bg-primary-dark active:bg-primary text-on-primary rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-sm tracking-wide mt-1 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary"
            >
              <span
                className={`material-symbols-outlined text-[20px] ${
                  loading ? "animate-spin" : ""
                }`}
              >
                {loading ? "progress_activity" : "login"}
              </span>
              <span>
                {loading ? "Memverifikasi Akun Lapangan..." : "Masuk Aplikasi"}
              </span>
            </button>
          </form>

          <div className="relative flex py-5 items-center w-full">
            <div className="flex-grow border-t border-surface-border"></div>
            <span className="flex-shrink mx-3 text-[11px] font-bold text-secondary uppercase tracking-widest">
              AKSES CEPAT PERAN
            </span>
            <div className="flex-grow border-t border-surface-border"></div>
          </div>

          <div className="grid grid-cols-3 gap-2 w-full">
            <button
              type="button"
              onClick={() => handleQuickDemo("081234567890", "Relawan Kordes")}
              className="min-h-[44px] px-2 py-2 bg-bg-base hover:bg-status-kita-bg border border-surface-border rounded-xl text-xs font-semibold text-on-surface flex flex-col items-center justify-center gap-0.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <span className="material-symbols-outlined text-[18px] text-primary">
                how_to_vote
              </span>
              <span>Relawan</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo("saksi01", "Saksi TPS 01")}
              className="min-h-[44px] px-2 py-2 bg-bg-base hover:bg-status-kita-bg border border-surface-border rounded-xl text-xs font-semibold text-on-surface flex flex-col items-center justify-center gap-0.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <span className="material-symbols-outlined text-[18px] text-primary">
                fact_check
              </span>
              <span>Saksi TPS</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo("admin", "Pusat Komando")}
              className="min-h-[44px] px-2 py-2 bg-bg-base hover:bg-status-kita-bg border border-surface-border rounded-xl text-xs font-semibold text-on-surface flex flex-col items-center justify-center gap-0.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <span className="material-symbols-outlined text-[18px] text-primary">
                shield
              </span>
              <span>War Room</span>
            </button>
          </div>

          <div className="mt-4 pt-1">
            <a
              href="https://wa.me/6281234567890?text=Halo%20Admin%20MY%20TPS%2C%20saya%20butuh%20bantuan%20akses%20akun"
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-[44px] px-2 text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg"
            >
              <span>Lupa kata sandi? Hubungi Admin via WhatsApp</span>
            </a>
          </div>
        </div>

        <div className="bg-surface-card border border-surface-border rounded-2xl p-4 shadow-sm text-center flex flex-col items-center gap-1 mb-4">
          <div className="inline-flex items-center gap-1.5 text-on-surface text-xs font-semibold">
            <span className="material-symbols-outlined text-[16px] text-primary">
              verified_user
            </span>
            <span>Aplikasi Internal Pemenangan Pilkades</span>
          </div>
          <p className="text-[11px] text-secondary font-medium">
            Timses H. Rahmat Hidayat • Kampung Makmur Jaya
          </p>
        </div>

        <div className="flex justify-center mb-2">
          <div className="inline-flex items-center gap-1.5 text-secondary text-[11px] bg-surface-card px-3 py-1.5 rounded-full border border-surface-border">
            <span className="material-symbols-outlined text-[15px] text-primary">
              wifi_off
            </span>
            <span className="font-medium">
              Mode Offline-First aktif saat sinyal lapangan terputus
            </span>
          </div>
        </div>

        {feedback.show && (
          <div
            role="status"
            aria-live="polite"
            className="fixed bottom-6 left-4 right-4 max-w-md mx-auto p-3.5 bg-on-surface text-surface-card rounded-2xl flex items-center gap-3 z-50 shadow-xl border border-secondary"
          >
            <span
              className={`material-symbols-outlined text-[20px] ${
                feedback.isError
                  ? "text-status-lain-border"
                  : "text-primary-fixed"
              }`}
            >
              {feedback.isError ? "error" : "check_circle"}
            </span>
            <span className="text-xs font-medium flex-1">
              {feedback.message}
            </span>
          </div>
        )}
      </div>
    </main>
  )
}
