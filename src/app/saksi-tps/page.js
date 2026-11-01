"use client"

import { useState, useEffect, useMemo } from "react"
import MobileNav from "@/components/MobileNav"
import { supabase } from "@/lib/supabase"

const INITIAL_DPT_LIST = [
  {
    id: "dpt-1",
    no_dpt: "#042",
    nama_lengkap: "Ahmad Supardi",
    rt: "RT 02",
    jumlah_anggota_kk: 3,
    nomor_wa: "6281234567890",
    status_dukungan: "hijau",
    sudah_coblos: false,
    waktu_coblos: null,
  },
  {
    id: "dpt-2",
    no_dpt: "#018",
    nama_lengkap: "Siti Aminah",
    rt: "RT 01",
    jumlah_anggota_kk: 2,
    nomor_wa: "6285298765432",
    status_dukungan: "kuning",
    sudah_coblos: false,
    waktu_coblos: null,
  },
  {
    id: "dpt-3",
    no_dpt: "#031",
    nama_lengkap: "Hartono Mulyo",
    rt: "RT 02",
    jumlah_anggota_kk: 4,
    nomor_wa: "6281988776655",
    status_dukungan: "hijau",
    sudah_coblos: true,
    waktu_coblos: "08:45 WIB",
  },
  {
    id: "dpt-4",
    no_dpt: "#055",
    nama_lengkap: "Budi Prasetyo",
    rt: "RT 03",
    jumlah_anggota_kk: 1,
    nomor_wa: "6287711223344",
    status_dukungan: "merah",
    sudah_coblos: true,
    waktu_coblos: "09:12 WIB",
  },
]

export default function SaksiTpsPage() {
  const [voters, setVoters] = useState(INITIAL_DPT_LIST)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterTab, setFilterTab] = useState("all")
  const [showRealCountModal, setShowRealCountModal] = useState(false)
  const [tallyForm, setTallyForm] = useState({
    paslon1: 145,
    paslon2: 38,
    paslon3: 22,
    tidakSah: 3,
  })
  const [notice, setNotice] = useState("")

  useEffect(() => {
    loadTpsVoters()
  }, [])

  async function loadTpsVoters() {
    if (!supabase) return
    try {
      const { data, error } = await supabase
        .from("pemilih")
        .select("*")
        .order("sudah_coblos", { ascending: true })
      if (!error && data && data.length > 0) {
        setVoters(data)
      }
    } catch {
      // Gunakan daftar cadangan jika jaringan terputus
    }
  }

  async function handleMarkVoted(voterId) {
    const now = new Date()
    const jam = `${String(now.getHours()).padStart(2, "0")}:${String(
      now.getMinutes(),
    ).padStart(2, "0")} WIB`

    setVoters((prev) =>
      prev.map((v) =>
        v.id === voterId ? { ...v, sudah_coblos: true, waktu_coblos: jam } : v,
      ),
    )

    if (supabase) {
      await supabase
        .from("pemilih")
        .update({ sudah_coblos: true, waktu_coblos: jam })
        .eq("id", voterId)
    }

    setNotice("Kehadiran pemilih berhasil dicatat di TPS 01.")
    setTimeout(() => setNotice(""), 2500)
  }

  async function handleSaveRealCount(e) {
    e.preventDefault()
    if (supabase) {
      await supabase
        .from("tps")
        .update({
          suara_paslon_1: Number(tallyForm.paslon1),
          suara_paslon_2: Number(tallyForm.paslon2),
          suara_paslon_3: Number(tallyForm.paslon3),
          suara_tidak_sah: Number(tallyForm.tidakSah),
        })
        .eq("kode_tps", "TPS 01")
    }
    setShowRealCountModal(false)
    setNotice("Angka Real Count TPS 01 berhasil dikirim ke War Room.")
    setTimeout(() => setNotice(""), 3000)
  }

  function handleShareUnvoted() {
    const belumList = voters
      .filter((v) => !v.sudah_coblos)
      .map((v) => `- ${v.nama_lengkap} (${v.rt})`)
      .join("%0A")
    const text = `Daftar Pemilih TPS 01 Belum Hadir:%0A${belumList || "Semua sudah hadir"}`
    window.open(`https://wa.me/?text=${text}`, "_blank")
  }

  const stats = useMemo(() => {
    const totalDpt = 142
    const hadir = 96 + voters.filter((v) => v.sudah_coblos).length
    const belum = Math.max(0, totalDpt - hadir)
    const kitaCount = voters.filter((v) => v.status_dukungan === "hijau").length
    return { totalDpt, hadir, belum, kitaCount }
  }, [voters])

  const filteredList = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    return voters.filter((v) => {
      if (filterTab === "belum" && v.sudah_coblos) return false
      if (filterTab === "sudah" && !v.sudah_coblos) return false
      if (filterTab === "kita" && v.status_dukungan !== "hijau") return false
      const pool =
        `${v.nama_lengkap} ${v.rt} ${v.no_dpt || ""} ${v.nomor_wa || ""}`.toLowerCase()
      return !q || pool.includes(q)
    })
  }, [voters, filterTab, searchQuery])

  function getInitials(name = "") {
    return name
      .split(" ")
      .slice(0, 2)
      .map((w) => w[0])
      .join("")
      .toUpperCase()
  }

  return (
    <div className="flex flex-col min-h-screen bg-bg-base font-body-md text-on-surface">
      <header className="fixed inset-x-0 top-0 z-40 border-b bg-surface-card/95 backdrop-blur-md border-surface-border pt-safe">
        <div className="flex items-center justify-between max-w-lg mx-auto h-14 px-margin-mobile gap-space-sm">
          <div className="flex items-center min-w-0 gap-space-sm">
            <span className="font-bold tracking-tight font-headline-sm text-headline-sm text-on-surface">
              MY TPS
            </span>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-status-kita-bg border border-status-kita-border text-status-kita-text font-label-sm text-label-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-primary-container"></span>
              <span>TPS 01</span>
            </div>
          </div>
          <div className="flex items-center gap-space-sm shrink-0">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-low">
              <span className="w-2 h-2 rounded-full bg-primary"></span>
              <span className="font-medium font-label-sm text-label-sm text-on-surface-variant">
                Online
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="flex flex-col flex-1 w-full max-w-lg pt-16 mx-auto pb-28 px-margin-mobile">
        {notice && (
          <div
            role="status"
            className="mb-3 bg-status-kita-bg border border-status-kita-border text-status-kita-text px-3.5 py-2.5 rounded-xl flex items-center gap-2 font-label-sm text-label-sm"
          >
            <span className="material-symbols-outlined text-[18px]">
              check_circle
            </span>
            <span>{notice}</span>
          </div>
        )}

        <section className="w-full p-4 mb-3 border shadow-sm bg-surface-card border-surface-border rounded-2xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="relative shrink-0">
              <div className="flex items-center justify-center text-lg font-bold rounded-full w-14 h-14 bg-primary-container text-on-primary">
                FS
              </div>
              <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-primary rounded-full border-2 border-surface-card"></span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h1 className="truncate font-headline-sm text-headline-sm text-on-surface">
                  Fajar Sidiq
                </h1>
                <span className="material-symbols-outlined text-[18px] text-primary">
                  verified
                </span>
              </div>
              <div className="inline-flex items-center gap-1 mt-0.5 px-2 py-0.5 bg-surface-container-low rounded-full">
                <span className="material-symbols-outlined text-[14px] text-primary">
                  pin_drop
                </span>
                <span className="truncate font-label-sm text-label-sm text-secondary">
                  Saksi TPS 01 • Dusun Krajan
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-1 py-2.5 bg-bg-base rounded-xl mb-3 text-center">
            <div className="flex flex-col items-center justify-center px-1">
              <span className="font-headline-sm text-headline-sm text-on-surface">
                {stats.totalDpt}
              </span>
              <span className="font-label-sm text-label-sm text-secondary">
                Total DPT
              </span>
            </div>
            <div className="flex flex-col items-center justify-center px-1">
              <span className="font-headline-sm text-headline-sm text-primary">
                {stats.hadir}
              </span>
              <span className="font-label-sm text-label-sm text-secondary">
                Hadir
              </span>
            </div>
            <div className="flex flex-col items-center justify-center px-1">
              <span className="font-headline-sm text-headline-sm text-status-ragu-text">
                {stats.belum}
              </span>
              <span className="font-label-sm text-label-sm text-secondary">
                Belum
              </span>
            </div>
            <div className="flex flex-col items-center justify-center px-1">
              <span className="font-headline-sm text-headline-sm text-primary-container">
                86%
              </span>
              <span className="font-label-sm text-label-sm text-secondary">
                Suara Kita
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setShowRealCountModal(true)}
              className="min-h-[44px] px-3 bg-primary-container hover:bg-primary-dark text-on-primary font-label-md text-label-md rounded-xl shadow-sm flex items-center justify-center gap-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <span className="material-symbols-outlined text-[18px]">
                bolt
              </span>
              <span className="truncate">+ Real Count</span>
            </button>
            <button
              type="button"
              onClick={handleShareUnvoted}
              className="min-h-[44px] px-3 bg-surface-card hover:bg-bg-base border border-surface-border text-on-surface font-label-md text-label-md rounded-xl shadow-sm flex items-center justify-center gap-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <span className="material-symbols-outlined text-[18px] text-status-kita-text">
                share
              </span>
              <span className="truncate">Bagikan Belum</span>
            </button>
          </div>
        </section>

        <section className="w-full mb-3 space-y-2">
          <div className="relative w-full">
            <label htmlFor="saksiSearch" className="sr-only">
              Cari pemilih atau nomor HP
            </label>
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-secondary text-[20px]">
              search
            </span>
            <input
              id="saksiSearch"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari pemilih atau no HP..."
              className="w-full min-h-[44px] pl-10 pr-4 bg-surface-card border border-surface-border rounded-xl text-on-surface placeholder:text-secondary font-body-md text-body-md shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
            <button
              type="button"
              onClick={() => setFilterTab("all")}
              className={`shrink-0 min-h-[44px] px-3.5 rounded-full font-label-sm text-label-sm flex items-center gap-1 transition-colors ${
                filterTab === "all"
                  ? "bg-primary-container text-on-primary"
                  : "bg-surface-card border border-surface-border text-secondary"
              }`}
            >
              <span>Semua ({voters.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setFilterTab("belum")}
              className={`shrink-0 min-h-[44px] px-3.5 rounded-full font-label-sm text-label-sm flex items-center gap-1.5 transition-colors ${
                filterTab === "belum"
                  ? "bg-status-ragu-bg border border-status-ragu-border text-status-ragu-text"
                  : "bg-surface-card border border-surface-border text-secondary"
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-status-ragu-text"></span>
              <span>
                Belum Hadir ({voters.filter((v) => !v.sudah_coblos).length})
              </span>
            </button>
            <button
              type="button"
              onClick={() => setFilterTab("sudah")}
              className={`shrink-0 min-h-[44px] px-3.5 rounded-full font-label-sm text-label-sm flex items-center gap-1 transition-colors ${
                filterTab === "sudah"
                  ? "bg-primary-container text-on-primary"
                  : "bg-surface-card border border-surface-border text-secondary"
              }`}
            >
              <span>
                Sudah Coblos ({voters.filter((v) => v.sudah_coblos).length})
              </span>
            </button>
            <button
              type="button"
              onClick={() => setFilterTab("kita")}
              className={`shrink-0 min-h-[44px] px-3.5 rounded-full font-label-sm text-label-sm flex items-center gap-1 transition-colors ${
                filterTab === "kita"
                  ? "bg-primary-container text-on-primary"
                  : "bg-surface-card border border-surface-border text-secondary"
              }`}
            >
              <span>Pemilih Kita ({stats.kitaCount})</span>
            </button>
          </div>
        </section>

        <div className="flex items-center justify-between px-1 mb-2">
          <div className="flex items-center gap-1.5">
            <span className="font-label-md text-label-md text-on-surface">
              Daftar Kawal Hadir
            </span>
            <span className="font-normal font-label-sm text-label-sm text-secondary">
              (Prioritas Belum Hadir)
            </span>
          </div>
          <span className="font-semibold font-label-sm text-label-sm text-primary">
            Urut No. DPT
          </span>
        </div>

        <section className="w-full mb-3 space-y-2">
          {filteredList.map((voter) => (
            <article
              key={voter.id}
              className={`w-full bg-surface-card border border-surface-border rounded-2xl shadow-sm p-3.5 flex items-center justify-between gap-2.5 transition-all ${
                voter.sudah_coblos ? "opacity-90" : ""
              }`}
            >
              <div className="flex items-center min-w-0 gap-3">
                <div className="relative shrink-0">
                  <div
                    className={`w-11 h-11 rounded-full font-label-md text-label-md flex items-center justify-center ${
                      voter.sudah_coblos
                        ? "bg-surface-container text-secondary"
                        : "bg-status-ragu-bg text-status-ragu-text"
                    }`}
                  >
                    {getInitials(voter.nama_lengkap)}
                  </div>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h2 className="truncate font-label-lg text-label-lg text-on-surface">
                      {voter.nama_lengkap}
                    </h2>
                    {voter.sudah_coblos ? (
                      <span className="shrink-0 px-2 py-0.5 bg-status-kita-bg border border-status-kita-border text-status-kita-text rounded-full font-label-sm text-label-sm leading-none flex items-center gap-0.5">
                        <span className="material-symbols-outlined text-[12px]">
                          check
                        </span>
                        <span>Sudah Coblos</span>
                      </span>
                    ) : (
                      <span className="shrink-0 px-2 py-0.5 bg-status-ragu-bg border border-status-ragu-border text-status-ragu-text rounded-full font-label-sm text-label-sm leading-none">
                        Belum Hadir
                      </span>
                    )}
                  </div>
                  <p className="font-body-sm text-body-sm text-secondary truncate mt-0.5">
                    {voter.jumlah_anggota_kk || 1} Warga • {voter.rt} •{" "}
                    {voter.sudah_coblos
                      ? `Jam ${voter.waktu_coblos || "09:00 WIB"}`
                      : `No. DPT ${voter.no_dpt || "#042"}`}
                  </p>
                </div>
              </div>

              {voter.sudah_coblos ? (
                <div className="flex items-center justify-center rounded-full w-11 h-11 bg-status-kita-bg text-status-kita-text shrink-0">
                  <span className="material-symbols-outlined text-[22px]">
                    check_circle
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 shrink-0">
                  <a
                    aria-label={`Ingatkan ${voter.nama_lengkap} via WhatsApp`}
                    href={`https://wa.me/${(voter.nomor_wa || "6281234567890").replace(/^0/, "62")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="min-w-[44px] min-h-[44px] rounded-xl bg-status-kita-bg text-status-kita-text flex items-center justify-center hover:bg-status-kita-border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      chat
                    </span>
                  </a>
                  <button
                    type="button"
                    onClick={() => handleMarkVoted(voter.id)}
                    className="min-h-[44px] px-3 bg-primary hover:bg-primary-dark text-on-primary rounded-xl font-label-sm text-label-sm flex items-center gap-1 shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      check
                    </span>
                    <span>Coblos</span>
                  </button>
                </div>
              )}
            </article>
          ))}
        </section>

        <section className="w-full bg-surface-card border border-surface-border rounded-2xl shadow-sm p-3.5">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="material-symbols-outlined text-primary text-[18px]">
                flag
              </span>
              <span className="truncate font-label-md text-label-md text-on-surface">
                Target TPS 01: 120 Suara
              </span>
            </div>
            <span className="font-bold font-label-md text-label-md text-primary shrink-0">
              {Math.min(100, Math.round((stats.hadir / 120) * 100))}%
            </span>
          </div>
          <div className="w-full h-2.5 bg-surface-container rounded-full overflow-hidden mb-1.5">
            <div
              className="h-full transition-all duration-300 rounded-full bg-primary-container"
              style={{ width: `${Math.min(100, (stats.hadir / 120) * 100)}%` }}
            ></div>
          </div>
          <div className="flex items-center justify-between text-secondary font-body-sm text-body-sm">
            <span>Terpenuhi {stats.hadir} suara</span>
            <span>Sisa {Math.max(0, 120 - stats.hadir)} suara lagi</span>
          </div>
        </section>
      </main>

      {showRealCountModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-realcount-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-inverse-surface/60"
        >
          <div className="flex flex-col w-full max-w-sm gap-3 p-4 border shadow-xl bg-surface-card border-surface-border rounded-2xl">
            <div className="flex items-center justify-between">
              <h2
                id="modal-realcount-title"
                className="font-headline-sm text-headline-sm text-on-surface"
              >
                Input Real Count TPS 01
              </h2>
              <button
                type="button"
                onClick={() => setShowRealCountModal(false)}
                aria-label="Tutup dialog"
                className="min-w-[44px] min-h-[44px] rounded-lg flex items-center justify-center text-secondary hover:text-on-surface"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form
              onSubmit={handleSaveRealCount}
              className="flex flex-col gap-3"
            >
              <div>
                <label className="block mb-1 font-label-sm text-label-sm text-status-kita-text">
                  01. H. Rahmat Hidayat (Kita)
                </label>
                <input
                  type="number"
                  value={tallyForm.paslon1}
                  onChange={(e) =>
                    setTallyForm({ ...tallyForm, paslon1: e.target.value })
                  }
                  className="w-full min-h-[44px] px-3 bg-status-kita-bg border border-status-kita-border rounded-lg font-bold text-status-kita-text"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block mb-1 font-label-sm text-label-sm text-secondary">
                    02. Drs. Bambang
                  </label>
                  <input
                    type="number"
                    value={tallyForm.paslon2}
                    onChange={(e) =>
                      setTallyForm({ ...tallyForm, paslon2: e.target.value })
                    }
                    className="w-full min-h-[44px] px-3 bg-surface border border-surface-border rounded-lg text-on-surface"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-label-sm text-label-sm text-secondary">
                    03. Hj. Ratna Sari
                  </label>
                  <input
                    type="number"
                    value={tallyForm.paslon3}
                    onChange={(e) =>
                      setTallyForm({ ...tallyForm, paslon3: e.target.value })
                    }
                    className="w-full min-h-[44px] px-3 bg-surface border border-surface-border rounded-lg text-on-surface"
                  />
                </div>
              </div>
              <div>
                <label className="block mb-1 font-label-sm text-label-sm text-status-lain-text">
                  Suara Tidak Sah
                </label>
                <input
                  type="number"
                  value={tallyForm.tidakSah}
                  onChange={(e) =>
                    setTallyForm({ ...tallyForm, tidakSah: e.target.value })
                  }
                  className="w-full min-h-[44px] px-3 bg-surface border border-surface-border rounded-lg text-on-surface"
                />
              </div>
              <button
                type="submit"
                className="w-full min-h-[48px] bg-primary-container hover:bg-primary-dark text-on-primary font-label-md text-label-md rounded-xl mt-1"
              >
                Kirim Hasil C-Plano ke War Room
              </button>
            </form>
          </div>
        </div>
      )}

      <MobileNav />
    </div>
  )
}
