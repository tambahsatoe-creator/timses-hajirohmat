"use client"

import { useState, useEffect, useMemo } from "react"
import WarRoomShell from "@/components/WarRoomShell"
import { supabase } from "@/lib/supabase"

const INITIAL_DUSUN_CARDS = [
  {
    id: "d1",
    kode: "D1",
    nama: "Dusun 01 Krajan",
    zonaLabel: "Zona Aman Solid",
    badgeClass: "bg-status-kita-bg text-status-kita-text",
    barClass: "bg-primary-container",
    infoPosko: "12 RT • 4 Posko Komando Terbuka",
    persen: 72,
    suara: 2721,
    target: 2650,
    selisihLabel: "+71 Melampaui",
    karakter:
      "Karakter pemilih religius-struktural, basis tani solid dengan posko induk di Balai Dusun.",
    realisasiPct: "102%",
    kordes: "Agus Santoso, S.Pd",
    telepon: "6281298440001",
    teleponTampil: "+62 812-9844-0001",
    totalRt: "12 RT",
    prioritas: "Pemeliharaan (P-3)",
    statusOperasi: "Status Operasi: Terkunci",
  },
  {
    id: "d2",
    kode: "D2",
    nama: "Dusun 02 Sukamaju",
    zonaLabel: "Pertarungan Ketat",
    badgeClass: "bg-status-ragu-bg text-status-ragu-text",
    barClass: "bg-status-ragu-text",
    infoPosko: "10 RT • 6 Posko Komando Terbuka",
    persen: 58,
    suara: 1827,
    target: 2200,
    selisihLabel: "-373 Butuh Serbuan",
    karakter:
      "Wilayah perumahan padat, pemuda milenial, banyak pekerja pabrik yang masih menimbang program.",
    realisasiPct: "83%",
    kordes: "Bambang Wijaya",
    telepon: "6282144320002",
    teleponTampil: "+62 821-4432-0002",
    totalRt: "10 RT",
    prioritas: "Gerebek RT (P-1)",
    statusOperasi: "Butuh 373 Suara Tambahan",
  },
  {
    id: "d3",
    kode: "D3",
    nama: "Dusun 03 Harapan",
    zonaLabel: "Benteng Utama",
    badgeClass: "bg-status-kita-bg text-status-kita-text",
    barClass: "bg-primary-container",
    infoPosko: "8 RT • 4 Posko Komando Terbuka",
    persen: 81,
    suara: 2162,
    target: 2000,
    selisihLabel: "+162 Solid",
    karakter:
      "Wilayah basis keluarga besar paguyuban pedagang dan tokoh sesepuh kampung pendukung program.",
    realisasiPct: "108%",
    kordes: "Hj. Siti Khodijah",
    telepon: "6285711920003",
    teleponTampil: "+62 857-1192-0003",
    totalRt: "8 RT",
    prioritas: "Mobilisasi TPS (P-2)",
    statusOperasi: "Status Operasi: Pengamanan TPS",
  },
]

const RT_CLUSTERS = [
  {
    id: "rt1",
    dusunId: "d1",
    nama: "RT 01 / RW 01",
    dusun: "Dusun 01 Krajan",
    persen: 84,
    kkTotal: 280,
    kkOk: 235,
    tag: "Posko Utama",
    kategori: "hijau",
    ikon: "shield",
  },
  {
    id: "rt2",
    dusunId: "d1",
    nama: "RT 02 / RW 01",
    dusun: "Dusun 01 Krajan",
    persen: 76,
    kkTotal: 310,
    kkOk: 236,
    tag: "Canvassed 100%",
    kategori: "hijau",
    ikon: "check_circle",
  },
  {
    id: "rt3",
    dusunId: "d2",
    nama: "RT 01 / RW 02",
    dusun: "Dusun 02 Sukamaju",
    persen: 54,
    kkTotal: 295,
    kkOk: 159,
    tag: "98 Swing Voters",
    kategori: "kuning",
    ikon: "warning",
  },
  {
    id: "rt4",
    dusunId: "d2",
    nama: "RT 02 / RW 02",
    dusun: "Dusun 02 Sukamaju",
    persen: 51,
    kkTotal: 340,
    kkOk: 173,
    tag: "Target Kunjungan 2",
    kategori: "kuning",
    ikon: "priority_high",
  },
  {
    id: "rt5",
    dusunId: "d2",
    nama: "RT 03 / RW 02",
    dusun: "Dusun 02 Sukamaju",
    persen: 42,
    kkTotal: 260,
    kkOk: 109,
    tag: "Intervensi Khusus",
    kategori: "merah",
    ikon: "dangerous",
  },
  {
    id: "rt6",
    dusunId: "d3",
    nama: "RT 01 / RW 03",
    dusun: "Dusun 03 Harapan",
    persen: 88,
    kkTotal: 310,
    kkOk: 273,
    tag: "Kunci Suara Aman",
    kategori: "hijau",
    ikon: "verified",
  },
]

const SWING_HEATMAP = [
  {
    id: "sw1",
    dusunId: "d2",
    wilayah: "RT 03 / RW 02 (Sukamaju)",
    dpt: "420 DPT",
    ragu: "148 Jiwa (35%)",
    intensitas: "Kritis Tinggi",
    dotClass: "bg-status-lain-text",
    textClass: "text-status-lain-text",
    isu: "Bantuan pupuk & BPJS mandiri",
    aksi: "Serbu Kanvas",
  },
  {
    id: "sw2",
    dusunId: "d2",
    wilayah: "RT 02 / RW 02 (Sukamaju)",
    dpt: "380 DPT",
    ragu: "112 Jiwa (29%)",
    intensitas: "Moderat",
    dotClass: "bg-status-ragu-text",
    textClass: "text-status-ragu-text",
    isu: "Bansos beras & beasiswa pelajar",
    aksi: "Sambang Tokoh",
  },
  {
    id: "sw3",
    dusunId: "d1",
    wilayah: "RT 05 / RW 01 (Krajan)",
    dpt: "310 DPT",
    ragu: "86 Jiwa (27%)",
    intensitas: "Moderat",
    dotClass: "bg-status-ragu-text",
    textClass: "text-status-ragu-text",
    isu: "Jalan desa & lampu penerangan",
    aksi: "Sambang Tokoh",
  },
  {
    id: "sw4",
    dusunId: "d3",
    wilayah: "RT 04 / RW 03 (Harapan)",
    dpt: "290 DPT",
    ragu: "42 Jiwa (14%)",
    intensitas: "Rendah",
    dotClass: "bg-primary-container",
    textClass: "text-status-kita-text",
    isu: "Modal usaha mikro pedagang",
    aksi: "Kunci Suara",
  },
]

const INITIAL_INTEL = [
  {
    id: 1,
    judul: "Bagi Sembako Terselubung",
    waktu: "2 Jam lalu",
    tone: "merah",
    isi: "Terdeteksi logistik berupa minyak dan gula masuk ke RT 03 Dusun Sukamaju oleh tim paslon lawan.",
    pelapor: "Saksi TPS 03",
    tindakLanjut: "Verifikasi Tim Hukum",
  },
  {
    id: 2,
    judul: "Pemasangan Alat Peraga Tanpa Izin",
    waktu: "06:45 WIB",
    tone: "kuning",
    isi: "5 baliho besar menutupi titik stiker kita di gapura masuk RW 01 Dusun Krajan.",
    pelapor: "Kordes Krajan",
    tindakLanjut: "Instruksi Penertiban",
  },
]

export default function PemetaanTeritorialPage() {
  const [dusunCards, setDusunCards] = useState(INITIAL_DUSUN_CARDS)
  const [activeDusun, setActiveDusun] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [syncLoading, setSyncLoading] = useState(false)
  const [layers, setLayers] = useState({ kk: true, posko: true, swing: true })
  const [selectedRt, setSelectedRt] = useState(null)
  const [intelList, setIntelList] = useState(INITIAL_INTEL)
  const [showPoskoModal, setShowPoskoModal] = useState(false)
  const [showIntelModal, setShowIntelModal] = useState(false)
  const [poskoForm, setPoskoForm] = useState({
    nama: "",
    dusun: "Dusun 01 Krajan",
    rt: "RT 01",
    koordinator: "",
  })
  const [intelForm, setIntelForm] = useState({
    judul: "",
    lokasi: "RT 03 Dusun Sukamaju",
    isi: "",
    pelapor: "Tim Patroli Desa",
  })
  const [notice, setNotice] = useState("")

  useEffect(() => {
    fetchDusunFromSupabase()
  }, [])

  useEffect(() => {
    function handleEsc(e) {
      if (e.key === "Escape") {
        setSelectedRt(null)
        setShowPoskoModal(false)
        setShowIntelModal(false)
      }
    }
    window.addEventListener("keydown", handleEsc)
    return () => window.removeEventListener("keydown", handleEsc)
  }, [])

  async function fetchDusunFromSupabase() {
    if (!supabase) return
    setSyncLoading(true)
    try {
      const { data, error } = await supabase
        .from("dusun")
        .select("*")
        .order("id", { ascending: true })
      if (!error && data && data.length > 0) {
        setDusunCards((prev) =>
          prev.map((card, idx) => {
            const dbRow = data[idx]
            if (!dbRow) return card
            return {
              ...card,
              nama: dbRow.nama_dusun || card.nama,
              kordes: dbRow.kordes_nama || card.kordes,
              telepon: dbRow.kordes_wa || card.telepon,
            }
          }),
        )
      }
    } catch {
      // Gunakan data lokal apabila jaringan lambat
    } finally {
      setSyncLoading(false)
    }
  }

  function showBanner(msg) {
    setNotice(msg)
    setTimeout(() => setNotice(""), 3200)
  }

  function handleSavePosko(e) {
    e.preventDefault()
    if (!poskoForm.nama.trim()) return
    setShowPoskoModal(false)
    showBanner(
      `Posko "${poskoForm.nama}" di ${poskoForm.rt} (${poskoForm.dusun}) berhasil ditambahkan ke peta komando.`,
    )
    setPoskoForm({
      nama: "",
      dusun: "Dusun 01 Krajan",
      rt: "RT 01",
      koordinator: "",
    })
  }

  function handleSaveIntel(e) {
    e.preventDefault()
    if (!intelForm.judul.trim() || !intelForm.isi.trim()) return
    const newReport = {
      id: Date.now(),
      judul: intelForm.judul.trim(),
      waktu: "Baru saja",
      tone: "merah",
      isi: `${intelForm.isi.trim()} (Lokasi: ${intelForm.lokasi})`,
      pelapor: intelForm.pelapor.trim() || "Relawan Lapangan",
      tindakLanjut: "Teruskan ke Tim Hukum",
    }
    setIntelList((prev) => [newReport, ...prev])
    setShowIntelModal(false)
    setIntelForm({
      judul: "",
      lokasi: "RT 03 Dusun Sukamaju",
      isi: "",
      pelapor: "Tim Patroli Desa",
    })
    showBanner("Berita acara laporan pengawasan lapangan berhasil diterbitkan.")
  }

  const filteredDusunCards = useMemo(() => {
    return dusunCards.filter((d) => {
      const matchTab = activeDusun === "all" || d.id === activeDusun
      const q = searchQuery.toLowerCase().trim()
      const matchSearch =
        !q || `${d.nama} ${d.kordes} ${d.karakter}`.toLowerCase().includes(q)
      return matchTab && matchSearch
    })
  }, [dusunCards, activeDusun, searchQuery])

  const filteredRtClusters = useMemo(() => {
    return RT_CLUSTERS.filter((rt) => {
      const matchTab = activeDusun === "all" || rt.dusunId === activeDusun
      const q = searchQuery.toLowerCase().trim()
      const matchSearch =
        !q || `${rt.nama} ${rt.dusun} ${rt.tag}`.toLowerCase().includes(q)
      return matchTab && matchSearch
    })
  }, [activeDusun, searchQuery])

  const filteredHeatmap = useMemo(() => {
    return SWING_HEATMAP.filter((row) => {
      const matchTab = activeDusun === "all" || row.dusunId === activeDusun
      const q = searchQuery.toLowerCase().trim()
      const matchSearch =
        !q || `${row.wilayah} ${row.isu}`.toLowerCase().includes(q)
      return matchTab && matchSearch
    })
  }, [activeDusun, searchQuery])

  return (
    <WarRoomShell
      searchValue={searchQuery}
      onSearchChange={setSearchQuery}
      searchPlaceholder="Cari Dusun, RT, Kordes, atau Isu Warga..."
      onSyncClick={() => {
        fetchDusunFromSupabase()
        showBanner(
          "Peta teritorial dan titik koordinat posko telah disinkronkan.",
        )
      }}
      syncLoading={syncLoading}
    >
      <div className="flex flex-col w-full max-w-[1600px] mx-auto">
        <div className="w-full px-4 border-b shadow-sm bg-surface-card border-surface-border lg:px-margin py-space-md mb-space-lg">
          <div className="flex flex-wrap items-center justify-between gap-space-md">
            <div className="flex flex-col">
              <div className="flex items-center gap-space-xs text-primary font-label-sm text-label-sm">
                <span className="material-symbols-outlined text-[16px]">
                  location_on
                </span>
                <span>
                  WILAYAH STRATEGIS: KECAMATAN SEJAHTERA • KAMPUNG MAKMUR JAYA
                </span>
              </div>
              <h1 className="mt-1 tracking-tight font-headline-lg text-headline-lg text-on-surface">
                Pemetaan Geografis & Kekuatan Basis Suara Dusun
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-space-sm">
              <div className="inline-flex flex-wrap gap-1 p-1 rounded-lg bg-surface-container">
                {[
                  { id: "all", label: "Semua Dusun" },
                  { id: "d1", label: "Dusun 01 Krajan" },
                  { id: "d2", label: "Dusun 02 Sukamaju" },
                  { id: "d3", label: "Dusun 03 Harapan" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveDusun(tab.id)}
                    className={`min-h-[40px] px-space-md py-1.5 rounded-lg font-label-sm text-label-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                      activeDusun === tab.id
                        ? "bg-surface-card text-primary shadow-sm"
                        : "text-secondary hover:text-on-surface"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setShowPoskoModal(true)}
                className="min-h-[44px] px-space-md bg-primary text-on-primary font-label-md text-label-md rounded-lg flex items-center gap-space-xs shadow-sm hover:bg-primary-dark transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary"
              >
                <span className="material-symbols-outlined text-[18px]">
                  add_location_alt
                </span>
                <span>Pin Posko Baru</span>
              </button>

              <button
                type="button"
                onClick={() => window.print()}
                className="min-h-[44px] px-space-md bg-surface border border-surface-border text-on-surface font-label-md text-label-md rounded-lg flex items-center gap-space-xs shadow-sm hover:bg-surface-container transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <span className="material-symbols-outlined text-[18px] text-secondary">
                  file_download
                </span>
                <span>Ekspor Peta</span>
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col px-4 lg:px-margin gap-space-xl">
          {notice && (
            <div
              role="status"
              className="flex items-center gap-2 px-4 py-3 border bg-status-kita-bg border-status-kita-border text-status-kita-text rounded-xl font-label-md text-label-md"
            >
              <span className="material-symbols-outlined text-[20px]">
                check_circle
              </span>
              <span>{notice}</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
            <div className="flex flex-col overflow-hidden border shadow-sm lg:col-span-8 bg-surface-card border-surface-border rounded-xl">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b p-space-lg bg-surface-card border-surface-border">
                <div className="flex items-center gap-space-md">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-status-kita-bg text-status-kita-text">
                    <span className="material-symbols-outlined text-[22px]">
                      map
                    </span>
                  </div>
                  <div>
                    <h2 className="font-headline-sm text-headline-sm text-on-surface">
                      Peta Zonasi Digital & Titik Posko Komando
                    </h2>
                    <p className="font-body-sm text-body-sm text-secondary">
                      Sinkronisasi GPS Relawan Lapangan • Pemutakhiran Terakhir
                      12 Menit Lalu
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-space-xs bg-surface-container px-space-md py-1.5 rounded-lg text-secondary font-label-sm text-label-sm">
                  <span className="w-2 h-2 rounded-full bg-primary-container"></span>
                  <span>Pelacakan GPS Aktif</span>
                </div>
              </div>

              <div className="relative w-full min-h-[360px] bg-surface-container-low p-4 flex flex-col justify-between">
                <div className="grid grid-cols-1 gap-3 my-auto sm:grid-cols-3">
                  {filteredDusunCards.map((z) => (
                    <div
                      key={z.id}
                      onClick={() =>
                        setActiveDusun(z.id === activeDusun ? "all" : z.id)
                      }
                      className="flex flex-col justify-between gap-2 p-4 transition-all border shadow-sm cursor-pointer rounded-xl bg-surface-card border-surface-border hover:border-primary"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold font-label-sm text-label-sm text-primary">
                          {z.kode}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-bold ${z.badgeClass}`}
                        >
                          {z.persen}% Suara Kita
                        </span>
                      </div>
                      <div>
                        <h3 className="font-headline-sm text-headline-sm text-on-surface">
                          {z.nama}
                        </h3>
                        {layers.posko && (
                          <p className="font-body-sm text-body-sm text-secondary mt-0.5">
                            {z.infoPosko}
                          </p>
                        )}
                      </div>
                      {layers.kk && (
                        <div className="text-xs font-medium text-on-surface bg-surface-container-low px-2.5 py-1.5 rounded">
                          Realisasi: {z.suara} Suara (Target {z.target})
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap items-end justify-between gap-3 mt-4">
                  <div className="flex flex-col gap-1.5 bg-surface-card border border-surface-border px-space-md py-space-sm rounded-lg shadow-sm">
                    <span className="tracking-wider uppercase font-label-sm text-label-sm text-on-surface">
                      Status Lapisan Peta
                    </span>
                    <div className="flex flex-wrap gap-4 font-body-sm text-body-sm">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={layers.kk}
                          onChange={(e) =>
                            setLayers({ ...layers, kk: e.target.checked })
                          }
                          className="w-4 h-4 rounded accent-primary-container"
                        />
                        <span>Klaster Rumah Tangga (3.840 KK)</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={layers.posko}
                          onChange={(e) =>
                            setLayers({ ...layers, posko: e.target.checked })
                          }
                          className="w-4 h-4 rounded accent-primary-container"
                        />
                        <span>Posko Pemenangan (14)</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={layers.swing}
                          onChange={(e) =>
                            setLayers({ ...layers, swing: e.target.checked })
                          }
                          className="w-4 h-4 rounded accent-primary-container"
                        />
                        <span>Titik Rawan Swing Voters</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <div className="flex items-center gap-2 py-2 border rounded-lg shadow-sm bg-surface-card border-surface-border px-space-md">
                      <span className="w-3 h-3 rounded-full bg-primary-container"></span>
                      <span className="font-label-sm text-label-sm text-on-surface">
                        Dominan (&gt;65%)
                      </span>
                    </div>
                    <div className="flex items-center gap-2 py-2 border rounded-lg shadow-sm bg-surface-card border-surface-border px-space-md">
                      <span className="w-3 h-3 rounded-full bg-status-ragu-text"></span>
                      <span className="font-label-sm text-label-sm text-on-surface">
                        Ketat (45-65%)
                      </span>
                    </div>
                    <div className="flex items-center gap-2 py-2 border rounded-lg shadow-sm bg-surface-card border-surface-border px-space-md">
                      <span className="w-3 h-3 rounded-full bg-status-lain-text"></span>
                      <span className="font-label-sm text-label-sm text-on-surface">
                        Kritis (&lt;45%)
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 border-t sm:grid-cols-4 gap-space-sm p-space-md bg-surface-container-low border-surface-border">
                <div className="flex flex-col rounded-lg p-space-sm bg-surface-card">
                  <span className="font-body-sm text-body-sm text-secondary">
                    Total DPT Wilayah
                  </span>
                  <span className="font-headline-sm text-headline-sm text-on-surface">
                    9.450 Jiwa
                  </span>
                </div>
                <div className="flex flex-col rounded-lg p-space-sm bg-surface-card">
                  <span className="font-body-sm text-body-sm text-secondary">
                    Basis Terkunci (Kita)
                  </span>
                  <span className="font-headline-sm text-headline-sm text-status-kita-text">
                    6.710 (71.0%)
                  </span>
                </div>
                <div className="flex flex-col rounded-lg p-space-sm bg-surface-card">
                  <span className="font-body-sm text-body-sm text-secondary">
                    Swing Voters / Ragu
                  </span>
                  <span className="font-headline-sm text-headline-sm text-status-ragu-text">
                    1.890 (20.0%)
                  </span>
                </div>
                <div className="flex flex-col rounded-lg p-space-sm bg-surface-card">
                  <span className="font-body-sm text-body-sm text-secondary">
                    Calon Lawan
                  </span>
                  <span className="font-headline-sm text-headline-sm text-status-lain-text">
                    850 (9.0%)
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col lg:col-span-4 gap-space-md">
              {filteredDusunCards.map((d) => (
                <div
                  key={d.id}
                  className="flex flex-col justify-between border shadow-sm p-space-lg bg-surface-card border-surface-border rounded-xl"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span
                        className={`px-2 py-0.5 rounded font-label-sm text-label-sm uppercase tracking-wide ${d.badgeClass}`}
                      >
                        {d.zonaLabel}
                      </span>
                      <h3 className="mt-1 font-headline-sm text-headline-sm text-on-surface">
                        {d.nama}
                      </h3>
                      <p className="font-body-sm text-body-sm text-secondary">
                        {d.infoPosko}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="font-headline-lg text-headline-lg text-on-surface">
                        {d.persen}%
                      </div>
                      <div className="font-label-sm text-label-sm text-secondary">
                        {d.suara} Suara
                      </div>
                    </div>
                  </div>
                  <div className="w-full bg-surface-container rounded-full h-2.5 mt-3 overflow-hidden">
                    <div
                      className={`${d.barClass} h-full rounded-full`}
                      style={{ width: `${d.persen}%` }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between pt-2 mt-3 border-t font-label-sm text-label-sm text-secondary border-surface-border">
                    <span>Target: {d.target} Suara</span>
                    <span className="font-bold text-on-surface">
                      {d.selisihLabel}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <section className="flex flex-col border shadow-sm bg-surface-card border-surface-border rounded-xl p-space-lg">
            <div className="flex flex-wrap items-center justify-between gap-space-md mb-space-lg">
              <div className="flex items-center gap-space-md">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-status-kita-bg text-status-kita-text">
                  <span className="material-symbols-outlined text-[22px]">
                    grid_view
                  </span>
                </div>
                <div>
                  <h2 className="font-headline-sm text-headline-sm text-on-surface">
                    Peta Visual Grid Wilayah RT & Klaster Door-to-Door
                  </h2>
                  <p className="font-body-sm text-body-sm text-secondary">
                    Klik klaster RT untuk melihat progres canvassing relawan dan
                    penetrasi rumah tangga
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-space-sm bg-surface-container px-space-md py-1.5 rounded-lg flex-wrap">
                <span className="font-label-sm text-label-sm text-status-kita-text">
                  &gt;70% Basis Kita
                </span>
                <span>•</span>
                <span className="font-label-sm text-label-sm text-status-ragu-text">
                  50-69% Tarung
                </span>
                <span>•</span>
                <span className="font-label-sm text-label-sm text-status-lain-text">
                  &lt;50% Lawan
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-space-md">
              {filteredRtClusters.map((rt) => {
                const boxTone =
                  rt.kategori === "hijau"
                    ? "bg-status-kita-bg border-status-kita-border text-status-kita-text"
                    : rt.kategori === "kuning"
                      ? "bg-status-ragu-bg border-status-ragu-border text-status-ragu-text"
                      : "bg-status-lain-bg border-status-lain-border text-status-lain-text"

                return (
                  <button
                    key={rt.id}
                    type="button"
                    onClick={() => setSelectedRt(rt)}
                    className={`p-space-md rounded-xl border flex flex-col gap-2 text-left hover:shadow-md transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${boxTone}`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-label-sm text-label-sm">
                        {rt.nama}
                      </span>
                      <span className="material-symbols-outlined text-[16px]">
                        {rt.ikon}
                      </span>
                    </div>
                    <div className="font-headline-sm text-headline-sm">
                      {rt.persen}%
                    </div>
                    <div className="flex justify-between w-full font-body-sm text-body-sm text-on-surface">
                      <span>{rt.kkTotal} KK</span>
                      <span className="font-semibold">{rt.kkOk} OK</span>
                    </div>
                    <div className="text-[11px] font-label-sm px-2 py-0.5 rounded bg-surface-card text-on-surface text-center w-full">
                      {rt.tag}
                    </div>
                  </button>
                )
              })}
            </div>

            {selectedRt && (
              <div className="flex flex-wrap items-center justify-between gap-3 border mt-space-md p-space-md rounded-xl bg-surface-container-low border-surface-border">
                <div>
                  <span className="font-label-md text-label-md text-on-surface">
                    Detail Klaster {selectedRt.nama} ({selectedRt.dusun})
                  </span>
                  <p className="font-body-sm text-body-sm text-secondary">
                    Terdata {selectedRt.kkOk} dari {selectedRt.kkTotal} Kepala
                    Keluarga ({selectedRt.persen}% mendukung H. Rahmat Hidayat).
                    Status: {selectedRt.tag}.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedRt(null)}
                  className="min-h-[44px] px-3 bg-surface-card border border-surface-border rounded-lg font-label-sm text-label-sm"
                >
                  Tutup Detail RT
                </button>
              </div>
            )}
          </section>

          <section className="flex flex-col gap-space-md">
            <div>
              <h2 className="font-headline-md text-headline-md text-on-surface">
                Analisis Wilayah & Manajemen Kordes
              </h2>
              <p className="font-body-sm text-body-sm text-secondary">
                Struktur kepemimpinan lapangan, target kuantitatif, dan
                penetrasi canvassing teritorial
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-space-lg">
              {filteredDusunCards.map((d) => (
                <article
                  key={d.id}
                  className="flex flex-col overflow-hidden border shadow-sm bg-surface-card border-surface-border rounded-xl"
                >
                  <div className="flex flex-col flex-1 p-space-lg">
                    <div className="flex items-center justify-between mb-space-md">
                      <span
                        className={`px-2.5 py-1 rounded-full font-label-sm text-label-sm font-bold ${d.badgeClass}`}
                      >
                        {d.zonaLabel}
                      </span>
                      <span className="font-label-sm text-label-sm text-secondary">
                        Target: {d.target}
                      </span>
                    </div>
                    <h3 className="mb-1 font-headline-sm text-headline-sm text-on-surface">
                      {d.nama}
                    </h3>
                    <p className="font-body-sm text-body-sm text-secondary mb-space-md">
                      {d.karakter}
                    </p>

                    <div className="flex flex-col gap-1 mb-space-lg">
                      <div className="flex justify-between font-label-sm text-label-sm">
                        <span className="text-on-surface">
                          Realisasi Canvassing
                        </span>
                        <span className="font-bold text-primary-container">
                          {d.realisasiPct} ({d.suara} Suara)
                        </span>
                      </div>
                      <div className="w-full h-2 overflow-hidden rounded-full bg-surface-container">
                        <div
                          className={`${d.barClass} h-full rounded-full`}
                          style={{ width: `${Math.min(100, d.persen + 15)}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="flex items-center p-space-md bg-surface-container-low rounded-xl gap-space-md mb-space-md">
                      <div className="flex items-center justify-center w-12 h-12 font-bold rounded-full bg-primary-container text-on-primary shrink-0">
                        {d.kode}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-label-md text-label-md text-on-surface">
                          {d.kordes}
                        </span>
                        <span className="font-body-sm text-body-sm text-secondary">
                          Kordes Penanggung Jawab
                        </span>
                        <span className="font-label-sm text-label-sm text-primary-container mt-0.5">
                          {d.teleponTampil}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-space-sm">
                      <div className="rounded-lg p-space-sm bg-surface-container-low">
                        <div className="font-body-sm text-body-sm text-secondary">
                          Total RT
                        </div>
                        <div className="font-headline-sm text-headline-sm text-on-surface">
                          {d.totalRt}
                        </div>
                      </div>
                      <div className="rounded-lg p-space-sm bg-surface-container-low">
                        <div className="font-body-sm text-body-sm text-secondary">
                          Prioritas
                        </div>
                        <div className="font-label-md text-label-md text-on-surface">
                          {d.prioritas}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t p-space-md bg-surface-container border-surface-border">
                    <span className="font-label-sm text-label-sm text-secondary">
                      {d.statusOperasi}
                    </span>
                    <a
                      href={`https://wa.me/${d.telepon}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="min-h-[44px] px-space-md py-2 bg-primary text-on-primary font-label-sm text-label-sm rounded-lg flex items-center gap-1 hover:bg-primary-dark transition-colors"
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        chat
                      </span>
                      <span>Hubungi Kordes</span>
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg mb-space-xl">
            <div className="flex flex-col border shadow-sm lg:col-span-8 bg-surface-card border-surface-border rounded-xl p-space-lg">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-space-md">
                <div className="flex items-center gap-space-md">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-status-ragu-bg text-status-ragu-text">
                    <span className="material-symbols-outlined text-[22px]">
                      radar
                    </span>
                  </div>
                  <div>
                    <h2 className="font-headline-sm text-headline-sm text-on-surface">
                      Peta Panas (Heatmap) Swing Voters di RT Rawan
                    </h2>
                    <p className="font-body-sm text-body-sm text-secondary">
                      Fokus persuasi dari pintu ke pintu bagi warga yang belum
                      menentukan pilihan
                    </p>
                  </div>
                </div>
                <span className="py-1 font-semibold border rounded px-space-sm bg-status-ragu-bg border-status-ragu-border text-status-ragu-text font-label-sm text-label-sm">
                  1.890 Warga Belum Bersikap
                </span>
              </div>

              <div className="w-full mt-2 overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-container font-label-sm text-label-sm text-secondary">
                      <th className="py-space-md px-space-md">
                        RT / Dusun Rawan
                      </th>
                      <th className="py-space-md px-space-md">Populasi DPT</th>
                      <th className="py-space-md px-space-md">Ragu (Swing)</th>
                      <th className="py-space-md px-space-md">Intensitas</th>
                      <th className="py-space-md px-space-md">
                        Isu Dominan Warga
                      </th>
                      <th className="text-right py-space-md px-space-md">
                        Tindakan Cepat
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y font-body-sm text-body-sm divide-surface-border">
                    {filteredHeatmap.map((row) => (
                      <tr
                        key={row.id}
                        className="hover:bg-surface-container-low"
                      >
                        <td className="py-space-md px-space-md font-label-md text-on-surface">
                          {row.wilayah}
                        </td>
                        <td className="py-space-md px-space-md text-secondary">
                          {row.dpt}
                        </td>
                        <td className="font-bold py-space-md px-space-md text-status-ragu-text">
                          {row.ragu}
                        </td>
                        <td className="py-space-md px-space-md">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`w-3 h-3 rounded-full ${row.dotClass}`}
                            ></span>
                            <span
                              className={`font-label-sm font-bold ${row.textClass}`}
                            >
                              {row.intensitas}
                            </span>
                          </div>
                        </td>
                        <td className="py-space-md px-space-md text-secondary">
                          {row.isu}
                        </td>
                        <td className="text-right py-space-md px-space-md">
                          <button
                            type="button"
                            onClick={() =>
                              showBanner(
                                `Tim relawan ditugaskan untuk ${row.aksi} di ${row.wilayah}.`,
                              )
                            }
                            className="min-h-[40px] px-3 py-1.5 bg-primary text-on-primary rounded-lg font-label-sm text-label-sm hover:bg-primary-dark"
                          >
                            {row.aksi}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex flex-col justify-between border shadow-sm lg:col-span-4 bg-surface-card border-surface-border rounded-xl p-space-lg">
              <div>
                <div className="flex items-center justify-between mb-space-md">
                  <div className="flex items-center gap-space-sm">
                    <span className="material-symbols-outlined text-[20px] text-tertiary">
                      warning_amber
                    </span>
                    <h2 className="font-headline-sm text-headline-sm text-on-surface">
                      Intelijen Pergerakan Lawan
                    </h2>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded bg-tertiary-fixed text-on-tertiary-fixed-variant font-label-sm">
                    {intelList.length} Laporan
                  </span>
                </div>

                <div className="flex flex-col gap-space-md">
                  {intelList.map((item) => (
                    <div
                      key={item.id}
                      className="flex flex-col gap-1 border p-space-md bg-surface-container-low border-surface-border rounded-xl"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold font-label-sm text-label-sm text-status-lain-text">
                          {item.judul}
                        </span>
                        <span className="font-body-sm text-[12px] text-secondary">
                          {item.waktu}
                        </span>
                      </div>
                      <p className="font-body-sm text-body-sm text-on-surface">
                        {item.isi}
                      </p>
                      <div className="flex items-center justify-between pt-1">
                        <span className="font-label-sm text-[12px] text-secondary">
                          Pelapor: {item.pelapor}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            showBanner(
                              `Status "${item.judul}" diteruskan untuk ${item.tindakLanjut}.`,
                            )
                          }
                          className="text-primary-container font-semibold text-[12px] hover:underline"
                        >
                          {item.tindakLanjut}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between border-t mt-space-lg pt-space-md border-surface-border">
                <span className="font-label-sm text-label-sm text-on-surface">
                  Temukan Pelanggaran Lapangan?
                </span>
                <button
                  type="button"
                  onClick={() => setShowIntelModal(true)}
                  className="min-h-[44px] px-space-md py-2 bg-tertiary text-on-tertiary font-label-sm text-label-sm rounded-lg hover:bg-tertiary-container transition-colors"
                >
                  Buat Berita Acara
                </button>
              </div>
            </div>
          </div>
        </div>

        {showPoskoModal && (
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-inverse-surface/60 backdrop-blur-sm"
          >
            <form
              onSubmit={handleSavePosko}
              className="flex flex-col w-full max-w-md gap-3 border shadow-2xl bg-surface-card border-surface-border rounded-2xl p-space-lg"
            >
              <h3 className="font-headline-sm text-headline-sm text-on-surface">
                Pin Titik Posko Pemenangan Baru
              </h3>
              <label className="font-label-sm text-secondary">
                Nama Posko Relawan
                <input
                  type="text"
                  required
                  placeholder="Contoh: Posko Induk RT 04 Krajan"
                  value={poskoForm.nama}
                  onChange={(e) =>
                    setPoskoForm({ ...poskoForm, nama: e.target.value })
                  }
                  className="w-full min-h-[44px] px-3 mt-1 bg-surface border border-surface-border rounded-lg text-on-surface"
                />
              </label>
              <div className="grid grid-cols-2 gap-2">
                <label className="font-label-sm text-secondary">
                  Wilayah Dusun
                  <select
                    value={poskoForm.dusun}
                    onChange={(e) =>
                      setPoskoForm({ ...poskoForm, dusun: e.target.value })
                    }
                    className="w-full min-h-[44px] px-3 mt-1 bg-surface border border-surface-border rounded-lg text-on-surface"
                  >
                    <option value="Dusun 01 Krajan">Dusun 01 Krajan</option>
                    <option value="Dusun 02 Sukamaju">Dusun 02 Sukamaju</option>
                    <option value="Dusun 03 Harapan">Dusun 03 Harapan</option>
                  </select>
                </label>
                <label className="font-label-sm text-secondary">
                  RT Lokasi
                  <input
                    type="text"
                    value={poskoForm.rt}
                    onChange={(e) =>
                      setPoskoForm({ ...poskoForm, rt: e.target.value })
                    }
                    className="w-full min-h-[44px] px-3 mt-1 bg-surface border border-surface-border rounded-lg text-on-surface"
                  />
                </label>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPoskoModal(false)}
                  className="min-h-[44px] px-4 bg-surface-container rounded-lg font-label-md"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="min-h-[44px] px-4 bg-primary text-on-primary rounded-lg font-label-md"
                >
                  Simpan Titik Posko
                </button>
              </div>
            </form>
          </div>
        )}

        {showIntelModal && (
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-inverse-surface/60 backdrop-blur-sm"
          >
            <form
              onSubmit={handleSaveIntel}
              className="flex flex-col w-full max-w-md gap-3 border shadow-2xl bg-surface-card border-surface-border rounded-2xl p-space-lg"
            >
              <h3 className="font-headline-sm text-headline-sm text-on-surface">
                Buat Berita Acara Pengawasan Lawan
              </h3>
              <label className="font-label-sm text-secondary">
                Judul Temuan
                <input
                  type="text"
                  required
                  placeholder="Contoh: Pembagian Amplop Malam Hari"
                  value={intelForm.judul}
                  onChange={(e) =>
                    setIntelForm({ ...intelForm, judul: e.target.value })
                  }
                  className="w-full min-h-[44px] px-3 mt-1 bg-surface border border-surface-border rounded-lg text-on-surface"
                />
              </label>
              <label className="font-label-sm text-secondary">
                Lokasi Kejadian
                <input
                  type="text"
                  required
                  value={intelForm.lokasi}
                  onChange={(e) =>
                    setIntelForm({ ...intelForm, lokasi: e.target.value })
                  }
                  className="w-full min-h-[44px] px-3 mt-1 bg-surface border border-surface-border rounded-lg text-on-surface"
                />
              </label>
              <label className="font-label-sm text-secondary">
                Kronologi Singkat
                <textarea
                  rows={3}
                  required
                  placeholder="Jelaskan waktu, saksi, dan bukti temuan di lapangan..."
                  value={intelForm.isi}
                  onChange={(e) =>
                    setIntelForm({ ...intelForm, isi: e.target.value })
                  }
                  className="w-full p-3 mt-1 border rounded-lg resize-none bg-surface border-surface-border text-on-surface"
                />
              </label>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowIntelModal(false)}
                  className="min-h-[44px] px-4 bg-surface-container rounded-lg font-label-md"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="min-h-[44px] px-4 bg-tertiary text-on-tertiary rounded-lg font-label-md"
                >
                  Terbitkan Berita Acara
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </WarRoomShell>
  )
}
