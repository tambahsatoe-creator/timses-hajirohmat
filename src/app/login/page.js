"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

const DEFAULT_ACCOUNTS = {
  admin: {
    login_id: "admin",
    nama_lengkap: "Ketua Timses Inti",
    peran: "admin",
    wilayah: "Kampung Makmur Jaya",
    tps_kode: "ALL",
  },
  timses: {
    login_id: "timses",
    nama_lengkap: "Andi Wijaya",
    peran: "relawan",
    wilayah: "Dusun 01 Krajan",
    tps_kode: "TPS 01",
  },
  "081234567890": {
    login_id: "081234567890",
    nama_lengkap: "Andi Wijaya",
    peran: "relawan",
    wilayah: "Dusun 01 Krajan",
    tps_kode: "TPS 01",
  },
  saksi: {
    login_id: "saksi",
    nama_lengkap: "Fajar Sidiq",
    peran: "saksi",
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
    }, 3000)
  }

  function redirectByRole(userObj) {
    localStorage.setItem("mytps_user", JSON.stringify(userObj))
    if (userObj.peran === "admin") {
      router.push("/overview")
    } else if (userObj.peran === "saksi") {
      router.push("/saksi-tps?tab=realcount")
    } else {
      router.push("/input-cepat-warga")
    }
  }

  async function processLogin(idValue, passValue) {
    const cleanId = idValue.trim().toLowerCase()
    const cleanPass = passValue.trim()

    if (!cleanId || !cleanPass) {
      showToast("Masukkan ID Pengguna dan Kata Sandi.", true)
      return
    }

    setLoading(true)

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from("pengguna")
          .select("*")
          .eq("login_id", idValue.trim())
          .eq("kata_sandi", cleanPass)
          .eq("aktif", true)
          .maybeSingle()

        if (!error && data) {
          showToast(`Akses diterima. Selamat bertugas, ${data.nama_lengkap}.`)
          redirectByRole(data)
          return
        }
      } catch {
        // Lanjutkan ke verifikasi akun bawaan apabila koneksi Supabase belum aktif
      }
    }

    const matched = DEFAULT_ACCOUNTS[cleanId]
    if (matched && cleanPass === "rohmat01") {
      showToast(`Akses diterima. Masuk sebagai ${matched.nama_lengkap}.`)
      redirectByRole(matched)
      return
    }

    showToast("ID atau Kata Sandi salah. Gunakan sandi: rohmat01", true)
    setLoading(false)
  }

  function handleFormSubmit(e) {
    e.preventDefault()
    processLogin(loginId, password)
  }

  function handleDirectRoleLogin(roleId) {
    setLoginId(roleId)
    setPassword("rohmat01")
    processLogin(roleId, "rohmat01")
  }

  return (
    <main className="relative flex flex-col justify-center flex-1 w-full max-w-md min-h-screen px-4 mx-auto pt-safe pb-safe bg-bg-base">
      <div className="flex flex-col w-full pt-2 pb-6">
        <div className="flex items-center justify-center gap-2 pt-2 mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 border rounded-full bg-status-kita-bg border-status-kita-border">
            <span className="inline-flex w-2 h-2 rounded-full bg-primary"></span>
            <span className="text-[11px] font-bold text-status-kita-text tracking-wide uppercase">
              Kampung Makmur Jaya • Sinyal Aktif
            </span>
          </div>
        </div>

        <div className="flex flex-col items-center p-6 mb-4 border shadow-sm bg-surface-card border-surface-border rounded-3xl">
          <div className="flex flex-col items-center w-full mb-6 text-center">
            <div className="flex items-center justify-center mb-3 shadow-sm w-14 h-14 rounded-2xl bg-primary-container">
              <span className="text-xl font-black leading-none tracking-tight text-amber-300">
                MY
              </span>
            </div>
            <h1 className="text-2xl font-black text-on-surface tracking-tight leading-none mb-1.5">
              MY TPS
            </h1>
            <div className="inline-block text-[11px] font-extrabold uppercase tracking-widest text-status-kita-text bg-status-kita-bg px-2.5 py-0.5 rounded-full mb-1">
              TIMSES HAJI ROHMAT
            </div>
            <p className="text-xs font-medium text-secondary">
              Sistem Pengawalan & Tabulasi Suara Pilkades
            </p>
          </div>

          <form
            className="flex flex-col w-full gap-3"
            onSubmit={handleFormSubmit}
          >
            <div className="relative flex items-center">
              <input
                type="text"
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                placeholder="ID Akses (admin / timses / saksi)"
                className="w-full min-h-[48px] px-3.5 py-3 bg-bg-base border border-surface-border rounded-xl font-medium text-sm text-on-surface placeholder:text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              />
            </div>

            <div className="relative flex items-center">
              <input
                type={showPass ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Kata Sandi (rohmat01)"
                className="w-full min-h-[48px] pl-3.5 pr-12 py-3 bg-bg-base border border-surface-border rounded-xl font-medium text-sm text-on-surface placeholder:text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                aria-label="Tampilkan sandi"
                className="absolute right-1.5 min-w-[44px] min-h-[44px] text-secondary hover:text-on-surface flex items-center justify-center rounded-lg"
              >
                <span className="material-symbols-outlined text-[20px]">
                  {showPass ? "visibility_off" : "visibility"}
                </span>
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full min-h-[48px] bg-primary-container hover:bg-primary-dark text-on-primary rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-sm mt-1 disabled:opacity-60"
            >
              <span className="material-symbols-outlined text-[20px]">
                login
              </span>
              <span>{loading ? "Memproses Akses..." : "Masuk Aplikasi"}</span>
            </button>
          </form>

          <div className="relative flex items-center w-full py-5">
            <div className="flex-grow border-t border-surface-border"></div>
            <span className="flex-shrink mx-3 text-[11px] font-bold text-secondary uppercase tracking-widest">
              KLIK UNTUK MASUK LANGSUNG
            </span>
            <div className="flex-grow border-t border-surface-border"></div>
          </div>

          <div className="grid w-full grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleDirectRoleLogin("timses")}
              className="min-h-[52px] px-2 py-2 bg-bg-base hover:bg-status-kita-bg border border-surface-border rounded-xl text-xs font-semibold text-on-surface flex flex-col items-center justify-center gap-1 transition-colors"
            >
              <span className="material-symbols-outlined text-[20px] text-primary">
                person_add
              </span>
              <span>Timses</span>
            </button>

            <button
              type="button"
              onClick={() => handleDirectRoleLogin("saksi")}
              className="min-h-[52px] px-2 py-2 bg-bg-base hover:bg-status-kita-bg border border-surface-border rounded-xl text-xs font-semibold text-on-surface flex flex-col items-center justify-center gap-1 transition-colors"
            >
              <span className="material-symbols-outlined text-[20px] text-primary">
                fact_check
              </span>
              <span>Tim Saksi</span>
            </button>

            <button
              type="button"
              onClick={() => handleDirectRoleLogin("admin")}
              className="min-h-[52px] px-2 py-2 bg-bg-base hover:bg-status-kita-bg border border-surface-border rounded-xl text-xs font-semibold text-on-surface flex flex-col items-center justify-center gap-1 transition-colors"
            >
              <span className="material-symbols-outlined text-[20px] text-primary">
                shield
              </span>
              <span>Admin</span>
            </button>
          </div>
        </div>

        {feedback.show && (
          <div
            role="status"
            className="fixed bottom-6 left-4 right-4 max-w-md mx-auto p-3.5 bg-on-surface text-surface-card rounded-2xl flex items-center gap-3 z-50 shadow-xl"
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
            <span className="flex-1 text-xs font-medium">
              {feedback.message}
            </span>
          </div>
        )}
      </div>
    </main>
  )
}
