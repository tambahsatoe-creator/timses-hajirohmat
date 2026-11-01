"use client"

import { useState, useEffect, useMemo } from "react"
import MobileNav from "@/components/MobileNav"
import { supabase } from "@/lib/supabase"

const INITIAL_VISITORS = [
  {
    id: "v1",
    no_dpt: "#042",
    nama_lengkap: "Ahmad Supardi",
    rt: "RT 02",
    sudah_coblos: false,
    waktu_coblos: null,
  },
  {
    id: "v2",
    no_dpt: "#018",
    nama_lengkap: "Siti Aminah",
    rt: "RT 01",
    sudah_coblos: false,
    waktu_coblos: null,
  },
  {
    id: "v3",
    no_dpt: "#031",
    nama_lengkap: "Hartono Mulyo",
    rt: "RT 02",
    sudah_coblos: true,
    waktu_coblos: "08:45 WIB",
  },
  {
    id: "v4",
    no_dpt: "#055",
    nama_lengkap: "Budi Prasetyo",
    rt: "RT 03",
    sudah_coblos: true,
    waktu_coblos: "09:12 WIB",
  },
]

export default function SaksiTpsPage() {
  const [activeTab, setActiveTab] = useState("realcount")
  const [visitors, setVisitors] = useState(INITIAL_VISITORS)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterHadir, setFilterHadir] = useState("all")
  const [namaPengunjungBaru, setNamaPengunjungBaru] = useState("")
  const [rtPengunjungBaru, setRtPengunjungBaru] = useState("RT 01")

  const [tallyForm, setTallyForm] = useState({
    kode_tps: "TPS 01",
    paslon1: 145,
    paslon2: 38,
    paslon3: 22,
    tidakSah: 3,
  })
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState("")

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    if (!supabase) return
    try {
      const { data: vData } = await supabase
        .from("pemilih")
        .select("*")
        .order("sudah_coblos", { ascending: true })
      if (vData && vData.length > 0) setVisitors(vData)

      const { data: tData } = await supabase
        .from("tps")
        .select("*")
        .eq("kode_tps", tallyForm.kode_tps)
        .maybeSingle()
      if (tData) {
        setTallyForm((prev) => ({
          ...prev,
          paslon1: tData.suara_paslon_1 ?? prev.paslon1,
          paslon2: tData.suara_paslon_2 ?? prev.paslon2,
          paslon3: tData.suara_paslon_3 ?? prev.paslon3,
          tidakSah: tData.suara_tidak_sah ?? prev.tidakSah,
        }))
      }
    } catch {
      // Gunakan data lokal jika koneksi terputus
    }
  }

  function showNotice(msg) {
    setNotice(msg)
    setTimeout(() => setNotice(""), 3000)
  }

  async function handleSaveRealCount(e) {
    e.preventDefault()
    setSaving(true)
    try {
      if (supabase) {
        await supabase
          .from("tps")
          .update({
            suara_paslon_1: Number(tallyForm.paslon1) || 0,
            suara_paslon_2: Number(tallyForm.paslon2) || 0,
            suara_paslon_3: Number(tallyForm.paslon3) || 0,
            suara_tidak_sah: Number(tallyForm.tidakSah) || 0,
          })
          .eq("kode_tps", tallyForm.kode_tps)
      }
      showNotice(
        `Data Suara Real Count ${tallyForm.kode_tps} berhasil disimpan.`,
      )
    } finally {
      setSaving(false)
    }
  }

  async function handleToggleHadir(visitor) {
    const now = new Date()
    const jam = `${String(now.getHours()).padStart(2, "0")}:${String(
      now.getMinutes(),
    ).padStart(2, "0")} WIB`
    const nextState = !visitor.sudah_coblos

    setVisitors((prev) =>
      prev.map((v) =>
        v.id === visitor.id
          ? {
              ...v,
              sudah_coblos: nextState,
              waktu_coblos: nextState ? jam : null,
            }
          : v,
      ),
    )

    if (supabase && String(visitor.id).length > 8) {
      await supabase
        .from("pemilih")
        .update({
          sudah_coblos: nextState,
          waktu_coblos: nextState ? jam : null,
        })
        .eq("id", visitor.id)
    }
    showNotice(
      nextState
        ? `${visitor.nama_lengkap} ditandai SUDAH HADIR di TPS.`
        : `Status kehadiran ${visitor.nama_lengkap} dibatalkan.`,
    )
  }

  async function handleAddVisitor(e) {
    e.preventDefault()
    if (!namaPengunjungBaru.trim()) return
    const now = new Date()
    const jam = `${String(now.getHours()).padStart(2, "0")}:${String(
      now.getMinutes(),
    ).padStart(2, "0")} WIB`

    const newEntry = {
      id: `local-${Date.now()}`,
      no_dpt: `#${Math.floor(100 + Math.random() * 899)}`,
      nama_lengkap: namaPengunjungBaru.trim(),
      nama_kk: namaPengunjungBaru.trim(),
      dusun: "Dusun 01 Krajan",
      rt: rtPengunjungBaru,
      tps: tallyForm.kode_tps,
      status_dukungan: "hijau",
      sudah_coblos: true,
      waktu_coblos: jam,
    }

    setVisitors((prev) => [newEntry, ...prev])
    setNamaPengunjungBaru("")
    showNotice(
      `Pengunjung TPS "${newEntry.nama_lengkap}" berhasil dicatat hadir.`,
    )

    if (supabase) {
      const { id, ...dbPayload } = newEntry
      await supabase.from("pemilih").insert([dbPayload])
    }
  }

  const totalSuaraSah =
    (Number(tallyForm.paslon1) || 0) +
    (Number(tallyForm.paslon2) || 0) +
    (Number(tallyForm.paslon3) || 0)

  const filteredVisitors = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    return visitors.filter((v) => {
      if (filterHadir === "hadir" && !v.sudah_coblos) return false
      if (filterHadir === "belum" && v.sudah_coblos) return false
      return (
        !q ||
        `${v.nama_lengkap} ${v.rt} ${v.no_dpt || ""}`.toLowerCase().includes(q)
      )
    })
  }, [visitors, filterHadir, searchQuery])

  return (
    <div className="flex flex-col min-h-screen bg-bg-base font-body-md text-on-surface">
      <header className="fixed inset-x-0 top-0 z-40 border-b bg-surface-card border-surface-border pt-safe">
        <div className="flex items-center justify-between max-w-lg px-4 mx-auto h-14">
          <div className="flex items-center gap-2">
            <span className="font-bold font-headline-sm text-on-surface">
              DASHBOARD TIM SAKSI
            </span>
            <span className="px-2 py-0.5 rounded-full bg-status-kita-bg text-status-kita-text font-label-sm text-xs">
              {tallyForm.kode_tps}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setActiveTab("realcount")}
              className={`min-h-[36px] px-2.5 rounded-lg text-xs font-bold ${
                activeTab === "realcount"
                  ? "bg-primary text-on-primary"
                  : "bg-surface-container text-secondary"
              }`}
            >
              Realcount
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("pengunjung")}
              className={`min-h-[36px] px-2.5 rounded-lg text-xs font-bold ${
                activeTab === "pengunjung"
                  ? "bg-primary text-on-primary"
                  : "bg-surface-container text-secondary"
              }`}
            >
              Pengunjung
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-lg px-4 pt-16 mx-auto pb-28">
        {notice && (
          <div
            role="status"
            className="mb-3 bg-status-kita-bg border border-status-kita-border text-status-kita-text px-3.5 py-2.5 rounded-xl flex items-center gap-2 text-xs font-bold"
          >
            <span className="material-symbols-outlined text-[18px]">
              check_circle
            </span>
            <span>{notice}</span>
          </div>
        )}

        {activeTab === "realcount" ? (
          <section className="flex flex-col gap-4 p-4 mt-2 border shadow-sm bg-surface-card border-surface-border rounded-2xl">
            <div className="pb-3 border-b border-surface-border">
              <h1 className="font-headline-sm text-headline-sm text-on-surface">
                Menu 1: Input Suara Real Count TPS
              </h1>
              <p className="text-xs text-secondary mt-0.5">
                Masukkan hasil penghitungan suara sah dan tidak sah dari
                formulir C-Hasil Plano.
              </p>
            </div>

            <form
              onSubmit={handleSaveRealCount}
              className="flex flex-col gap-3.5"
            >
              <div>
                <label className="block mb-1 text-xs font-label-sm text-secondary">
                  Pilih Lokasi TPS Tugas
                </label>
                <select
                  value={tallyForm.kode_tps}
                  onChange={(e) =>
                    setTallyForm({ ...tallyForm, kode_tps: e.target.value })
                  }
                  className="w-full min-h-[44px] px-3 bg-surface border border-surface-border rounded-xl font-bold text-on-surface"
                >
                  <option value="TPS 01">TPS 01 Krajan Barat</option>
                  <option value="TPS 02">TPS 02 Krajan Timur</option>
                  <option value="TPS 03">TPS 03 Sukamaju</option>
                  <option value="TPS 04">TPS 04 Harapan Makmur</option>
                </select>
              </div>

              <div className="p-3.5 rounded-xl bg-status-kita-bg border border-status-kita-border">
                <label className="block mb-1 text-sm font-bold font-label-md text-status-kita-text">
                  01. H. Rahmat Hidayat (Calon Kita)
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={tallyForm.paslon1}
                  onChange={(e) =>
                    setTallyForm({ ...tallyForm, paslon1: e.target.value })
                  }
                  className="w-full min-h-[48px] px-3 bg-surface-card border border-status-kita-border rounded-xl font-headline-md text-status-kita-text"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 border rounded-xl bg-surface-container-low border-surface-border">
                  <label className="block mb-1 text-xs font-bold font-label-sm text-on-surface">
                    02. Drs. Bambang
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={tallyForm.paslon2}
                    onChange={(e) =>
                      setTallyForm({ ...tallyForm, paslon2: e.target.value })
                    }
                    className="w-full min-h-[44px] px-3 bg-surface-card border border-surface-border rounded-lg font-bold text-on-surface"
                  />
                </div>

                <div className="p-3 border rounded-xl bg-surface-container-low border-surface-border">
                  <label className="block mb-1 text-xs font-bold font-label-sm text-on-surface">
                    03. Hj. Ratna Sari
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={tallyForm.paslon3}
                    onChange={(e) =>
                      setTallyForm({ ...tallyForm, paslon3: e.target.value })
                    }
                    className="w-full min-h-[44px] px-3 bg-surface-card border border-surface-border rounded-lg font-bold text-on-surface"
                  />
                </div>
              </div>

              <div className="p-3 border rounded-xl bg-status-lain-bg/50 border-status-lain-border">
                <label className="block mb-1 text-xs font-bold font-label-sm text-status-lain-text">
                  Suara Tidak Sah / Rusak
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={tallyForm.tidakSah}
                  onChange={(e) =>
                    setTallyForm({ ...tallyForm, tidakSah: e.target.value })
                  }
                  className="w-full min-h-[44px] px-3 bg-surface-card border border-status-lain-border rounded-lg font-bold text-status-lain-text"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container">
                <span className="text-xs font-semibold text-secondary">
                  Total Suara Sah Masuk:
                </span>
                <span className="font-bold font-headline-sm text-on-surface">
                  {totalSuaraSah} Suara
                </span>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full min-h-[48px] bg-primary-container hover:bg-primary-dark text-on-primary font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-sm"
              >
                <span className="material-symbols-outlined text-[20px]">
                  save
                </span>
                <span>
                  {saving ? "Menyimpan..." : "Simpan Suara Real Count"}
                </span>
              </button>
            </form>
          </section>
        ) : (
          <div className="flex flex-col gap-3 mt-2">
            <section className="p-4 border shadow-sm bg-surface-card border-surface-border rounded-2xl">
              <h1 className="font-headline-sm text-headline-sm text-on-surface">
                Menu 2: Daftar Pengunjung TPS
              </h1>
              <p className="text-xs text-secondary mt-0.5 mb-3">
                Catat dan centang warga yang hadir mencoblos di{" "}
                {tallyForm.kode_tps}.
              </p>

              <form onSubmit={handleAddVisitor} className="flex gap-2">
                <input
                  type="text"
                  value={namaPengunjungBaru}
                  onChange={(e) => setNamaPengunjungBaru(e.target.value)}
                  placeholder="Tambah nama pengunjung hadir..."
                  className="flex-1 min-h-[44px] px-3 bg-surface border border-surface-border rounded-xl text-sm"
                />
                <select
                  value={rtPengunjungBaru}
                  onChange={(e) => setRtPengunjungBaru(e.target.value)}
                  className="min-h-[44px] px-2 bg-surface border border-surface-border rounded-xl text-xs font-bold"
                >
                  <option value="RT 01">RT 01</option>
                  <option value="RT 02">RT 02</option>
                  <option value="RT 03">RT 03</option>
                </select>
                <button
                  type="submit"
                  className="min-h-[44px] px-3 bg-primary text-on-primary rounded-xl text-xs font-bold shrink-0"
                >
                  + Hadir
                </button>
              </form>
            </section>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama pengunjung TPS..."
                className="flex-1 min-h-[44px] px-3.5 bg-surface-card border border-surface-border rounded-xl text-sm"
              />
              <select
                value={filterHadir}
                onChange={(e) => setFilterHadir(e.target.value)}
                className="min-h-[44px] px-3 bg-surface-card border border-surface-border rounded-xl text-xs font-bold"
              >
                <option value="all">Semua ({visitors.length})</option>
                <option value="hadir">
                  Hadir ({visitors.filter((v) => v.sudah_coblos).length})
                </option>
                <option value="belum">
                  Belum ({visitors.filter((v) => !v.sudah_coblos).length})
                </option>
              </select>
            </div>

            <section className="flex flex-col gap-2">
              {filteredVisitors.map((v) => (
                <article
                  key={v.id}
                  className="bg-surface-card border border-surface-border rounded-xl p-3.5 flex items-center justify-between gap-2 shadow-sm"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h2 className="font-bold truncate font-label-lg text-on-surface">
                        {v.nama_lengkap}
                      </h2>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                          v.sudah_coblos
                            ? "bg-status-kita-bg text-status-kita-text"
                            : "bg-status-ragu-bg text-status-ragu-text"
                        }`}
                      >
                        {v.sudah_coblos ? "Sudah Hadir" : "Belum Hadir"}
                      </span>
                    </div>
                    <p className="text-xs text-secondary mt-0.5">
                      {v.rt} • {v.no_dpt || "#DPT"}{" "}
                      {v.waktu_coblos ? `• Pukul ${v.waktu_coblos}` : ""}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleHadir(v)}
                    className={`min-h-[44px] px-3.5 rounded-xl text-xs font-bold flex items-center gap-1 shrink-0 transition-colors ${
                      v.sudah_coblos
                        ? "bg-surface-container text-secondary"
                        : "bg-primary text-on-primary"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      {v.sudah_coblos ? "check_circle" : "how_to_reg"}
                    </span>
                    <span>{v.sudah_coblos ? "Tercatat" : "Tandai Hadir"}</span>
                  </button>
                </article>
              ))}
            </section>
          </div>
        )}
      </main>

      <MobileNav activeSaksiTab={activeTab} onChangeSaksiTab={setActiveTab} />
    </div>
  )
}
