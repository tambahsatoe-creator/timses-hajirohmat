"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import MobileNav from "@/components/MobileNav"
import { supabase, getOfflineQueue, syncOfflineQueue } from "@/lib/supabase"

const FALLBACK_VOTERS = [
  {
    id: "1",
    nama_lengkap: "Ahmad Supardi",
    nama_kk: "Ahmad Supardi",
    dusun: "Dusun 01 Krajan",
    rt: "RT 02",
    rw: "RW 01",
    tps: "TPS 01 Krajan",
    nomor_wa: "6281234567890",
    status_dukungan: "hijau",
    pilihan_lawan: null,
    jumlah_anggota_kk: 3,
    catatan_lapangan: "Stiker terpasang di pintu",
    waktu_label: "Disetor 15 mnt lalu",
  },
  {
    id: "2",
    nama_lengkap: "Siti Aminah",
    nama_kk: "Rasyid Muhajir",
    dusun: "Dusun 01 Krajan",
    rt: "RT 01",
    rw: "RW 01",
    tps: "TPS 02 Krajan",
    nomor_wa: "6285298765432",
    status_dukungan: "kuning",
    pilihan_lawan: null,
    jumlah_anggota_kk: 2,
    catatan_lapangan: "Butuh silaturahmi ulang",
    waktu_label: "Disetor 35 mnt lalu",
  },
  {
    id: "3",
    nama_lengkap: "Budi Prasetyo",
    nama_kk: "Budi Prasetyo",
    dusun: "Dusun 01 Krajan",
    rt: "RT 03",
    rw: "RW 01",
    tps: "TPS 01 Krajan",
    nomor_wa: "6287711223344",
    status_dukungan: "merah",
    pilihan_lawan: "No. 02 Drs. Bambang",
    jumlah_anggota_kk: 1,
    catatan_lapangan: "Terpetakan posko lawan",
    waktu_label: "Disetor 1 jam lalu",
  },
  {
    id: "4",
    nama_lengkap: "Hartono Mulyo",
    nama_kk: "Hartono Mulyo",
    dusun: "Dusun 01 Krajan",
    rt: "RT 02",
    rw: "RW 01",
    tps: "TPS 03 Krajan",
    nomor_wa: "6281988776655",
    status_dukungan: "hijau",
    pilihan_lawan: null,
    jumlah_anggota_kk: 4,
    catatan_lapangan: "Stiker terpasang di pintu",
    waktu_label: "Disetor 2 jam lalu",
  },
]

export default function BerandaSetoranPage() {
  const [voters, setVoters] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [activeFilter, setActiveFilter] = useState("all")
  const [offlineCount, setOfflineCount] = useState(0)
  const [syncNotice, setSyncNotice] = useState("")
  const [userProfile, setUserProfile] = useState({
    nama_lengkap: "Andi Wijaya",
    wilayah: "Dusun 01 Krajan",
  })

  useEffect(() => {
    const savedUser = localStorage.getItem("mytps_user")
    if (savedUser) {
      try {
        setUserProfile(JSON.parse(savedUser))
      } catch {
        // Abaikan jika format JSON lokal rusak
      }
    }
    setOfflineCount(getOfflineQueue().length)
    fetchVoters()
  }, [])

  async function fetchVoters() {
    setLoading(true)
    setErrorMsg("")
    try {
      const localQueue = getOfflineQueue()
      if (supabase) {
        const { data, error } = await supabase
          .from("pemilih")
          .select("*")
          .order("created_at", { ascending: false })

        if (error) throw error
        if (data && data.length > 0) {
          setVoters([...localQueue, ...data])
          setLoading(false)
          return
        }
      }
      setVoters([...localQueue, ...FALLBACK_VOTERS])
    } catch {
      setErrorMsg(
        "Menggunakan salinan data perangkat karena jaringan belum stabil.",
      )
      setVoters([...getOfflineQueue(), ...FALLBACK_VOTERS])
    } finally {
      setLoading(false)
    }
  }

  async function handleManualSync() {
    setSyncNotice("Memeriksa antrean data offline...")
    const res = await syncOfflineQueue()
    setOfflineCount(getOfflineQueue().length)
    await fetchVoters()

    if (res.synced > 0) {
      setSyncNotice(`${res.synced} data warga berhasil disinkronkan ke server.`)
    } else {
      setSyncNotice("Semua data setoran sudah tersimpan aman di server.")
    }
    setTimeout(() => setSyncNotice(""), 3500)
  }

  function handleCheckDuplicates() {
    const seen = new Set()
    const duplicates = []

    voters.forEach((v) => {
      const key = (v.nama_lengkap || "").trim().toLowerCase()
      if (seen.has(key)) {
        duplicates.push(v.nama_lengkap)
      } else {
        seen.add(key)
      }
    })

    if (duplicates.length > 0) {
      setSyncNotice(`Ditemukan nama ganda: ${duplicates.join(", ")}`)
    } else {
      setSyncNotice(
        "Pemeriksaan selesai: 0 duplikasi nama warga di Dusun Krajan.",
      )
    }
    setTimeout(() => setSyncNotice(""), 4000)
  }

  const metrics = useMemo(() => {
    const total = voters.length
    const hijau = voters.filter((v) => v.status_dukungan === "hijau").length
    const kuning = voters.filter((v) => v.status_dukungan === "kuning").length
    const merah = voters.filter((v) => v.status_dukungan === "merah").length
    const target = 50
    const pct = Math.min(100, Math.round((total / target) * 100))
    return { total, hijau, kuning, merah, target, pct }
  }, [voters])

  const filteredVoters = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    return voters.filter((v) => {
      const matchStatus =
        activeFilter === "all" || v.status_dukungan === activeFilter
      const searchPool =
        `${v.nama_lengkap} ${v.nama_kk} ${v.rt} ${v.tps} ${v.nomor_wa || ""}`.toLowerCase()
      const matchQuery = !q || searchPool.includes(q)
      return matchStatus && matchQuery
    })
  }, [voters, activeFilter, searchQuery])

  return (
    <div className="flex flex-col min-h-screen bg-surface font-body-md text-body-md text-on-surface">
      <header className="fixed inset-x-0 top-0 z-40 w-full border-b pt-safe bg-surface-card/95 backdrop-blur-md border-surface-border">
        <div className="flex items-center justify-between h-16 max-w-lg mx-auto px-margin-mobile gap-space-sm">
          <div className="flex flex-col flex-1 min-w-0">
            <div className="flex items-center gap-space-xs">
              <span className="w-2 h-2 rounded-full bg-status-kita-text"></span>
              <span className="tracking-wide uppercase font-label-sm text-label-sm text-status-kita-text">
                ONLINE • SINKRON
              </span>
            </div>
            <h1 className="leading-tight truncate font-headline-sm text-headline-sm text-on-surface">
              Beranda Setoran
            </h1>
          </div>
          <div className="flex items-center gap-space-sm shrink-0">
            <div className="flex flex-col items-end">
              <span className="font-bold leading-none font-label-sm text-label-sm text-on-surface">
                {userProfile.nama_lengkap}
              </span>
              <span className="font-label-sm text-label-sm text-on-surface-variant text-[11px] leading-tight">
                {userProfile.wilayah}
              </span>
            </div>
            <Link
              href="/login"
              title="Ganti Akun"
              className="min-w-[44px] min-h-[44px] rounded-full bg-primary flex items-center justify-center text-on-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary"
            >
              <span className="material-symbols-outlined text-[20px]">
                person
              </span>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex flex-col flex-1 w-full max-w-lg pt-20 mx-auto pb-28 px-margin-mobile gap-space-md">
        {syncNotice && (
          <div
            role="status"
            className="bg-status-kita-bg border border-status-kita-border text-status-kita-text px-3.5 py-2.5 rounded-xl flex items-center gap-2 font-label-sm text-label-sm"
          >
            <span className="material-symbols-outlined text-[18px]">
              verified
            </span>
            <span>{syncNotice}</span>
          </div>
        )}

        {errorMsg && (
          <div
            role="alert"
            className="bg-status-ragu-bg border border-status-ragu-border text-status-ragu-text px-3.5 py-2.5 rounded-xl flex items-center gap-2 font-body-sm text-body-sm"
          >
            <span className="material-symbols-outlined text-[18px]">info</span>
            <span>{errorMsg}</span>
          </div>
        )}

        <section className="flex flex-col border shadow-sm bg-surface-card border-surface-border rounded-xl p-space-md gap-space-sm">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center min-w-0 gap-space-sm">
              <div className="flex items-center justify-center w-12 h-12 text-base font-bold border rounded-full bg-status-kita-bg text-status-kita-text shrink-0 border-status-kita-border">
                AW
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-space-xs">
                  <span className="truncate font-headline-sm text-headline-sm text-on-surface">
                    {userProfile.nama_lengkap}
                  </span>
                  <span className="material-symbols-outlined text-primary text-[18px]">
                    verified
                  </span>
                </div>
                <span className="truncate font-body-sm text-body-sm text-on-surface-variant">
                  Kordes Relawan • {userProfile.wilayah}
                </span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-0.5 shrink-0">
              <div className="flex items-center gap-1 bg-surface-container px-2.5 py-1 rounded-full">
                <span className="material-symbols-outlined text-[16px] text-primary">
                  cell_tower
                </span>
                <span className="font-label-sm text-label-sm text-on-surface">
                  4G Stabil
                </span>
              </div>
              <span className="font-label-sm text-label-sm text-on-surface-variant text-[11px]">
                TPS 01 - 04
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 rounded-lg bg-surface-container-low p-space-sm">
            <div className="flex items-center min-w-0 gap-space-xs">
              <span className="material-symbols-outlined text-primary text-[20px] shrink-0">
                cloud_sync
              </span>
              <div className="flex flex-col min-w-0">
                <span className="truncate font-label-sm text-label-sm text-on-surface">
                  Antrean Offline-First: {offlineCount} Data
                </span>
                <span className="font-body-sm text-body-sm text-on-surface-variant text-[11px] truncate">
                  Semua setoran tersimpan aman di server
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleManualSync}
              className="min-h-[44px] px-3 bg-surface-container hover:bg-surface-container-high text-on-surface rounded-lg font-label-sm text-label-sm transition-colors flex items-center gap-1 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <span className="material-symbols-outlined text-[18px]">
                sync
              </span>
              <span>Cek Sync</span>
            </button>
          </div>
        </section>

        <section className="flex flex-col border shadow-sm bg-surface-card border-surface-border rounded-xl p-space-md gap-space-md">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="tracking-wider uppercase font-label-sm text-label-sm text-on-surface-variant">
                Rekapitulasi Suara Saya
              </span>
              <span className="leading-tight font-headline-md text-headline-md text-on-surface">
                {metrics.total} Kepala Keluarga Terdata
              </span>
            </div>
            <div className="text-right">
              <span className="font-bold font-label-sm text-label-sm text-primary">
                {metrics.pct}% TERCAPAI
              </span>
              <div className="font-body-sm text-body-sm text-on-surface-variant text-[11px]">
                Target: {metrics.target} KK
              </div>
            </div>
          </div>

          <div className="flex w-full h-3 overflow-hidden rounded-full bg-surface-container">
            <div
              className="h-full bg-primary-container"
              style={{
                width: `${metrics.total ? (metrics.hijau / metrics.total) * 100 : 0}%`,
              }}
              title="Pemilih Kita"
            ></div>
            <div
              className="h-full bg-status-ragu-text"
              style={{
                width: `${metrics.total ? (metrics.kuning / metrics.total) * 100 : 0}%`,
              }}
              title="Masih Ragu"
            ></div>
            <div
              className="h-full bg-status-lain-text"
              style={{
                width: `${metrics.total ? (metrics.merah / metrics.total) * 100 : 0}%`,
              }}
              title="Calon Lain"
            ></div>
          </div>

          <div className="grid grid-cols-3 gap-space-xs">
            <div className="flex flex-col items-center text-center border rounded-lg bg-status-kita-bg border-status-kita-border p-space-sm">
              <span className="font-label-sm text-label-sm text-status-kita-text">
                PASTI KITA
              </span>
              <span className="font-headline-md text-headline-md text-status-kita-text leading-tight mt-0.5">
                {metrics.hijau}
              </span>
              <span className="font-body-sm text-body-sm text-status-kita-text text-[11px] leading-tight">
                H. Rohmat
              </span>
            </div>
            <div className="flex flex-col items-center text-center border rounded-lg bg-status-ragu-bg border-status-ragu-border p-space-sm">
              <span className="font-label-sm text-label-sm text-status-ragu-text">
                MASIH RAGU
              </span>
              <span className="font-headline-md text-headline-md text-status-ragu-text leading-tight mt-0.5">
                {metrics.kuning}
              </span>
              <span className="font-body-sm text-body-sm text-status-ragu-text text-[11px] leading-tight">
                Follow-up
              </span>
            </div>
            <div className="flex flex-col items-center text-center border rounded-lg bg-status-lain-bg border-status-lain-border p-space-sm">
              <span className="font-label-sm text-label-sm text-status-lain-text">
                LAWAN
              </span>
              <span className="font-headline-md text-headline-md text-status-lain-text leading-tight mt-0.5">
                {metrics.merah}
              </span>
              <span className="font-body-sm text-body-sm text-status-lain-text text-[11px] leading-tight">
                Paslon Lain
              </span>
            </div>
          </div>
        </section>

        <div className="flex flex-col gap-space-xs">
          <Link
            href="/input-cepat-warga"
            className="w-full min-h-[52px] bg-primary hover:bg-primary-dark text-on-primary rounded-xl font-label-lg text-label-lg shadow-sm flex items-center justify-center gap-space-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary"
          >
            <span className="material-symbols-outlined text-[24px]">
              person_add
            </span>
            <span>+ Catat Warga / Keluarga Baru</span>
          </Link>
          <button
            type="button"
            onClick={handleCheckDuplicates}
            className="w-full min-h-[46px] bg-surface-card border border-surface-border text-on-surface rounded-xl font-label-md text-label-md hover:bg-surface-container shadow-sm flex items-center justify-center gap-space-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <span className="material-symbols-outlined text-[20px] text-secondary">
              find_replace
            </span>
            <span>Cek Duplikasi Nama di Dusun Krajan</span>
          </button>
        </div>

        <div className="flex flex-col gap-space-sm mt-space-xs">
          <div className="relative w-full">
            <label htmlFor="voterSearchInput" className="sr-only">
              Cari nama warga, RT, atau WhatsApp
            </label>
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[22px]">
              search
            </span>
            <input
              id="voterSearchInput"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama warga, RT, atau WhatsApp..."
              className="w-full min-h-[48px] pl-11 pr-4 bg-surface-card border border-surface-border rounded-xl text-on-surface font-body-md text-body-md shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary placeholder:text-on-surface-variant"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => setActiveFilter("all")}
              className={`min-h-[44px] px-3.5 rounded-lg font-label-sm text-label-sm shrink-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                activeFilter === "all"
                  ? "bg-primary text-on-primary"
                  : "bg-surface-card border border-surface-border text-on-surface"
              }`}
            >
              Semua ({metrics.total})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter("hijau")}
              className={`min-h-[44px] px-3.5 rounded-lg font-label-sm text-label-sm shrink-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                activeFilter === "hijau"
                  ? "bg-primary text-on-primary"
                  : "bg-surface-card border border-surface-border text-status-kita-text"
              }`}
            >
              Pasti Hijau ({metrics.hijau})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter("kuning")}
              className={`min-h-[44px] px-3.5 rounded-lg font-label-sm text-label-sm shrink-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                activeFilter === "kuning"
                  ? "bg-primary text-on-primary"
                  : "bg-surface-card border border-surface-border text-status-ragu-text"
              }`}
            >
              Ragu-ragu ({metrics.kuning})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter("merah")}
              className={`min-h-[44px] px-3.5 rounded-lg font-label-sm text-label-sm shrink-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                activeFilter === "merah"
                  ? "bg-primary text-on-primary"
                  : "bg-surface-card border border-surface-border text-status-lain-text"
              }`}
            >
              Lawan ({metrics.merah})
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center gap-2 text-center border bg-surface-card border-surface-border rounded-xl p-space-xl">
            <span className="material-symbols-outlined text-primary text-[32px] animate-spin">
              progress_activity
            </span>
            <span className="font-label-md text-label-md text-on-surface">
              Memuat daftar setoran warga...
            </span>
          </div>
        ) : filteredVoters.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center border shadow-sm bg-surface-card border-surface-border rounded-xl p-space-xl gap-space-sm">
            <span className="material-symbols-outlined text-secondary text-[40px]">
              person_search
            </span>
            <div className="flex flex-col">
              <span className="font-headline-sm text-headline-sm text-on-surface">
                Data Warga Tidak Ditemukan
              </span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">
                Periksa ejaan nama warga atau atur ulang filter status dukungan.
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                setSearchQuery("")
                setActiveFilter("all")
              }}
              className="min-h-[44px] px-4 mt-space-xs bg-primary text-on-primary rounded-lg font-label-md text-label-md hover:bg-primary-dark transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              Tampilkan Semua Warga
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-space-sm">
            {filteredVoters.map((voter, idx) => {
              const isHijau = voter.status_dukungan === "hijau"
              const isKuning = voter.status_dukungan === "kuning"

              return (
                <article
                  key={voter.id || idx}
                  className="flex flex-col border shadow-sm bg-surface-card border-surface-border rounded-xl p-space-md gap-space-sm"
                >
                  <div className="flex items-start justify-between gap-space-sm">
                    <div className="flex flex-col min-w-0">
                      <h2 className="leading-snug font-headline-sm text-headline-sm text-on-surface">
                        {voter.nama_lengkap}
                      </h2>
                      <span className="font-body-sm text-body-sm text-on-surface-variant">
                        KK: {voter.nama_kk} • {voter.rt} / {voter.rw || "RW 01"}
                      </span>
                    </div>

                    {isHijau && (
                      <span className="px-2.5 py-1 bg-status-kita-bg border border-status-kita-border text-status-kita-text font-label-sm text-label-sm rounded uppercase tracking-wide shrink-0">
                        PILIH KITA (H. ROHMAT)
                      </span>
                    )}
                    {isKuning && (
                      <span className="px-2.5 py-1 bg-status-ragu-bg border border-status-ragu-border text-status-ragu-text font-label-sm text-label-sm rounded uppercase tracking-wide shrink-0">
                        RAGU-RAGU
                      </span>
                    )}
                    {!isHijau && !isKuning && (
                      <span className="px-2.5 py-1 bg-status-lain-bg border border-status-lain-border text-status-lain-text font-label-sm text-label-sm rounded uppercase tracking-wide shrink-0">
                        PILIH {voter.pilihan_lawan || "CALON LAWAN"}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center pt-1 gap-space-xs">
                    <div className="flex items-center gap-1 bg-surface-container-low px-2.5 py-1 rounded text-on-surface font-body-sm text-body-sm">
                      <span className="material-symbols-outlined text-[16px] text-primary">
                        diversity_1
                      </span>
                      <span>
                        {voter.jumlah_anggota_kk || 1} Anggota Keluarga
                      </span>
                    </div>
                    <div className="flex items-center gap-1 bg-surface-container-low px-2.5 py-1 rounded text-on-surface font-body-sm text-body-sm">
                      <span className="material-symbols-outlined text-[16px] text-secondary">
                        how_to_vote
                      </span>
                      <span>{voter.tps}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-1 text-on-surface-variant font-body-sm text-body-sm text-[12px]">
                      <span className="material-symbols-outlined text-[16px]">
                        schedule
                      </span>
                      <span>
                        {voter.catatan_lapangan ||
                          voter.waktu_label ||
                          "Tersimpan"}
                      </span>
                    </div>
                    <a
                      href={`https://wa.me/${(voter.nomor_wa || "6281234567890").replace(/^0/, "62")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`min-h-[44px] px-3.5 rounded-lg font-label-md text-label-md flex items-center gap-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                        isHijau
                          ? "bg-status-kita-bg text-status-kita-text hover:bg-status-kita-border"
                          : isKuning
                            ? "bg-status-ragu-bg text-status-ragu-text hover:bg-status-ragu-border"
                            : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
                      }`}
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        chat
                      </span>
                      <span>WhatsApp</span>
                    </a>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </main>

      <MobileNav />
    </div>
  )
}
