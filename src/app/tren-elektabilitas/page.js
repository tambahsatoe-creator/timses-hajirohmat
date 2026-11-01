"use client"

import { useState, useEffect, useMemo } from "react"
import WarRoomShell from "@/components/WarRoomShell"
import { supabase } from "@/lib/supabase"

const WILAYAH_PRESETS = {
  all: {
    label: "Semua Wilayah",
    proyeksi: "78.4%",
    deltaProyeksi: "+5.2% vs W-1",
    marginPct: "+45.1%",
    marginSuara: "+366 Suara",
    swingSuara: 68,
    swingPct: "8.4%",
    efisiensi: "88.6%",
    rumahKunjungan: 374,
    hijauSuara: 540,
    hijauPct: 66.5,
    kuningSuara: 68,
    kuningPct: 8.4,
    merahSuara: 204,
    merahPct: 25.1,
  },
  barat: {
    label: "Dusun I Krajan",
    proyeksi: "84.2%",
    deltaProyeksi: "+6.8% vs W-1",
    marginPct: "+52.0%",
    marginSuara: "+154 Suara",
    swingSuara: 25,
    swingPct: "7.1%",
    efisiensi: "92.4%",
    rumahKunjungan: 148,
    hijauSuara: 215,
    hijauPct: 72.1,
    kuningSuara: 25,
    kuningPct: 8.4,
    merahSuara: 58,
    merahPct: 19.5,
  },
  timur: {
    label: "Dusun II Sumber Rejo",
    proyeksi: "76.0%",
    deltaProyeksi: "+4.5% vs W-1",
    marginPct: "+41.2%",
    marginSuara: "+118 Suara",
    swingSuara: 34,
    swingPct: "9.8%",
    efisiensi: "86.5%",
    rumahKunjungan: 126,
    hijauSuara: 185,
    hijauPct: 64.5,
    kuningSuara: 34,
    kuningPct: 11.8,
    merahSuara: 68,
    merahPct: 23.7,
  },
  selatan: {
    label: "Dusun III Tegalsari",
    proyeksi: "71.5%",
    deltaProyeksi: "+3.9% vs W-1",
    marginPct: "+36.8%",
    marginSuara: "+94 Suara",
    swingSuara: 33,
    swingPct: "12.6%",
    efisiensi: "81.0%",
    rumahKunjungan: 100,
    hijauSuara: 140,
    hijauPct: 61.7,
    kuningSuara: 9,
    kuningPct: 4.0,
    merahSuara: 78,
    merahPct: 34.3,
  },
}

const INITIAL_CONVERSION = [
  {
    id: "barat",
    dusun: "Dusun I Krajan",
    status: "Optimal",
    tone: "hijau",
    persen: 82.1,
    beralih: "115 / 140 Jiwa",
    tokoh: "Tokoh Penggerak: KH. Marzuki & H. Dahlan",
  },
  {
    id: "timur",
    dusun: "Dusun II Sumber Rejo",
    status: "Kuat",
    tone: "hijau",
    persen: 71.4,
    beralih: "85 / 119 Jiwa",
    tokoh: "Tokoh Penggerak: Ketua RT 04 (Bpk. Joko)",
  },
  {
    id: "selatan",
    dusun: "Dusun III Tegalsari",
    status: "Perlu Penetrasi",
    tone: "kuning",
    persen: 54.8,
    beralih: "40 / 73 Jiwa",
    tokoh: "Fokus pendekatan pemuda dan Karang Taruna",
  },
]

const INITIAL_LOGS = [
  {
    id: 1,
    wilayahKey: "barat",
    lokasi: "Dusun I / RT 02 (TPS 01)",
    waktu: "4 mnt lalu",
    dari: "Masih Ragu",
    dariTone: "kuning",
    ke: "Pemilih Kita",
    keTone: "hijau",
    pesan:
      "Keluarga Bpk. Slamet Riyadi (3 DPT) sepakat mendukung Paslon 01 pasca kunjungan silaturahmi relawan desa.",
    pencatat: "Saksi TPS 01 (Fajar Sidiq)",
  },
  {
    id: 2,
    wilayahKey: "selatan",
    lokasi: "Dusun III / RT 05 (TPS 04)",
    waktu: "28 mnt lalu",
    dari: "Pilih Calon Lain",
    dariTone: "merah",
    ke: "Masih Ragu",
    keTone: "kuning",
    pesan:
      "Ibu Warsini menangguhkan pilihan ke 02 karena simpati pada program layanan kesehatan desa Paslon 01.",
    pencatat: "Koordinator Dusun (Siti Nurhaliza)",
  },
  {
    id: 3,
    wilayahKey: "timur",
    lokasi: "Dusun II / RT 01 (TPS 03)",
    waktu: "1 jam lalu",
    dari: "Masih Ragu",
    dariTone: "kuning",
    ke: "Pemilih Kita",
    keTone: "hijau",
    pesan:
      "Komunitas pedagang pasar pagi (14 pemilih terdata) menyatakan komitmen dukungan bersama.",
    pencatat: "Tim Relawan Pasar (Ahmad Fauzi)",
  },
  {
    id: 4,
    wilayahKey: "barat",
    lokasi: "Dusun I / RT 03 (TPS 02)",
    waktu: "2 jam lalu",
    dari: "Pemilih Kita",
    dariTone: "hijau",
    ke: "Konfirmasi Ulang",
    keTone: "hijau",
    pesan:
      "Validasi NIK DPT keluarga pensiunan guru selesai. Seluruh 4 anggota keluarga siap hadir pukul 08:30 WIB.",
    pencatat: "Saksi TPS 02 (Budi Santoso)",
  },
]

export default function TrenElektabilitasPage() {
  const [selectedWilayah, setSelectedWilayah] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [syncLoading, setSyncLoading] = useState(false)
  const [logs, setLogs] = useState(INITIAL_LOGS)
  const [showAllLogs, setShowAllLogs] = useState(false)
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [scheduleForm, setScheduleForm] = useState({
    lokasi: "Dusun III Tegalsari (RT 05)",
    tanggal: "2026-11-05",
    tokoh: "H. Rahmat Hidayat & Tokoh Pemuda",
    targetWarga: "35 Warga Swing Voters",
  })
  const [notice, setNotice] = useState("")

  useEffect(() => {
    fetchLatestLogsFromSupabase()
  }, [])

  useEffect(() => {
    function handleEsc(e) {
      if (e.key === "Escape") {
        setShowScheduleModal(false)
      }
    }
    window.addEventListener("keydown", handleEsc)
    return () => window.removeEventListener("keydown", handleEsc)
  }, [])

  async function fetchLatestLogsFromSupabase() {
    if (!supabase) return
    setSyncLoading(true)
    try {
      const { data, error } = await supabase
        .from("pemilih")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(6)

      if (!error && data && data.length > 0) {
        const mappedLogs = data.map((row, idx) => ({
          id: `db-log-${idx}`,
          wilayahKey: "barat",
          lokasi: `${row.dusun || "Dusun I"} / ${row.rt} (${row.tps})`,
          waktu: "Tersinkron",
          dari: "Pendataan KK",
          dariTone: "kuning",
          ke:
            row.status_dukungan === "hijau"
              ? "Pemilih Kita"
              : row.status_dukungan === "kuning"
                ? "Masih Ragu"
                : "Pilih Lawan",
          keTone: row.status_dukungan || "hijau",
          pesan: `Keluarga ${row.nama_lengkap} (${row.jumlah_anggota_kk || 1} pemilih) tercatat di database. ${
            row.catatan_lapangan || ""
          }`,
          pencatat: row.pencatat_nama || "Andi Wijaya",
        }))
        setLogs([...mappedLogs, ...INITIAL_LOGS])
      }
    } catch {
      // Gunakan log lokal apabila jaringan sedang tidak stabil
    } finally {
      setSyncLoading(false)
    }
  }

  function showBanner(msg) {
    setNotice(msg)
    setTimeout(() => setNotice(""), 3200)
  }

  function handleExportCsv() {
    const headers =
      "Dusun,Status,Persentase Konversi,Rasio Jiwa,Tokoh Penggerak\n"
    const rows = INITIAL_CONVERSION.map(
      (c) =>
        `"${c.dusun}","${c.status}","${c.persen}%","${c.beralih}","${c.tokoh}"`,
    ).join("\n")
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", "analitik-konversi-suara-mytps.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    showBanner("Berkas CSV Matriks Konversi Suara berhasil diunduh.")
  }

  function handleSaveSchedule(e) {
    e.preventDefault()
    const newEntry = {
      id: Date.now(),
      wilayahKey: "selatan",
      lokasi: scheduleForm.lokasi,
      waktu: "Terjadwal",
      dari: "Target Kunjungan",
      dariTone: "kuning",
      ke: "Putaran Akhir",
      keTone: "hijau",
      pesan: `Jadwal tatap muka bersama ${scheduleForm.tokoh} pada ${scheduleForm.tanggal} untuk mengamankan ${scheduleForm.targetWarga}.`,
      pencatat: "Koordinator Kampanye",
    }
    setLogs((prev) => [newEntry, ...prev])
    setShowScheduleModal(false)
    showBanner(
      `Jadwal putaran akhir di ${scheduleForm.lokasi} berhasil ditambahkan.`,
    )
  }

  const activeMetrics = WILAYAH_PRESETS[selectedWilayah] || WILAYAH_PRESETS.all

  const filteredConversion = useMemo(() => {
    if (selectedWilayah === "all") return INITIAL_CONVERSION
    return INITIAL_CONVERSION.filter((c) => c.id === selectedWilayah)
  }, [selectedWilayah])

  const filteredLogs = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    const base = logs.filter((l) => {
      const matchWilayah =
        selectedWilayah === "all" || l.wilayahKey === selectedWilayah
      const matchQuery =
        !q || `${l.lokasi} ${l.pesan} ${l.pencatat}`.toLowerCase().includes(q)
      return matchWilayah && matchQuery
    })
    return showAllLogs ? base : base.slice(0, 4)
  }, [logs, selectedWilayah, searchQuery, showAllLogs])

  return (
    <WarRoomShell
      searchValue={searchQuery}
      onSearchChange={setSearchQuery}
      searchPlaceholder="Cari Dusun, RT, Tokoh, atau Pencatat Log..."
      onSyncClick={() => {
        fetchLatestLogsFromSupabase()
        showBanner("Data analitik dan tren elektabilitas berhasil diperbarui.")
      }}
      syncLoading={syncLoading}
    >
      <div className="p-4 lg:p-margin flex flex-col gap-space-lg max-w-[1600px] mx-auto w-full">
        {notice && (
          <div
            role="status"
            className="flex items-center gap-2 px-4 py-3 border bg-status-kita-bg border-status-kita-border text-status-kita-text rounded-xl font-label-md text-label-md"
          >
            <span className="material-symbols-outlined text-[20px]">
              verified
            </span>
            <span>{notice}</span>
          </div>
        )}

        <div className="flex flex-col justify-between md:flex-row md:items-end gap-space-md pb-space-xs">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-space-sm text-secondary font-label-sm text-label-sm">
              <span className="material-symbols-outlined text-[18px] text-primary">
                trending_up
              </span>
              <span>MODUL ANALITIK TERPADU • TIM PEMENANGAN DESA</span>
            </div>
            <h1 className="tracking-tight font-headline-lg text-headline-lg text-on-surface">
              Analisis Tren Elektabilitas & Evaluasi Penetrasi Suara
            </h1>
            <p className="font-body-md text-body-md text-secondary">
              Pemantauan longitudinal H-30 hingga Hari-H berbasis agregasi data
              TPS dan canvassing harian.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1 p-1 bg-surface-container rounded-xl">
            {[
              { id: "all", label: "Semua Wilayah" },
              { id: "barat", label: "Dusun I Krajan" },
              { id: "timur", label: "Dusun II Sumber Rejo" },
              { id: "selatan", label: "Dusun III Tegalsari" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedWilayah(tab.id)}
                className={`min-h-[44px] px-space-md py-2 rounded-lg font-label-md text-label-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                  selectedWilayah === tab.id
                    ? "bg-surface-card text-on-surface shadow-sm"
                    : "text-secondary hover:text-on-surface"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <section
          aria-label="Indikator Utama Elektabilitas"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md"
        >
          <div className="flex flex-col justify-between border shadow-sm bg-surface-card border-surface-border rounded-xl p-space-lg">
            <div className="flex items-center justify-between">
              <span className="tracking-wider uppercase font-label-sm text-label-sm text-secondary">
                Proyeksi Kemenangan
              </span>
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-status-kita-bg text-status-kita-text">
                <span className="material-symbols-outlined text-[20px]">
                  military_tech
                </span>
              </div>
            </div>
            <div className="my-space-sm">
              <div className="flex items-baseline gap-space-xs">
                <span className="font-bold tracking-tight font-headline-lg text-headline-lg text-on-surface">
                  {activeMetrics.proyeksi}
                </span>
                <span className="font-bold font-label-sm text-label-sm text-status-kita-text">
                  {activeMetrics.deltaProyeksi}
                </span>
              </div>
              <span className="font-body-sm text-body-sm text-secondary">
                Tingkat keyakinan 95% ({activeMetrics.label})
              </span>
            </div>
            <div className="w-full bg-surface-container rounded-full h-1.5 overflow-hidden">
              <div
                className="h-full rounded-full bg-primary-container"
                style={{ width: activeMetrics.proyeksi }}
              ></div>
            </div>
          </div>

          <div className="flex flex-col justify-between border shadow-sm bg-surface-card border-surface-border rounded-xl p-space-lg">
            <div className="flex items-center justify-between">
              <span className="tracking-wider uppercase font-label-sm text-label-sm text-secondary">
                Margin Keunggulan Bersih
              </span>
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-status-kita-bg text-status-kita-text">
                <span className="material-symbols-outlined text-[20px]">
                  equalizer
                </span>
              </div>
            </div>
            <div className="my-space-sm">
              <div className="flex items-baseline gap-space-xs">
                <span className="font-bold tracking-tight font-headline-lg text-headline-lg text-on-surface">
                  {activeMetrics.marginPct}
                </span>
                <span className="font-bold font-label-sm text-label-sm text-status-kita-text">
                  {activeMetrics.marginSuara}
                </span>
              </div>
              <span className="font-body-sm text-body-sm text-secondary">
                Selisih mutlak dari kompetitor terdekat (02)
              </span>
            </div>
            <div className="flex items-center gap-space-xs text-status-kita-text font-label-sm text-label-sm">
              <span className="material-symbols-outlined text-[16px]">
                verified
              </span>
              <span>Ambang batas aman dominasi terlewati</span>
            </div>
          </div>

          <div className="flex flex-col justify-between border shadow-sm bg-surface-card border-surface-border rounded-xl p-space-lg">
            <div className="flex items-center justify-between">
              <span className="tracking-wider uppercase font-label-sm text-label-sm text-secondary">
                Swing Voters Tersisa
              </span>
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-status-ragu-bg text-status-ragu-text">
                <span className="material-symbols-outlined text-[20px]">
                  help_center
                </span>
              </div>
            </div>
            <div className="my-space-sm">
              <div className="flex items-baseline gap-space-xs">
                <span className="font-bold tracking-tight font-headline-lg text-headline-lg text-on-surface">
                  {activeMetrics.swingSuara}
                </span>
                <span className="font-label-md text-label-md text-secondary">
                  Suara ({activeMetrics.swingPct})
                </span>
              </div>
              <span className="font-body-sm text-body-sm text-secondary">
                Tersebar dominan di RT 03 & RT 05
              </span>
            </div>
            <div className="w-full bg-surface-container rounded-full h-1.5 overflow-hidden">
              <div
                className="h-full rounded-full bg-status-ragu-text"
                style={{ width: activeMetrics.swingPct }}
              ></div>
            </div>
          </div>

          <div className="flex flex-col justify-between border shadow-sm bg-surface-card border-surface-border rounded-xl p-space-lg">
            <div className="flex items-center justify-between">
              <span className="tracking-wider uppercase font-label-sm text-label-sm text-secondary">
                Efisiensi Canvassing
              </span>
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-surface-container text-primary">
                <span className="material-symbols-outlined text-[20px]">
                  door_front
                </span>
              </div>
            </div>
            <div className="my-space-sm">
              <div className="flex items-baseline gap-space-xs">
                <span className="font-bold tracking-tight font-headline-lg text-headline-lg text-on-surface">
                  {activeMetrics.efisiensi}
                </span>
                <span className="font-bold font-label-sm text-label-sm text-primary">
                  Terkonfirmasi
                </span>
              </div>
              <span className="font-body-sm text-body-sm text-secondary">
                {activeMetrics.rumahKunjungan} rumah dikunjungi ulang 48 jam
                terakhir
              </span>
            </div>
            <div className="flex items-center gap-space-xs text-secondary font-label-sm text-label-sm">
              <span className="material-symbols-outlined text-[16px] text-primary">
                check_circle
              </span>
              <span>16 Relawan door-to-door aktif</span>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
          <div className="flex flex-col lg:col-span-8 gap-space-lg">
            <section className="flex flex-col border shadow-sm bg-surface-card border-surface-border rounded-xl p-space-lg gap-space-md">
              <div className="flex flex-col justify-between sm:flex-row sm:items-center gap-space-sm">
                <div>
                  <div className="flex flex-wrap items-center gap-space-xs">
                    <h2 className="font-headline-sm text-headline-sm text-on-surface">
                      Bagaimana Tren Elektabilitas Mingguan Sejak H-30 hingga
                      Hari-H?
                    </h2>
                    <span className="px-2 py-0.5 rounded bg-surface-container font-label-sm text-label-sm text-secondary">
                      H-30 s/d Hari-H
                    </span>
                  </div>
                  <p className="font-body-sm text-body-sm text-secondary">
                    Dinamika komitmen suara warga pasca-debat kandidat dan
                    kunjungan tokoh lokal
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-space-md">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-primary-container"></span>
                    <span className="font-label-sm text-label-sm text-on-surface">
                      01 Rahmat ({activeMetrics.hijauPct}%)
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-secondary"></span>
                    <span className="font-label-sm text-label-sm text-on-surface">
                      02 Bambang (21.4%)
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-status-lain-text"></span>
                    <span className="font-label-sm text-label-sm text-on-surface">
                      03 Ratna (12.1%)
                    </span>
                  </div>
                </div>
              </div>

              <div className="relative flex flex-col justify-end w-full pt-4 h-72 sm:h-80">
                <svg
                  className="w-full h-full overflow-visible"
                  preserveAspectRatio="none"
                  viewBox="0 0 650 240"
                  role="img"
                  aria-label="Grafik garis pertumbuhan elektabilitas Paslon 01 dari 48 persen menjadi 66.5 persen"
                >
                  <defs>
                    <linearGradient
                      id="grad-paslon1"
                      x1="0"
                      x2="0"
                      y1="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="#15803d"
                        stopOpacity="0.22"
                      />
                      <stop
                        offset="100%"
                        stopColor="#15803d"
                        stopOpacity="0.0"
                      />
                    </linearGradient>
                  </defs>
                  <line
                    opacity="0.4"
                    stroke="#CBD5E1"
                    strokeDasharray="3 3"
                    x1="0"
                    x2="650"
                    y1="30"
                    y2="30"
                  />
                  <line
                    opacity="0.4"
                    stroke="#CBD5E1"
                    strokeDasharray="3 3"
                    x1="0"
                    x2="650"
                    y1="80"
                    y2="80"
                  />
                  <line
                    opacity="0.4"
                    stroke="#CBD5E1"
                    strokeDasharray="3 3"
                    x1="0"
                    x2="650"
                    y1="130"
                    y2="130"
                  />
                  <line
                    opacity="0.4"
                    stroke="#CBD5E1"
                    strokeDasharray="3 3"
                    x1="0"
                    x2="650"
                    y1="180"
                    y2="180"
                  />
                  <line
                    opacity="0.7"
                    stroke="#CBD5E1"
                    strokeDasharray="3 3"
                    x1="0"
                    x2="650"
                    y1="230"
                    y2="230"
                  />

                  <path
                    d="M 0,135 Q 130,120 260,95 T 520,45 L 650,22 L 650,230 L 0,230 Z"
                    fill="url(#grad-paslon1)"
                  />
                  <path
                    d="M 0,135 C 100,128 200,115 325,82 C 450,55 540,32 650,22"
                    fill="none"
                    stroke="#15803d"
                    strokeLinecap="round"
                    strokeWidth="3.5"
                  />
                  <path
                    d="M 0,172 C 120,174 250,175 380,178 C 500,180 570,181 650,182"
                    fill="none"
                    stroke="#515f74"
                    strokeDasharray="4 2"
                    strokeLinecap="round"
                    strokeWidth="2.5"
                  />
                  <path
                    d="M 0,195 C 130,196 260,202 390,206 C 510,210 580,212 650,214"
                    fill="none"
                    stroke="#B91C1C"
                    strokeLinecap="round"
                    strokeWidth="2"
                  />

                  <circle cx="0" cy="135" fill="#15803d" r="4" />
                  <circle cx="162" cy="122" fill="#15803d" r="4" />
                  <circle cx="325" cy="82" fill="#15803d" r="4" />
                  <circle cx="487" cy="40" fill="#15803d" r="4" />
                  <circle
                    cx="650"
                    cy="22"
                    fill="#15803d"
                    r="5"
                    stroke="#ffffff"
                    strokeWidth="2"
                  />
                  <circle cx="650" cy="182" fill="#515f74" r="4" />
                  <circle cx="650" cy="214" fill="#B91C1C" r="4" />

                  <g transform="translate(600, 4)">
                    <rect fill="#DCFCE7" height="18" rx="4" width="48" />
                    <text
                      fill="#15803d"
                      fontSize="11"
                      fontWeight="700"
                      textAnchor="middle"
                      x="24"
                      y="13"
                    >
                      {activeMetrics.hijauPct}%
                    </text>
                  </g>
                  <g transform="translate(600, 162)">
                    <rect fill="#d5e3fc" height="18" rx="4" width="48" />
                    <text
                      fill="#515f74"
                      fontSize="11"
                      fontWeight="700"
                      textAnchor="middle"
                      x="24"
                      y="13"
                    >
                      21.4%
                    </text>
                  </g>
                  <g transform="translate(600, 196)">
                    <rect fill="#FEE2E2" height="18" rx="4" width="48" />
                    <text
                      fill="#B91C1C"
                      fontSize="11"
                      fontWeight="700"
                      textAnchor="middle"
                      x="24"
                      y="13"
                    >
                      12.1%
                    </text>
                  </g>
                </svg>

                <div className="flex items-center justify-between pt-2 font-label-sm text-label-sm text-secondary">
                  <span>H-30 (Kick-off)</span>
                  <span>H-21 (Bazar Warga)</span>
                  <span>H-14 (Debat Publik)</span>
                  <span>H-7 (Sapa Tokoh)</span>
                  <span className="font-bold text-on-surface">
                    Hari-H (Aktual)
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-sm pt-space-xs">
                <div className="flex flex-col gap-1 rounded-lg p-space-sm bg-surface-container-low">
                  <span className="font-label-sm text-label-sm text-secondary">
                    01. H. Rahmat Hidayat
                  </span>
                  <span className="font-headline-sm text-headline-sm text-status-kita-text">
                    48.0% → {activeMetrics.hijauPct}%
                  </span>
                  <span className="font-body-sm text-body-sm text-secondary">
                    +18.5% Lonjakan usai program perbaikan jalan tani
                  </span>
                </div>
                <div className="flex flex-col gap-1 rounded-lg p-space-sm bg-surface-container-low">
                  <span className="font-label-sm text-label-sm text-secondary">
                    02. Drs. Bambang
                  </span>
                  <span className="font-headline-sm text-headline-sm text-secondary">
                    23.2% → 21.4%
                  </span>
                  <span className="font-body-sm text-body-sm text-secondary">
                    -1.8% Tergerus pada segmen pemilih lansia
                  </span>
                </div>
                <div className="flex flex-col gap-1 rounded-lg p-space-sm bg-surface-container-low">
                  <span className="font-label-sm text-label-sm text-secondary">
                    03. Hj. Ratna Sari
                  </span>
                  <span className="font-headline-sm text-headline-sm text-status-lain-text">
                    16.8% → 12.1%
                  </span>
                  <span className="font-body-sm text-body-sm text-secondary">
                    -4.7% Basis massa beralih mendukung Paslon 01
                  </span>
                </div>
              </div>
            </section>

            <section className="flex flex-col border shadow-sm bg-surface-card border-surface-border rounded-xl p-space-lg gap-space-md">
              <div className="flex flex-col justify-between sm:flex-row sm:items-center gap-space-sm">
                <div>
                  <h2 className="font-headline-sm text-headline-sm text-on-surface">
                    Matriks Konversi Swing Voters & Efektivitas Door-to-Door
                  </h2>
                  <p className="font-body-sm text-body-sm text-secondary">
                    Rasio perpindahan pemilih dari kategori Masih Ragu menjadi
                    Pemilih Kita setelah kunjungan relawan
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleExportCsv}
                  className="min-h-[44px] px-space-md bg-surface-container rounded-lg text-primary font-label-sm text-label-sm flex items-center gap-1 hover:bg-surface-container-high transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    file_download
                  </span>
                  <span>Ekspor Metrik CSV</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
                {filteredConversion.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col justify-between border p-space-md rounded-xl bg-surface-container-low border-surface-border"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-label-sm text-label-sm text-secondary">
                        {item.dusun}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded font-label-sm text-label-sm ${
                          item.tone === "hijau"
                            ? "bg-status-kita-bg text-status-kita-text"
                            : "bg-status-ragu-bg text-status-ragu-text"
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>

                    <div className="flex items-end justify-between my-space-md">
                      <div>
                        <span className="font-headline-lg text-headline-lg text-on-surface">
                          {item.persen}%
                        </span>
                        <p className="font-body-sm text-body-sm text-secondary">
                          Konversi Pasca-Kunjungan
                        </p>
                      </div>
                      <div className="text-right">
                        <span
                          className={`font-label-md text-label-md font-bold ${
                            item.tone === "hijau"
                              ? "text-status-kita-text"
                              : "text-status-ragu-text"
                          }`}
                        >
                          {item.beralih}
                        </span>
                        <p className="font-body-sm text-body-sm text-secondary">
                          Ragu beralih Hijau
                        </p>
                      </div>
                    </div>

                    <div className="w-full h-2 overflow-hidden rounded-full bg-surface-container">
                      <div
                        className={`h-full rounded-full ${
                          item.tone === "hijau"
                            ? "bg-primary-container"
                            : "bg-status-ragu-text"
                        }`}
                        style={{ width: `${item.persen}%` }}
                      ></div>
                    </div>

                    <span className="font-body-sm text-body-sm text-secondary mt-space-sm">
                      {item.tokoh}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col items-center justify-between border p-space-md rounded-xl bg-status-kita-bg/60 border-status-kita-border sm:flex-row gap-space-md">
                <div className="flex items-center gap-space-md">
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-status-kita-bg text-status-kita-text shrink-0">
                    <span className="material-symbols-outlined text-[28px]">
                      groups_3
                    </span>
                  </div>
                  <div>
                    <span className="font-label-lg text-label-lg text-on-surface">
                      Evaluasi Kehadiran Simpul Massa
                    </span>
                    <p className="font-body-sm text-body-sm text-secondary">
                      Pertemuan tatap muka langsung 15-20 menit meningkatkan
                      komitmen pemilih pasti sebesar 2.8 kali lipat dibanding
                      selebaran statis.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(true)}
                  className="min-h-[44px] px-space-md bg-primary-container text-on-primary font-label-md text-label-md rounded-lg shrink-0 hover:bg-primary-dark transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary"
                >
                  Jadwalkan Putaran Akhir
                </button>
              </div>
            </section>
          </div>

          <div className="flex flex-col lg:col-span-4 gap-space-lg">
            <section className="flex flex-col border shadow-sm bg-surface-card border-surface-border rounded-xl p-space-lg gap-space-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-space-xs">
                  <span className="material-symbols-outlined text-[20px] text-primary">
                    pie_chart
                  </span>
                  <h2 className="font-headline-sm text-headline-sm text-on-surface">
                    Proporsi Dukungan Terpetakan
                  </h2>
                </div>
                <span className="font-label-sm text-label-sm text-secondary">
                  {activeMetrics.label}
                </span>
              </div>

              <div className="flex items-center justify-center py-space-sm">
                <div className="relative flex items-center justify-center w-44 h-44">
                  <svg
                    className="w-full h-full transform -rotate-90"
                    viewBox="0 0 36 36"
                    role="img"
                    aria-label="Diagram lingkaran proporsi dukungan pemilih"
                  >
                    <circle
                      cx="18"
                      cy="18"
                      fill="none"
                      r="15.9155"
                      stroke="#eaedff"
                      strokeWidth="4.5"
                    />
                    <circle
                      cx="18"
                      cy="18"
                      fill="none"
                      r="15.9155"
                      stroke="#15803d"
                      strokeDasharray={`${activeMetrics.hijauPct}, 100`}
                      strokeLinecap="round"
                      strokeWidth="4.5"
                    />
                    <circle
                      cx="18"
                      cy="18"
                      fill="none"
                      r="15.9155"
                      stroke="#B45309"
                      strokeDasharray={`${activeMetrics.kuningPct}, 100`}
                      strokeDashoffset={`-${activeMetrics.hijauPct}`}
                      strokeLinecap="round"
                      strokeWidth="4.5"
                    />
                    <circle
                      cx="18"
                      cy="18"
                      fill="none"
                      r="15.9155"
                      stroke="#B91C1C"
                      strokeDasharray={`${activeMetrics.merahPct}, 100`}
                      strokeDashoffset={`-${
                        activeMetrics.hijauPct + activeMetrics.kuningPct
                      }`}
                      strokeLinecap="round"
                      strokeWidth="4.5"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center">
                    <span className="font-bold font-headline-lg text-headline-lg text-on-surface">
                      {activeMetrics.hijauSuara}
                    </span>
                    <span className="font-label-sm text-label-sm text-secondary">
                      Pemilih Pasti
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-space-xs">
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-status-kita-bg border border-status-kita-border">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-status-kita-text"></span>
                    <span className="font-label-md text-label-md text-status-kita-text">
                      Pemilih Kita (Hijau)
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold font-label-md text-label-md text-status-kita-text">
                      {activeMetrics.hijauSuara} Suara ({activeMetrics.hijauPct}
                      %)
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg bg-status-ragu-bg border border-status-ragu-border">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-status-ragu-text"></span>
                    <span className="font-label-md text-label-md text-status-ragu-text">
                      Masih Ragu (Kuning)
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold font-label-md text-label-md text-status-ragu-text">
                      {activeMetrics.kuningSuara} Suara (
                      {activeMetrics.kuningPct}%)
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg bg-status-lain-bg border border-status-lain-border">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-status-lain-text"></span>
                    <span className="font-label-md text-label-md text-status-lain-text">
                      Pilih Calon Lain (Merah)
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold font-label-md text-label-md text-status-lain-text">
                      {activeMetrics.merahSuara} Suara ({activeMetrics.merahPct}
                      %)
                    </span>
                  </div>
                </div>
              </div>
            </section>

            <section className="flex flex-col border shadow-sm bg-surface-card border-surface-border rounded-xl p-space-lg gap-space-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-space-xs">
                  <span className="material-symbols-outlined text-[20px] text-primary">
                    feed
                  </span>
                  <h2 className="font-headline-sm text-headline-sm text-on-surface">
                    Log Perubahan Suara Aktual
                  </h2>
                </div>
                <span className="w-2.5 h-2.5 rounded-full bg-primary-container"></span>
              </div>

              <div className="flex flex-col gap-space-sm">
                {filteredLogs.map((log) => (
                  <article
                    key={log.id}
                    className="flex flex-col gap-1 border rounded-lg p-space-sm bg-surface-container-low border-surface-border"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold font-label-sm text-label-sm text-primary">
                        {log.lokasi}
                      </span>
                      <span className="font-body-sm text-body-sm text-secondary">
                        {log.waktu}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 my-0.5 flex-wrap">
                      <span
                        className={`px-2 py-0.5 rounded font-label-sm text-label-sm ${
                          log.dariTone === "merah"
                            ? "bg-status-lain-bg text-status-lain-text"
                            : log.dariTone === "hijau"
                              ? "bg-status-kita-bg text-status-kita-text"
                              : "bg-status-ragu-bg text-status-ragu-text"
                        }`}
                      >
                        {log.dari}
                      </span>
                      <span className="material-symbols-outlined text-[16px] text-secondary">
                        arrow_forward
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded font-label-sm text-label-sm ${
                          log.keTone === "hijau"
                            ? "bg-status-kita-bg text-status-kita-text"
                            : log.keTone === "kuning"
                              ? "bg-status-ragu-bg text-status-ragu-text"
                              : "bg-status-lain-bg text-status-lain-text"
                        }`}
                      >
                        {log.ke}
                      </span>
                    </div>

                    <p className="font-body-sm text-body-sm text-on-surface">
                      {log.pesan}
                    </p>
                    <div className="flex items-center gap-1 mt-1 font-label-sm text-label-sm text-secondary">
                      <span className="material-symbols-outlined text-[14px]">
                        account_circle
                      </span>
                      <span>Pencatat: {log.pencatat}</span>
                    </div>
                  </article>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setShowAllLogs(!showAllLogs)}
                className="min-h-[44px] w-full py-2.5 bg-surface-container hover:bg-surface-container-high text-on-surface rounded-lg font-label-md text-label-md flex items-center justify-center gap-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <span>
                  {showAllLogs
                    ? "Ringkas Tampilan Log"
                    : `Lihat Semua (${logs.length}) Log Masuk`}
                </span>
                <span className="material-symbols-outlined text-[18px]">
                  {showAllLogs ? "keyboard_arrow_up" : "keyboard_arrow_down"}
                </span>
              </button>
            </section>

            <section className="flex flex-col border shadow-sm bg-surface-card border-surface-border rounded-xl p-space-lg gap-space-sm">
              <div className="flex items-center gap-space-xs text-on-surface">
                <span className="material-symbols-outlined text-[20px] text-tertiary">
                  notification_important
                </span>
                <h2 className="font-headline-sm text-headline-sm">
                  Rekomendasi Taktis Hari Ini
                </h2>
              </div>
              <p className="font-body-sm text-body-sm text-secondary">
                Tindakan prioritas tim lapangan berdasarkan sebaran pemilih ragu
                sebelum masa tenang:
              </p>
              <ul className="flex flex-col gap-2 pt-1">
                <li className="p-2.5 rounded-lg bg-surface-container-low flex items-start gap-2">
                  <span className="material-symbols-outlined text-status-ragu-text text-[18px] shrink-0 mt-0.5">
                    campaign
                  </span>
                  <span className="font-body-sm text-body-sm text-on-surface">
                    Siagakan kendaraan penjemput pemilih lansia di Dusun III
                    Tegalsari untuk mengamankan 28 pemilih ragu lansia.
                  </span>
                </li>
                <li className="p-2.5 rounded-lg bg-surface-container-low flex items-start gap-2">
                  <span className="material-symbols-outlined text-primary-container text-[18px] shrink-0 mt-0.5">
                    verified_user
                  </span>
                  <span className="font-body-sm text-body-sm text-on-surface">
                    Pastikan 100% surat mandat saksi TPS 01 sampai TPS 04 telah
                    terdistribusi dan terverifikasi di menu Saksi.
                  </span>
                </li>
              </ul>
            </section>
          </div>
        </div>

        {showScheduleModal && (
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-inverse-surface/60 backdrop-blur-sm"
          >
            <form
              onSubmit={handleSaveSchedule}
              className="flex flex-col w-full max-w-md gap-3 border shadow-2xl bg-surface-card border-surface-border rounded-2xl p-space-lg"
            >
              <h3 className="font-headline-sm text-headline-sm text-on-surface">
                Jadwalkan Silaturahmi Putaran Akhir
              </h3>
              <label className="font-label-sm text-secondary">
                Titik Lokasi Dusun / RT
                <input
                  type="text"
                  required
                  value={scheduleForm.lokasi}
                  onChange={(e) =>
                    setScheduleForm({ ...scheduleForm, lokasi: e.target.value })
                  }
                  className="w-full min-h-[44px] px-3 mt-1 bg-surface border border-surface-border rounded-lg text-on-surface"
                />
              </label>
              <label className="font-label-sm text-secondary">
                Tanggal Pelaksanaan
                <input
                  type="date"
                  required
                  value={scheduleForm.tanggal}
                  onChange={(e) =>
                    setScheduleForm({
                      ...scheduleForm,
                      tanggal: e.target.value,
                    })
                  }
                  className="w-full min-h-[44px] px-3 mt-1 bg-surface border border-surface-border rounded-lg text-on-surface"
                />
              </label>
              <label className="font-label-sm text-secondary">
                Tokoh Pendamping Lapangan
                <input
                  type="text"
                  required
                  value={scheduleForm.tokoh}
                  onChange={(e) =>
                    setScheduleForm({ ...scheduleForm, tokoh: e.target.value })
                  }
                  className="w-full min-h-[44px] px-3 mt-1 bg-surface border border-surface-border rounded-lg text-on-surface"
                />
              </label>
              <label className="font-label-sm text-secondary">
                Target Konversi Warga
                <input
                  type="text"
                  required
                  value={scheduleForm.targetWarga}
                  onChange={(e) =>
                    setScheduleForm({
                      ...scheduleForm,
                      targetWarga: e.target.value,
                    })
                  }
                  className="w-full min-h-[44px] px-3 mt-1 bg-surface border border-surface-border rounded-lg text-on-surface"
                />
              </label>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="min-h-[44px] px-4 bg-surface-container rounded-lg font-label-md"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="min-h-[44px] px-4 bg-primary-container text-on-primary rounded-lg font-label-md"
                >
                  Simpan Jadwal
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </WarRoomShell>
  )
}
