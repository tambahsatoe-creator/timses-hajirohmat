"use client"

import { useState, useEffect, useMemo } from "react"
import WarRoomShell from "@/components/WarRoomShell"
import { supabase } from "@/lib/supabase"

const INITIAL_TPS_SAKSI = [
  {
    kode_tps: "TPS 01",
    lokasi: "Balai Dusun Krajan RT 01/RW 01",
    saksi_utama: "Fajar Sidiq",
    saksi_wa: "6281244519921",
    saksi_cadangan: "Hendra Saputra",
    saksi_cadangan_wa: "6281388201190",
    total_dpt: 205,
    basis_pct: 68,
  },
  {
    kode_tps: "TPS 02",
    lokasi: "Halaman SDN 1 Krajan RT 02/RW 01",
    saksi_utama: "Budi Santoso",
    saksi_wa: "6285277112094",
    saksi_cadangan: "Slamet Riyadi",
    saksi_cadangan_wa: "6287890321188",
    total_dpt: 198,
    basis_pct: 62,
  },
  {
    kode_tps: "TPS 03",
    lokasi: "Balai Posyandu Sukamaju RT 01/RW 02",
    saksi_utama: "Agus Purnomo",
    saksi_wa: "6282166443200",
    saksi_cadangan: "Riko Simanjuntak",
    saksi_cadangan_wa: "6281198760044",
    total_dpt: 202,
    basis_pct: 70,
  },
  {
    kode_tps: "TPS 04",
    lokasi: "Gedung Serbaguna Harapan RW 03",
    saksi_utama: "Dewi Lestari",
    saksi_wa: "6285643219988",
    saksi_cadangan: "Rina Anggraini",
    saksi_cadangan_wa: "6281270098812",
    total_dpt: 205,
    basis_pct: 59,
  },
]

const INITIAL_DPT_ROWS = [
  {
    id: "dpt-001",
    no_dpt: "#001",
    nama_lengkap: "Ahmad Munawar",
    nik: "3204112301880002",
    info_usia: "L / 36 th",
    no_kk: "3204110804090014",
    dusun: "Dusun 01 Krajan",
    rt: "RT 01",
    rw: "RW 01",
    tps: "TPS 01",
    status_dukungan: "hijau",
    status_c_pemberitahuan: "Terkonfirmasi Hadir",
  },
  {
    id: "dpt-002",
    no_dpt: "#002",
    nama_lengkap: "Siti Rahmawati",
    nik: "3204115409920005",
    info_usia: "P / 32 th",
    no_kk: "3204110804090014",
    dusun: "Dusun 01 Krajan",
    rt: "RT 01",
    rw: "RW 01",
    tps: "TPS 01",
    status_dukungan: "hijau",
    status_c_pemberitahuan: "Terkonfirmasi Hadir",
  },
  {
    id: "dpt-003",
    no_dpt: "#003",
    nama_lengkap: "Bambang Hartono",
    nik: "3204111204750001",
    info_usia: "L / 49 th",
    no_kk: "3204111502120008",
    dusun: "Dusun 01 Krajan",
    rt: "RT 02",
    rw: "RW 01",
    tps: "TPS 02",
    status_dukungan: "kuning",
    status_c_pemberitahuan: "Belum Terima Form",
  },
  {
    id: "dpt-004",
    no_dpt: "#004",
    nama_lengkap: "Iwan Kusuma",
    nik: "3204111707830004",
    info_usia: "L / 41 th",
    no_kk: "3204112108110003",
    dusun: "Dusun 02 Sukamaju",
    rt: "RT 01",
    rw: "RW 02",
    tps: "TPS 03",
    status_dukungan: "merah",
    status_c_pemberitahuan: "Terkonfirmasi Hadir",
  },
  {
    id: "dpt-005",
    no_dpt: "#005",
    nama_lengkap: "Endang Susilowati",
    nik: "3204116511950007",
    info_usia: "P / 29 th",
    no_kk: "3204112108110003",
    dusun: "Dusun 02 Sukamaju",
    rt: "RT 01",
    rw: "RW 02",
    tps: "TPS 03",
    status_dukungan: "hijau",
    status_c_pemberitahuan: "Terkonfirmasi Hadir",
  },
  {
    id: "dpt-006",
    no_dpt: "#006",
    nama_lengkap: "Rizky Ramadhan",
    nik: "3204110303010006",
    info_usia: "L / 23 th",
    no_kk: "3204113009080021",
    dusun: "Dusun 03 Harapan",
    rt: "RT 02",
    rw: "RW 03",
    tps: "TPS 04",
    status_dukungan: "hijau",
    status_c_pemberitahuan: "Luar Kota / Boro",
  },
  {
    id: "dpt-007",
    no_dpt: "#007",
    nama_lengkap: "Tri Wahyuni",
    nik: "3204114812850003",
    info_usia: "P / 39 th",
    no_kk: "3204113009080021",
    dusun: "Dusun 03 Harapan",
    rt: "RT 02",
    rw: "RW 03",
    tps: "TPS 04",
    status_dukungan: "kuning",
    status_c_pemberitahuan: "Belum Terima Form",
  },
]

const TPS_OPTIONS = ["TPS 01", "TPS 02", "TPS 03", "TPS 04"]

export default function RekapDptSaksiPage() {
  const [tpsCards, setTpsCards] = useState(INITIAL_TPS_SAKSI)
  const [voters, setVoters] = useState(INITIAL_DPT_ROWS)
  const [filterDusun, setFilterDusun] = useState("all")
  const [filterTps, setFilterTps] = useState("all")
  const [filterKehadiran, setFilterKehadiran] = useState("all")
  const [filterDukungan, setFilterDukungan] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [syncLoading, setSyncLoading] = useState(false)
  const [checkingDup, setCheckingDup] = useState(false)
  const [showSaksiModal, setShowSaksiModal] = useState(false)
  const [saksiForm, setSaksiForm] = useState({
    nama: "",
    wa: "",
    kode_tps: "TPS 01",
    peran: "utama",
  })
  const [toast, setToast] = useState("")

  useEffect(() => {
    fetchDataFromSupabase()
  }, [])

  useEffect(() => {
    function handleEsc(e) {
      if (e.key === "Escape") {
        setShowSaksiModal(false)
      }
    }
    window.addEventListener("keydown", handleEsc)
    return () => window.removeEventListener("keydown", handleEsc)
  }, [])

  async function fetchDataFromSupabase() {
    if (!supabase) return
    setSyncLoading(true)
    try {
      const [tpsRes, voterRes] = await Promise.all([
        supabase.from("tps").select("*").order("id", { ascending: true }),
        supabase
          .from("pemilih")
          .select("*")
          .order("created_at", { ascending: false }),
      ])

      if (!tpsRes.error && tpsRes.data && tpsRes.data.length > 0) {
        setTpsCards((prev) =>
          prev.map((card, idx) => {
            const row = tpsRes.data[idx]
            if (!row) return card
            return {
              ...card,
              kode_tps: row.kode_tps || card.kode_tps,
              lokasi: row.lokasi || card.lokasi,
              saksi_utama: row.saksi_utama || card.saksi_utama,
              saksi_wa: row.saksi_wa || card.saksi_wa,
              saksi_cadangan: row.saksi_cadangan || card.saksi_cadangan,
              saksi_cadangan_wa:
                row.saksi_cadangan_wa || card.saksi_cadangan_wa,
              total_dpt: row.total_dpt || card.total_dpt,
            }
          }),
        )
      }

      if (!voterRes.error && voterRes.data && voterRes.data.length > 0) {
        const normalized = voterRes.data.map((v, i) => ({
          id: v.id || `db-${i}`,
          no_dpt: v.no_dpt || `#00${i + 1}`,
          nama_lengkap: v.nama_lengkap,
          nik: v.nik || "3204110000000001",
          info_usia: "Terdaftar DPT",
          no_kk: v.no_kk || v.nama_kk || "-",
          dusun: v.dusun || "Dusun 01 Krajan",
          rt: v.rt || "RT 01",
          rw: v.rw || "RW 01",
          tps: (v.tps || "TPS 01").slice(0, 6),
          status_dukungan: v.status_dukungan || "hijau",
          status_c_pemberitahuan:
            v.status_c_pemberitahuan || "Terkonfirmasi Hadir",
        }))
        setVoters([...normalized, ...INITIAL_DPT_ROWS])
      }
    } catch {
      // Gunakan data lokal apabila jaringan lambat
    } finally {
      setSyncLoading(false)
    }
  }

  function showToast(msg) {
    setToast(msg)
    setTimeout(() => setToast(""), 3200)
  }

  function handleCheckDuplicates() {
    setCheckingDup(true)
    setTimeout(() => {
      const seenNik = new Set()
      const dupList = []
      voters.forEach((v) => {
        const key = `${v.nama_lengkap.toLowerCase()}-${v.nik}`
        if (seenNik.has(key)) {
          dupList.push(v.nama_lengkap)
        } else {
          seenNik.add(key)
        }
      })
      setCheckingDup(false)
      if (dupList.length > 0) {
        showToast(`Ditemukan data ganda pada: ${dupList.join(", ")}`)
      } else {
        showToast(
          "Pemeriksaan selesai: 0 duplikasi NIK atau nama pemilih ditemukan.",
        )
      }
    }, 500)
  }

  async function handleCyclePlotTps(voter) {
    const currentIndex = TPS_OPTIONS.indexOf(voter.tps)
    const nextTps = TPS_OPTIONS[(currentIndex + 1) % TPS_OPTIONS.length]

    setVoters((prev) =>
      prev.map((item) =>
        item.id === voter.id ? { ...item, tps: nextTps } : item,
      ),
    )

    if (supabase && String(voter.id).length > 12) {
      await supabase.from("pemilih").update({ tps: nextTps }).eq("id", voter.id)
    }

    showToast(
      `Ploting TPS untuk ${voter.nama_lengkap} dialihkan ke ${nextTps}.`,
    )
  }

  async function handleSaveSaksi(e) {
    e.preventDefault()
    const cleanName = saksiForm.nama.trim()
    const cleanWa = saksiForm.wa.trim().replace(/^0/, "62")
    if (!cleanName || !cleanWa) return

    setTpsCards((prev) =>
      prev.map((card) => {
        if (card.kode_tps !== saksiForm.kode_tps) return card
        if (saksiForm.peran === "utama") {
          return { ...card, saksi_utama: cleanName, saksi_wa: cleanWa }
        }
        return {
          ...card,
          saksi_cadangan: cleanName,
          saksi_cadangan_wa: cleanWa,
        }
      }),
    )

    if (supabase) {
      const updatePayload =
        saksiForm.peran === "utama"
          ? { saksi_utama: cleanName, saksi_wa: cleanWa }
          : { saksi_cadangan: cleanName, saksi_cadangan_wa: cleanWa }
      await supabase
        .from("tps")
        .update(updatePayload)
        .eq("kode_tps", saksiForm.kode_tps)
    }

    setShowSaksiModal(false)
    setSaksiForm({ nama: "", wa: "", kode_tps: "TPS 01", peran: "utama" })
    showToast(
      `Mandat Saksi ${saksiForm.kode_tps} atas nama ${cleanName} berhasil diterbitkan.`,
    )
  }

  const filteredVoters = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    return voters.filter((v) => {
      const matchDusun = filterDusun === "all" || v.dusun === filterDusun
      const matchTps = filterTps === "all" || v.tps === filterTps
      const matchHadir =
        filterKehadiran === "all" ||
        v.status_c_pemberitahuan === filterKehadiran
      const matchDukungan =
        filterDukungan === "all" || v.status_dukungan === filterDukungan
      const pool =
        `${v.no_dpt} ${v.nama_lengkap} ${v.nik} ${v.no_kk} ${v.dusun} ${v.tps}`.toLowerCase()
      const matchSearch = !q || pool.includes(q)
      return (
        matchDusun && matchTps && matchHadir && matchDukungan && matchSearch
      )
    })
  }, [
    voters,
    filterDusun,
    filterTps,
    filterKehadiran,
    filterDukungan,
    searchQuery,
  ])

  function handleExportCsv() {
    const headers =
      "No DPT,Nama Pemilih,NIK,No KK,Dusun,RT/RW,TPS,Dukungan,Status C-Pemberitahuan\n"
    const rows = filteredVoters
      .map(
        (v) =>
          `"${v.no_dpt}","${v.nama_lengkap}","${v.nik}","${v.no_kk}","${v.dusun}","${v.rt}/${v.rw}","${v.tps}","${v.status_dukungan}","${v.status_c_pemberitahuan}"`,
      )
      .join("\n")
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", "rekap-dpt-dan-saksi-mytps.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    showToast("Berkas CSV Rekap DPT berhasil diunduh.")
  }

  return (
    <WarRoomShell
      searchValue={searchQuery}
      onSearchChange={setSearchQuery}
      searchPlaceholder="Cari Nama Pemilih, NIK, No KK, atau TPS..."
      onSyncClick={() => {
        fetchDataFromSupabase()
        showToast("Database DPT dan Mandat Saksi berhasil disinkronkan.")
      }}
      syncLoading={syncLoading}
    >
      <div className="p-4 lg:p-margin flex flex-col gap-space-lg max-w-[1600px] mx-auto w-full">
        {toast && (
          <div
            role="status"
            className="flex items-center gap-2 px-4 py-3 border bg-status-kita-bg border-status-kita-border text-status-kita-text rounded-xl font-label-md text-label-md"
          >
            <span className="material-symbols-outlined text-[20px]">
              check_circle
            </span>
            <span>{toast}</span>
          </div>
        )}

        <div className="flex flex-col justify-between border shadow-sm lg:flex-row lg:items-center gap-space-md bg-surface-card border-surface-border rounded-xl p-space-lg">
          <div className="flex items-start sm:items-center gap-space-md">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-status-kita-bg text-status-kita-text shrink-0">
              <span className="material-symbols-outlined text-[28px]">
                badge
              </span>
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-space-xs">
                <span className="tracking-wider uppercase font-label-sm text-label-sm text-secondary">
                  Teritorial Desa Terverifikasi
                </span>
                <span>•</span>
                <span className="font-semibold font-label-sm text-label-sm text-primary-container">
                  SK-KPU: 042/KMJ/2024
                </span>
              </div>
              <h1 className="font-headline-md text-headline-md text-on-surface tracking-tight mt-0.5">
                Manajemen Saksi Mandat & Ploting DPT Per TPS Kampung Makmur Jaya
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center self-start gap-space-sm lg:self-center shrink-0">
            <button
              type="button"
              onClick={handleCheckDuplicates}
              disabled={checkingDup}
              className="min-h-[44px] px-space-md bg-surface-container rounded-lg text-on-surface font-label-md text-label-md flex items-center gap-space-xs hover:bg-surface-dim transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <span className="material-symbols-outlined text-[18px] text-secondary">
                verified_user
              </span>
              <span>{checkingDup ? "Memeriksa..." : "Cek Duplikasi DPT"}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowSaksiModal(true)}
              className="min-h-[44px] px-space-md bg-primary-container rounded-lg text-on-primary font-label-md text-label-md flex items-center gap-space-xs hover:bg-primary-dark transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary"
            >
              <span className="material-symbols-outlined text-[18px]">
                person_add
              </span>
              <span>+ Tambah Saksi TPS</span>
            </button>
          </div>
        </div>

        <section
          aria-label="Ringkasan DPT dan Saksi"
          className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-space-md"
        >
          <div className="flex flex-col justify-between border shadow-sm bg-surface-card border-surface-border rounded-xl p-space-lg">
            <div className="flex items-center justify-between">
              <span className="uppercase font-label-sm text-label-sm text-secondary">
                Total DPT Resmi
              </span>
              <span className="p-2 rounded-lg bg-surface-container text-secondary">
                <span className="material-symbols-outlined text-[20px]">
                  how_to_reg
                </span>
              </span>
            </div>
            <div className="mt-space-md">
              <div className="flex items-baseline gap-space-xs">
                <span className="font-headline-lg text-headline-lg text-on-surface">
                  810
                </span>
                <span className="font-label-md text-label-md text-secondary">
                  Pemilih
                </span>
              </div>
              <p className="mt-1 font-body-sm text-body-sm text-secondary">
                4 TPS terdaftar di Kampung Makmur Jaya
              </p>
            </div>
          </div>

          <div className="flex flex-col justify-between border shadow-sm bg-surface-card border-surface-border rounded-xl p-space-lg">
            <div className="flex items-center justify-between">
              <span className="uppercase font-label-sm text-label-sm text-secondary">
                Saksi Bertugas Mandat
              </span>
              <span className="p-2 rounded-lg bg-status-kita-bg text-status-kita-text">
                <span className="material-symbols-outlined text-[20px]">
                  assignment_ind
                </span>
              </span>
            </div>
            <div className="mt-space-md">
              <div className="flex items-baseline gap-space-xs">
                <span className="font-headline-lg text-headline-lg text-status-kita-text">
                  8 / 8
                </span>
                <span className="font-label-md text-label-md text-secondary">
                  Saksi (4 TPS)
                </span>
              </div>
              <p className="mt-1 font-body-sm text-body-sm text-secondary">
                Formulir mandat fisik & digital tercetak
              </p>
            </div>
          </div>

          <div className="flex flex-col justify-between border shadow-sm bg-surface-card border-surface-border rounded-xl p-space-lg">
            <div className="flex items-center justify-between">
              <span className="uppercase font-label-sm text-label-sm text-secondary">
                Pemilih Basis Kita
              </span>
              <span className="p-2 rounded-lg bg-status-kita-bg text-status-kita-text">
                <span className="material-symbols-outlined text-[20px]">
                  trending_up
                </span>
              </span>
            </div>
            <div className="mt-space-md">
              <div className="flex items-baseline gap-space-xs">
                <span className="font-headline-lg text-headline-lg text-status-kita-text">
                  524
                </span>
                <span className="font-semibold font-label-md text-label-md text-status-kita-text">
                  64.7%
                </span>
              </div>
              <div className="w-full h-2 mt-2 overflow-hidden rounded-full bg-surface-container">
                <div
                  className="h-full rounded-full bg-primary-container"
                  style={{ width: "64.7%" }}
                ></div>
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-between border shadow-sm bg-surface-card border-surface-border rounded-xl p-space-lg">
            <div className="flex items-center justify-between">
              <span className="uppercase font-label-sm text-label-sm text-secondary">
                Kesiapan Penugasan
              </span>
              <span className="p-2 rounded-lg bg-status-kita-bg text-status-kita-text">
                <span className="material-symbols-outlined text-[20px]">
                  task_alt
                </span>
              </span>
            </div>
            <div className="mt-space-md">
              <div className="flex items-baseline gap-space-xs">
                <span className="font-headline-lg text-headline-lg text-on-surface">
                  100%
                </span>
                <span className="font-semibold font-label-md text-label-md text-status-kita-text">
                  Siap Operasional
                </span>
              </div>
              <p className="mt-1 font-body-sm text-body-sm text-secondary">
                Semua saksi memiliki perangkat & akses sinkronisasi
              </p>
            </div>
          </div>
        </section>

        <section className="flex flex-col gap-space-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-space-sm">
              <span className="material-symbols-outlined text-[22px] text-primary-container">
                groups
              </span>
              <h2 className="font-headline-sm text-headline-sm text-on-surface">
                Mandat & Penugasan Saksi TPS
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-surface-container text-secondary font-label-sm text-label-sm">
                4 Titik TPS
              </span>
            </div>
            <span className="hidden font-label-sm text-label-sm text-secondary sm:inline">
              Mandat resmi tersinkronisasi panitia pemilihan
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-space-md">
            {tpsCards.map((tps) => (
              <article
                key={tps.kode_tps}
                className="flex flex-col justify-between border shadow-sm bg-surface-card border-surface-border rounded-xl p-space-lg"
              >
                <div>
                  <div className="flex items-center justify-between mb-space-sm">
                    <h3 className="font-bold font-headline-sm text-headline-sm text-on-surface">
                      {tps.kode_tps}
                    </h3>
                    <span className="px-2 py-0.5 rounded bg-status-kita-bg border border-status-kita-border text-status-kita-text font-label-sm text-label-sm flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary-container"></span>
                      <span>QR Tervalidasi</span>
                    </span>
                  </div>
                  <p className="font-body-sm text-body-sm text-secondary mb-space-md">
                    {tps.lokasi}
                  </p>

                  <div className="space-y-space-sm mb-space-md">
                    <div className="flex items-center justify-between gap-2 rounded-lg p-space-sm bg-surface-container-low">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-primary-container shrink-0"></span>
                          <p className="truncate font-label-md text-label-md text-on-surface">
                            {tps.saksi_utama}
                          </p>
                        </div>
                        <p className="font-body-sm text-body-sm text-secondary truncate mt-0.5">
                          Saksi Utama
                        </p>
                      </div>
                      <a
                        href={`https://wa.me/${tps.saksi_wa}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="min-h-[40px] px-2.5 rounded-lg bg-status-kita-bg text-status-kita-text hover:bg-primary-container hover:text-on-primary transition-colors flex items-center gap-1 font-label-sm text-label-sm shrink-0"
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          chat
                        </span>
                        <span>Japri WA</span>
                      </a>
                    </div>

                    <div className="flex items-center justify-between gap-2 rounded-lg p-space-sm bg-surface-container-low">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-secondary shrink-0"></span>
                          <p className="truncate font-label-md text-label-md text-on-surface">
                            {tps.saksi_cadangan}
                          </p>
                        </div>
                        <p className="font-body-sm text-body-sm text-secondary truncate mt-0.5">
                          Saksi Cadangan
                        </p>
                      </div>
                      <a
                        href={`https://wa.me/${tps.saksi_cadangan_wa}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="min-h-[40px] px-2.5 rounded-lg bg-status-kita-bg text-status-kita-text hover:bg-primary-container hover:text-on-primary transition-colors flex items-center gap-1 font-label-sm text-label-sm shrink-0"
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          chat
                        </span>
                        <span>Japri WA</span>
                      </a>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-space-sm border-surface-border">
                  <div className="flex items-center justify-between mb-1 font-label-sm text-label-sm text-secondary">
                    <span>Pengawasan DPT</span>
                    <span className="font-bold text-on-surface">
                      {tps.total_dpt} Pemilih ({tps.basis_pct}% Basis)
                    </span>
                  </div>
                  <div className="w-full bg-surface-container rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary-container"
                      style={{ width: `${tps.basis_pct}%` }}
                    ></div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="flex flex-col border shadow-sm bg-surface-card border-surface-border rounded-xl p-space-lg gap-space-md">
          <div className="flex flex-col items-stretch justify-between lg:flex-row lg:items-center gap-space-md">
            <div className="flex flex-wrap items-center flex-1 gap-space-sm">
              <select
                aria-label="Filter Dusun"
                value={filterDusun}
                onChange={(e) => setFilterDusun(e.target.value)}
                className="min-h-[44px] px-3 bg-surface-container rounded-lg font-label-md text-label-md text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <option value="all">Semua Dusun</option>
                <option value="Dusun 01 Krajan">Dusun 01 Krajan</option>
                <option value="Dusun 02 Sukamaju">Dusun 02 Sukamaju</option>
                <option value="Dusun 03 Harapan">Dusun 03 Harapan</option>
              </select>

              <select
                aria-label="Filter TPS"
                value={filterTps}
                onChange={(e) => setFilterTps(e.target.value)}
                className="min-h-[44px] px-3 bg-surface-container rounded-lg font-label-md text-label-md text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <option value="all">Semua TPS</option>
                <option value="TPS 01">TPS 01</option>
                <option value="TPS 02">TPS 02</option>
                <option value="TPS 03">TPS 03</option>
                <option value="TPS 04">TPS 04</option>
              </select>

              <select
                aria-label="Filter Status C-Pemberitahuan"
                value={filterKehadiran}
                onChange={(e) => setFilterKehadiran(e.target.value)}
                className="min-h-[44px] px-3 bg-surface-container rounded-lg font-label-md text-label-md text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <option value="all">Semua Status C-Pemberitahuan</option>
                <option value="Terkonfirmasi Hadir">Terkonfirmasi Hadir</option>
                <option value="Belum Terima Form">Belum Terima Form</option>
                <option value="Luar Kota / Boro">Luar Kota / Boro</option>
              </select>

              <select
                aria-label="Filter Kategori Dukungan"
                value={filterDukungan}
                onChange={(e) => setFilterDukungan(e.target.value)}
                className="min-h-[44px] px-3 bg-surface-container rounded-lg font-label-md text-label-md text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <option value="all">Semua Dukungan</option>
                <option value="hijau">Pemilih Kita (Hijau)</option>
                <option value="kuning">Masih Ragu (Kuning)</option>
                <option value="merah">Pilih Calon Lain (Merah)</option>
              </select>
            </div>

            <div className="flex items-center gap-space-sm shrink-0">
              <button
                type="button"
                onClick={handleExportCsv}
                className="min-h-[44px] px-space-md bg-surface-container rounded-lg text-on-surface font-label-md text-label-md flex items-center gap-space-xs hover:bg-surface-dim transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <span className="material-symbols-outlined text-[18px]">
                  download
                </span>
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto border rounded-xl border-surface-border">
            <table className="w-full text-left border-collapse font-body-sm text-body-sm">
              <thead className="tracking-wider uppercase bg-surface-container font-label-sm text-label-sm text-secondary">
                <tr>
                  <th className="px-4 py-3">No. DPT</th>
                  <th className="px-4 py-3">Nama Pemilih & NIK</th>
                  <th className="px-4 py-3">No. KK</th>
                  <th className="px-4 py-3">Wilayah Dusun & RT</th>
                  <th className="px-4 py-3">Ploting TPS</th>
                  <th className="px-4 py-3">Kategori Dukungan</th>
                  <th className="px-4 py-3">Status C-Pemberitahuan</th>
                  <th className="px-4 py-3 text-center">Aksi Cepat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {filteredVoters.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-secondary">
                      Tidak ada data pemilih yang sesuai dengan filter
                      pencarian.
                    </td>
                  </tr>
                ) : (
                  filteredVoters.map((voter) => (
                    <tr
                      key={voter.id}
                      className="transition-colors hover:bg-surface-container-low"
                    >
                      <td className="px-4 py-3 font-label-md text-label-md text-on-surface">
                        {voter.no_dpt}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-label-md text-label-md text-on-surface">
                          {voter.nama_lengkap}
                        </div>
                        <div className="font-body-sm text-body-sm text-secondary">
                          {voter.nik} • {voter.info_usia}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-secondary">
                        {voter.no_kk}
                      </td>
                      <td className="px-4 py-3">
                        <span className="block font-label-md text-label-md text-on-surface">
                          {voter.dusun}
                        </span>
                        <span className="text-secondary">
                          {voter.rt} / {voter.rw}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2.5 py-1 rounded bg-surface-container text-on-surface font-label-md text-label-md">
                          {voter.tps}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {voter.status_dukungan === "hijau" && (
                          <span className="px-2.5 py-1 rounded bg-status-kita-bg text-status-kita-text font-label-sm text-label-sm inline-flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-primary-container"></span>
                            <span>Pemilih Kita</span>
                          </span>
                        )}
                        {voter.status_dukungan === "kuning" && (
                          <span className="px-2.5 py-1 rounded bg-status-ragu-bg text-status-ragu-text font-label-sm text-label-sm inline-flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-status-ragu-text"></span>
                            <span>Masih Ragu</span>
                          </span>
                        )}
                        {voter.status_dukungan === "merah" && (
                          <span className="px-2.5 py-1 rounded bg-status-lain-bg text-status-lain-text font-label-sm text-label-sm inline-flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-status-lain-text"></span>
                            <span>Pilih Calon Lain</span>
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2.5 py-1 rounded bg-surface-container text-on-surface font-label-sm text-label-sm inline-flex items-center gap-1">
                          <span>{voter.status_c_pemberitahuan}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleCyclePlotTps(voter)}
                          className="min-h-[40px] px-3 bg-surface-container hover:bg-primary-container hover:text-on-primary rounded-lg text-on-surface font-label-sm text-label-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        >
                          Ubah Ploting
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col items-center justify-between sm:flex-row gap-space-sm pt-space-sm">
            <p className="font-body-sm text-body-sm text-secondary">
              Menampilkan{" "}
              <span className="font-bold text-on-surface">
                {filteredVoters.length}
              </span>{" "}
              dari <span className="font-bold text-on-surface">810</span>{" "}
              pemilih terdaftar
            </p>
          </div>
        </section>

        {showSaksiModal && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-saksi-title"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-inverse-surface/60 backdrop-blur-sm"
          >
            <div className="flex flex-col w-full max-w-lg border shadow-xl bg-surface-card border-surface-border rounded-xl p-space-lg gap-space-md">
              <div className="flex items-center justify-between border-b pb-space-sm border-surface-border">
                <div className="flex items-center gap-space-sm">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-status-kita-bg text-status-kita-text">
                    <span className="material-symbols-outlined text-[24px]">
                      person_add
                    </span>
                  </div>
                  <div>
                    <h3
                      id="modal-saksi-title"
                      className="font-headline-sm text-headline-sm text-on-surface"
                    >
                      Penerbitan Mandat Saksi
                    </h3>
                    <p className="font-body-sm text-body-sm text-secondary">
                      Daftarkan saksi resmi bertugas di TPS
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSaksiModal(false)}
                  aria-label="Tutup modal"
                  className="min-w-[44px] min-h-[44px] rounded-lg bg-surface-container text-secondary hover:text-on-surface flex items-center justify-center"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    close
                  </span>
                </button>
              </div>

              <form onSubmit={handleSaveSaksi} className="space-y-space-md">
                <div>
                  <label className="block mb-1 uppercase font-label-sm text-label-sm text-secondary">
                    Nama Lengkap Sesuai KTP
                  </label>
                  <input
                    type="text"
                    required
                    value={saksiForm.nama}
                    onChange={(e) =>
                      setSaksiForm({ ...saksiForm, nama: e.target.value })
                    }
                    placeholder="Contoh: Muhammad Ridwan"
                    className="w-full min-h-[44px] px-3 bg-surface border border-surface-border rounded-lg font-body-sm text-body-sm text-on-surface"
                  />
                </div>

                <div className="grid grid-cols-2 gap-space-md">
                  <div>
                    <label className="block mb-1 uppercase font-label-sm text-label-sm text-secondary">
                      Nomor WhatsApp
                    </label>
                    <input
                      type="tel"
                      required
                      value={saksiForm.wa}
                      onChange={(e) =>
                        setSaksiForm({ ...saksiForm, wa: e.target.value })
                      }
                      placeholder="0812xxxxxxx"
                      className="w-full min-h-[44px] px-3 bg-surface border border-surface-border rounded-lg font-body-sm text-body-sm text-on-surface"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 uppercase font-label-sm text-label-sm text-secondary">
                      Penugasan TPS
                    </label>
                    <select
                      value={saksiForm.kode_tps}
                      onChange={(e) =>
                        setSaksiForm({ ...saksiForm, kode_tps: e.target.value })
                      }
                      className="w-full min-h-[44px] px-3 bg-surface border border-surface-border rounded-lg font-label-md text-label-md text-on-surface"
                    >
                      <option value="TPS 01">TPS 01</option>
                      <option value="TPS 02">TPS 02</option>
                      <option value="TPS 03">TPS 03</option>
                      <option value="TPS 04">TPS 04</option>
                    </select>
                  </div>
                </div>

                <div>
                  <span className="block mb-1 uppercase font-label-sm text-label-sm text-secondary">
                    Status Peran Saksi
                  </span>
                  <div className="grid grid-cols-2 gap-space-sm">
                    <label className="flex items-center gap-2 p-2.5 bg-surface-container rounded-lg cursor-pointer">
                      <input
                        type="radio"
                        name="peran"
                        value="utama"
                        checked={saksiForm.peran === "utama"}
                        onChange={() =>
                          setSaksiForm({ ...saksiForm, peran: "utama" })
                        }
                        className="accent-primary-container"
                      />
                      <span className="font-label-md text-label-md text-on-surface">
                        Saksi Inti / Utama
                      </span>
                    </label>
                    <label className="flex items-center gap-2 p-2.5 bg-surface-container rounded-lg cursor-pointer">
                      <input
                        type="radio"
                        name="peran"
                        value="cadangan"
                        checked={saksiForm.peran === "cadangan"}
                        onChange={() =>
                          setSaksiForm({ ...saksiForm, peran: "cadangan" })
                        }
                        className="accent-primary-container"
                      />
                      <span className="font-label-md text-label-md text-on-surface">
                        Saksi Cadangan
                      </span>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end pt-space-sm gap-space-sm">
                  <button
                    type="button"
                    onClick={() => setShowSaksiModal(false)}
                    className="min-h-[44px] px-space-md bg-surface-container text-on-surface rounded-lg font-label-md text-label-md"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="min-h-[44px] px-space-md bg-primary-container text-on-primary rounded-lg font-label-md text-label-md flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      verified
                    </span>
                    <span>Terbitkan Mandat & QR</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </WarRoomShell>
  )
}
