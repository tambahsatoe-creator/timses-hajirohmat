"use client"

import { useState, useEffect } from "react"
import WarRoomShell from "@/components/WarRoomShell"
import { supabase } from "@/lib/supabase"

const INITIAL_CANDIDATES = [
  {
    id: 1,
    nomor_urut: "01",
    nama_lengkap: "H. Rahmat Hidayat",
    peran_label: "Petahana / Tokoh Masyarakat",
    status_kandidat: "KANDIDAT KITA",
    slogan: "Kader Inklusif, Membangun Desa Mandiri & Sejahtera",
  },
  {
    id: 2,
    nomor_urut: "02",
    nama_lengkap: "Drs. Bambang Suryono",
    peran_label: "Penantang (Purn. ASN)",
    status_kandidat: "KANDIDAT LAWAN",
    slogan: "Gerakan Perubahan Bersama Mengabdi Rakyat",
  },
  {
    id: 3,
    nomor_urut: "03",
    nama_lengkap: "Hj. Ratna Sari",
    peran_label: "Penantang (Tokoh UMKM)",
    status_kandidat: "KANDIDAT LAWAN",
    slogan: "Pemberdayaan UMKM & Perempuan Desa",
  },
]

const INITIAL_DUSUN_CONFIG = [
  {
    id: 1,
    kode_dusun: "D1",
    nama_dusun: "Dusun 01 Krajan",
    kordes_nama: "Hendra Gunawan",
    kordes_wa: "6281298440001",
    target_suara: 280,
    total_dpt: 310,
  },
  {
    id: 2,
    kode_dusun: "D2",
    nama_dusun: "Dusun 02 Sukamaju",
    kordes_nama: "Ridwan Kamiludin",
    kordes_wa: "6282144320002",
    target_suara: 210,
    total_dpt: 260,
  },
  {
    id: 3,
    kode_dusun: "D3",
    nama_dusun: "Dusun 03 Harapan",
    kordes_nama: "Siti Nurhaliza",
    kordes_wa: "6285711920003",
    target_suara: 160,
    total_dpt: 240,
  },
]

const INITIAL_USERS = [
  {
    id: "u1",
    login_id: "admin",
    nama_lengkap: "Ketua Timses Inti",
    peran: "admin",
    wilayah: "Kampung Makmur Jaya",
    tps_kode: "ALL",
    nomor_wa: "6281234567890",
    aktif: true,
  },
  {
    id: "u2",
    login_id: "081234567890",
    nama_lengkap: "Andi Wijaya",
    peran: "relawan",
    wilayah: "Dusun 01 Krajan",
    tps_kode: "TPS 01",
    nomor_wa: "6281234567890",
    aktif: true,
  },
  {
    id: "u3",
    login_id: "saksi01",
    nama_lengkap: "Fajar Sidiq",
    peran: "saksi",
    wilayah: "Dusun 01 Krajan",
    tps_kode: "TPS 01",
    nomor_wa: "6281244519921",
    aktif: true,
  },
  {
    id: "u4",
    login_id: "saksi02",
    nama_lengkap: "Budi Santoso",
    peran: "saksi",
    wilayah: "Dusun 01 Krajan",
    tps_kode: "TPS 02",
    nomor_wa: "6285277112094",
    aktif: true,
  },
]

export default function MasterKonfigurasiPage() {
  const [candidates, setCandidates] = useState(INITIAL_CANDIDATES)
  const [dusunList, setDusunList] = useState(INITIAL_DUSUN_CONFIG)
  const [users, setUsers] = useState(INITIAL_USERS)
  const [hotlineWa, setHotlineWa] = useState("6281234567890")
  const [searchQuery, setSearchQuery] = useState("")
  const [syncLoading, setSyncLoading] = useState(false)
  const [showAddUserModal, setShowAddUserModal] = useState(false)
  const [showAddCandidateModal, setShowAddCandidateModal] = useState(false)
  const [editingCandidate, setEditingCandidate] = useState(null)
  const [newUserForm, setNewUserForm] = useState({
    login_id: "",
    kata_sandi: "rohmat01",
    nama_lengkap: "",
    peran: "relawan",
    wilayah: "Dusun 01 Krajan",
    tps_kode: "TPS 01",
    nomor_wa: "",
  })
  const [newCandidateForm, setNewCandidateForm] = useState({
    nomor_urut: "04",
    nama_lengkap: "",
    status_kandidat: "KANDIDAT LAWAN",
    slogan: "",
  })
  const [toast, setToast] = useState("")

  useEffect(() => {
    loadMasterData()
  }, [])

  useEffect(() => {
    function handleEsc(e) {
      if (e.key === "Escape") {
        setShowAddUserModal(false)
        setShowAddCandidateModal(false)
        setEditingCandidate(null)
      }
    }
    window.addEventListener("keydown", handleEsc)
    return () => window.removeEventListener("keydown", handleEsc)
  }, [])

  async function loadMasterData() {
    if (!supabase) return
    setSyncLoading(true)
    try {
      const [kandRes, dusunRes, userRes] = await Promise.all([
        supabase
          .from("kandidat")
          .select("*")
          .order("nomor_urut", { ascending: true }),
        supabase.from("dusun").select("*").order("id", { ascending: true }),
        supabase
          .from("pengguna")
          .select("*")
          .order("created_at", { ascending: false }),
      ])

      if (!kandRes.error && kandRes.data?.length > 0) {
        setCandidates(kandRes.data)
      }
      if (!dusunRes.error && dusunRes.data?.length > 0) {
        setDusunList(dusunRes.data)
      }
      if (!userRes.error && userRes.data?.length > 0) {
        setUsers(userRes.data)
      }
    } catch {
      // Gunakan konfigurasi cadangan lokal bila jaringan terputus
    } finally {
      setSyncLoading(false)
    }
  }

  function triggerToast(msg) {
    setToast(msg)
    setTimeout(() => setToast(""), 3200)
  }

  function exportConfigJson() {
    const payload = {
      exported_at: new Date().toISOString(),
      hotline_wa: hotlineWa,
      kandidat: candidates,
      dusun: dusunList,
      pengguna: users,
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "mytps-master-config-backup.json"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    triggerToast("Berkas cadangan konfigurasi JSON berhasil diunduh.")
  }

  async function handleSaveAllSystem() {
    if (supabase) {
      for (const d of dusunList) {
        await supabase
          .from("dusun")
          .update({
            kordes_nama: d.kordes_nama,
            kordes_wa: d.kordes_wa,
            target_suara: Number(d.target_suara) || 0,
          })
          .eq("id", d.id)
      }
    }
    triggerToast("Perubahan master konfigurasi berhasil disimpan ke database.")
  }

  async function handleCreateUser(e) {
    e.preventDefault()
    if (!newUserForm.login_id.trim() || !newUserForm.nama_lengkap.trim()) return

    const payload = {
      login_id: newUserForm.login_id.trim(),
      kata_sandi: newUserForm.kata_sandi.trim() || "rohmat01",
      nama_lengkap: newUserForm.nama_lengkap.trim(),
      peran: newUserForm.peran,
      wilayah: newUserForm.wilayah,
      tps_kode: newUserForm.tps_kode,
      nomor_wa: newUserForm.nomor_wa.trim() || hotlineWa,
      aktif: true,
    }

    if (supabase) {
      const { data, error } = await supabase
        .from("pengguna")
        .insert([payload])
        .select()
      if (!error && data?.[0]) {
        setUsers((prev) => [data[0], ...prev])
      } else {
        setUsers((prev) => [{ id: `local-${Date.now()}`, ...payload }, ...prev])
      }
    } else {
      setUsers((prev) => [{ id: `local-${Date.now()}`, ...payload }, ...prev])
    }

    setShowAddUserModal(false)
    setNewUserForm({
      login_id: "",
      kata_sandi: "rohmat01",
      nama_lengkap: "",
      peran: "relawan",
      wilayah: "Dusun 01 Krajan",
      tps_kode: "TPS 01",
      nomor_wa: "",
    })
    triggerToast(
      `Akun ${payload.nama_lengkap} (${payload.login_id}) berhasil didaftarkan.`,
    )
  }

  async function handleCreateCandidate(e) {
    e.preventDefault()
    if (!newCandidateForm.nama_lengkap.trim()) return

    const payload = {
      nomor_urut: newCandidateForm.nomor_urut.trim(),
      nama_lengkap: newCandidateForm.nama_lengkap.trim(),
      status_kandidat: newCandidateForm.status_kandidat,
      slogan: newCandidateForm.slogan.trim() || "Membangun Kampung Makmur Jaya",
    }

    if (supabase) {
      const { data, error } = await supabase
        .from("kandidat")
        .insert([payload])
        .select()
      if (!error && data?.[0]) {
        setCandidates((prev) => [...prev, data[0]])
      } else {
        setCandidates((prev) => [...prev, { id: Date.now(), ...payload }])
      }
    } else {
      setCandidates((prev) => [...prev, { id: Date.now(), ...payload }])
    }

    setShowAddCandidateModal(false)
    setNewCandidateForm({
      nomor_urut: "04",
      nama_lengkap: "",
      status_kandidat: "KANDIDAT LAWAN",
      slogan: "",
    })
    triggerToast(`Data calon ${payload.nama_lengkap} berhasil ditambahkan.`)
  }

  async function handleUpdateCandidate(e) {
    e.preventDefault()
    if (!editingCandidate) return

    setCandidates((prev) =>
      prev.map((c) => (c.id === editingCandidate.id ? editingCandidate : c)),
    )

    if (supabase && editingCandidate.id) {
      await supabase
        .from("kandidat")
        .update({
          nama_lengkap: editingCandidate.nama_lengkap,
          slogan: editingCandidate.slogan,
        })
        .eq("id", editingCandidate.id)
    }

    setEditingCandidate(null)
    triggerToast(
      `Data kandidat ${editingCandidate.nama_lengkap} berhasil diperbarui.`,
    )
  }

  function handleDusunChange(id, field, val) {
    setDusunList((prev) =>
      prev.map((d) => (d.id === id ? { ...d, [field]: val } : d)),
    )
  }

  async function toggleUserActive(user) {
    const nextState = !user.aktif
    setUsers((prev) =>
      prev.map((u) => (u.id === user.id ? { ...u, aktif: nextState } : u)),
    )
    if (supabase && String(user.id).length > 8) {
      await supabase
        .from("pengguna")
        .update({ aktif: nextState })
        .eq("id", user.id)
    }
    triggerToast(
      `Status akun ${user.nama_lengkap} diubah menjadi ${nextState ? "Aktif" : "Nonaktif"}.`,
    )
  }

  const totalTargetSuara = dusunList.reduce(
    (sum, d) => sum + (Number(d.target_suara) || 0),
    0,
  )

  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase().trim()
    if (!q) return true
    return `${u.nama_lengkap} ${u.login_id} ${u.peran} ${u.wilayah}`
      .toLowerCase()
      .includes(q)
  })

  return (
    <WarRoomShell
      searchValue={searchQuery}
      onSearchChange={setSearchQuery}
      searchPlaceholder="Cari Nama Akun, ID Login, atau Wilayah..."
      onSyncClick={loadMasterData}
      syncLoading={syncLoading}
    >
      <div className="px-4 lg:px-space-xl py-space-xl flex flex-col w-full max-w-[1600px] mx-auto">
        {toast && (
          <div
            role="status"
            className="flex items-center gap-2 px-4 py-3 border mb-space-lg bg-status-kita-bg border-status-kita-border text-status-kita-text rounded-xl font-label-md text-label-md"
          >
            <span className="material-symbols-outlined text-[20px]">
              verified
            </span>
            <span>{toast}</span>
          </div>
        )}

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-space-lg mb-space-xl">
          <div>
            <div className="inline-flex items-center py-1 border rounded gap-space-xs px-space-sm bg-status-kita-bg border-status-kita-border text-status-kita-text font-label-sm text-label-sm mb-space-xs">
              <span className="material-symbols-outlined text-[16px]">
                verified_user
              </span>
              <span>HAK AKSES KHUSUS • MASTER ADMIN</span>
            </div>
            <h1 className="tracking-tight font-headline-lg text-headline-lg text-on-surface">
              Master Konfigurasi, Manajemen Wilayah & Akun Tim
            </h1>
            <p className="mt-1 font-body-md text-body-md text-on-surface-variant">
              Pusat kendali pengaturan basis data calon, penetapan target menang
              per dusun, alokasi TPS, dan registrasi akun timses.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-space-sm">
            <button
              type="button"
              onClick={exportConfigJson}
              className="flex items-center gap-space-xs min-h-[44px] px-space-md rounded-lg bg-surface-card border border-surface-border text-on-surface font-label-md text-label-md hover:bg-surface-container transition-colors shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">
                download
              </span>
              <span>Ekspor Cadangan (JSON)</span>
            </button>
            <button
              type="button"
              onClick={() => setShowAddUserModal(true)}
              className="flex items-center gap-space-xs min-h-[44px] px-space-md rounded-lg bg-surface-card border border-surface-border text-on-surface font-label-md text-label-md hover:bg-surface-container transition-colors shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">
                person_add
              </span>
              <span>+ Tambah Akun Baru</span>
            </button>
            <button
              type="button"
              onClick={handleSaveAllSystem}
              className="flex items-center gap-space-xs min-h-[44px] px-space-lg rounded-lg bg-primary-container text-on-primary font-label-md text-label-md hover:bg-primary-dark transition-colors shadow-sm"
            >
              <span className="material-symbols-outlined text-[20px]">
                save
              </span>
              <span>Simpan Perubahan Sistem</span>
            </button>
          </div>
        </div>

        <section
          aria-label="Ringkasan Konfigurasi"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-lg mb-space-xl"
        >
          <div className="flex items-start border shadow-sm bg-surface-card border-surface-border rounded-xl p-space-lg gap-space-md">
            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-surface-container-low text-primary-container shrink-0">
              <span className="material-symbols-outlined text-[26px]">
                groups
              </span>
            </div>
            <div>
              <span className="block uppercase font-label-sm text-label-sm text-on-surface-variant">
                Total Kandidat
              </span>
              <span className="font-headline-md text-headline-md text-on-surface">
                {candidates.length} Paslon
              </span>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                1 Calon Utama • {Math.max(0, candidates.length - 1)} Penantang
              </p>
            </div>
          </div>

          <div className="flex items-start border shadow-sm bg-surface-card border-surface-border rounded-xl p-space-lg gap-space-md">
            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-surface-container-low text-primary-container shrink-0">
              <span className="material-symbols-outlined text-[26px]">
                apartment
              </span>
            </div>
            <div>
              <span className="block uppercase font-label-sm text-label-sm text-on-surface-variant">
                Dusun Terdaftar
              </span>
              <span className="font-headline-md text-headline-md text-on-surface">
                {dusunList.length} Dusun
              </span>
              <p className="font-body-sm text-body-sm text-status-kita-text mt-0.5">
                Total Target: {totalTargetSuara} Suara Menang
              </p>
            </div>
          </div>

          <div className="flex items-start border shadow-sm bg-surface-card border-surface-border rounded-xl p-space-lg gap-space-md">
            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-surface-container-low text-primary-container shrink-0">
              <span className="material-symbols-outlined text-[26px]">
                where_to_vote
              </span>
            </div>
            <div>
              <span className="block uppercase font-label-sm text-label-sm text-on-surface-variant">
                TPS Terpasang
              </span>
              <span className="font-headline-md text-headline-md text-on-surface">
                4 Titik TPS
              </span>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                4/4 Saksi Mandat Siap
              </p>
            </div>
          </div>

          <div className="flex items-start border shadow-sm bg-surface-card border-surface-border rounded-xl p-space-lg gap-space-md">
            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-surface-container-low text-primary-container shrink-0">
              <span className="material-symbols-outlined text-[26px]">
                badge
              </span>
            </div>
            <div>
              <span className="block uppercase font-label-sm text-label-sm text-on-surface-variant">
                Total Akun Pengguna
              </span>
              <span className="font-headline-md text-headline-md text-on-surface">
                {users.length} Akun
              </span>
              <p className="font-body-sm text-body-sm text-status-kita-text mt-0.5">
                {users.filter((u) => u.aktif).length} Akun Aktif
              </p>
            </div>
          </div>
        </section>

        <section className="border shadow-sm bg-surface-card border-surface-border rounded-xl p-space-lg mb-space-xl">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-space-sm mb-space-lg">
            <div className="flex items-center gap-space-sm">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-surface-container text-primary-container">
                <span className="material-symbols-outlined text-[20px]">
                  how_to_reg
                </span>
              </div>
              <div>
                <h2 className="font-headline-sm text-headline-sm text-on-surface">
                  Master Calon Kepala Kampung & Penantang
                </h2>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Konfigurasi nomor urut, slogan, dan identitas pasangan calon
                  Pilkades.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowAddCandidateModal(true)}
              className="flex items-center gap-space-xs min-h-[44px] px-space-md rounded-lg bg-surface-container-low border border-surface-border text-on-surface font-label-md text-label-md hover:bg-surface-container transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">
                add_circle
              </span>
              <span>+ Tambah Calon Baru</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-space-lg">
            {candidates.map((calon) => {
              const isKita = calon.status_kandidat === "KANDIDAT KITA"
              return (
                <article
                  key={calon.id || calon.nomor_urut}
                  className="flex flex-col justify-between border shadow-sm rounded-xl p-space-lg bg-surface-container-lowest border-surface-border"
                >
                  <div>
                    <div className="flex items-center justify-between gap-space-sm mb-space-md">
                      <span className="font-headline-md text-headline-md text-primary-container">
                        {calon.nomor_urut}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 px-space-sm py-1 rounded font-label-sm text-label-sm ${
                          isKita
                            ? "bg-status-kita-bg text-status-kita-text"
                            : "bg-status-lain-bg text-status-lain-text"
                        }`}
                      >
                        <span className="material-symbols-outlined text-[14px]">
                          {isKita ? "stars" : "flag"}
                        </span>
                        <span>{calon.status_kandidat}</span>
                      </span>
                    </div>

                    <h3 className="font-headline-sm text-headline-sm text-on-surface">
                      {calon.nama_lengkap}
                    </h3>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5 mb-space-md">
                      {calon.peran_label || "Peserta Sah Pilkades"}
                    </p>

                    <div className="rounded-lg p-space-sm bg-surface-container-low mb-space-md">
                      <span className="block uppercase font-label-sm text-label-sm text-on-surface-variant">
                        Slogan Kampanye
                      </span>
                      <p className="font-body-sm text-body-sm text-on-surface mt-0.5">
                        {calon.slogan}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t pt-space-sm border-surface-border">
                    <span className="font-body-sm text-body-sm text-on-surface-variant">
                      Terdaftar di 4 TPS
                    </span>
                    <button
                      type="button"
                      onClick={() => setEditingCandidate({ ...calon })}
                      className="flex items-center gap-1 min-h-[40px] px-space-sm rounded-lg text-primary-container font-label-sm text-label-sm hover:bg-surface-container transition-colors"
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        edit
                      </span>
                      <span>Edit Data</span>
                    </button>
                  </div>
                </article>
              )
            })}
          </div>
        </section>

        <section className="border shadow-sm bg-surface-card border-surface-border rounded-xl p-space-lg mb-space-xl">
          <div className="flex flex-col justify-between sm:flex-row sm:items-center gap-space-sm mb-space-lg">
            <div>
              <h2 className="font-headline-sm text-headline-sm text-on-surface">
                Target Suara Dusun & Hotline Darurat War Room
              </h2>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Sesuaikan kuota target kemenangan tiap dusun dan nomor WhatsApp
                Admin Pusat.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <label
                htmlFor="hotline-wa"
                className="font-label-sm text-label-sm text-secondary"
              >
                WA Hotline Admin:
              </label>
              <input
                id="hotline-wa"
                type="tel"
                value={hotlineWa}
                onChange={(e) => setHotlineWa(e.target.value)}
                className="min-h-[44px] px-3 bg-surface border border-surface-border rounded-lg font-mono text-sm text-on-surface"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
            {dusunList.map((d) => (
              <div
                key={d.id}
                className="flex flex-col gap-3 border p-space-md rounded-xl bg-surface-container-low border-surface-border"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold font-label-lg text-label-lg text-on-surface">
                    {d.nama_dusun}
                  </span>
                  <span className="font-label-sm text-label-sm bg-surface-card px-2 py-0.5 rounded text-secondary">
                    DPT: {d.total_dpt}
                  </span>
                </div>
                <label className="font-label-sm text-label-sm text-secondary">
                  Nama Koordinator Dusun (Kordes)
                  <input
                    type="text"
                    value={d.kordes_nama || ""}
                    onChange={(e) =>
                      handleDusunChange(d.id, "kordes_nama", e.target.value)
                    }
                    className="w-full min-h-[44px] px-3 mt-1 bg-surface-card border border-surface-border rounded-lg text-on-surface"
                  />
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <label className="font-label-sm text-label-sm text-secondary">
                    Target Suara Menang
                    <input
                      type="number"
                      value={d.target_suara}
                      onChange={(e) =>
                        handleDusunChange(d.id, "target_suara", e.target.value)
                      }
                      className="w-full min-h-[44px] px-3 mt-1 bg-surface-card border border-surface-border rounded-lg font-bold text-primary-container"
                    />
                  </label>
                  <label className="font-label-sm text-label-sm text-secondary">
                    WhatsApp Kordes
                    <input
                      type="tel"
                      value={d.kordes_wa || ""}
                      onChange={(e) =>
                        handleDusunChange(d.id, "kordes_wa", e.target.value)
                      }
                      className="w-full min-h-[44px] px-3 mt-1 bg-surface-card border border-surface-border rounded-lg text-on-surface"
                    />
                  </label>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="border shadow-sm bg-surface-card border-surface-border rounded-xl p-space-lg">
          <div className="flex items-center justify-between mb-space-md">
            <div>
              <h2 className="font-headline-sm text-headline-sm text-on-surface">
                Daftar Akun Timses, Kordes & Saksi TPS
              </h2>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Akun yang terdaftar di bawah ini dapat langsung masuk melalui
                halaman Login.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto border rounded-xl border-surface-border">
            <table className="w-full text-left border-collapse font-body-sm text-body-sm">
              <thead className="uppercase bg-surface-container font-label-sm text-label-sm text-secondary">
                <tr>
                  <th className="px-4 py-3">Nama Pengguna</th>
                  <th className="px-4 py-3">ID Login / WA</th>
                  <th className="px-4 py-3">Peran Akses</th>
                  <th className="px-4 py-3">Wilayah & TPS</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Kendali</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-surface-container-low">
                    <td className="px-4 py-3 font-label-md text-on-surface">
                      {u.nama_lengkap}
                    </td>
                    <td className="px-4 py-3 font-mono text-secondary">
                      {u.login_id}
                    </td>
                    <td className="px-4 py-3 uppercase font-label-sm text-primary">
                      {u.peran}
                    </td>
                    <td className="px-4 py-3 text-secondary">
                      {u.wilayah} • {u.tps_kode}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2.5 py-1 rounded-full font-label-sm text-label-sm ${
                          u.aktif
                            ? "bg-status-kita-bg text-status-kita-text"
                            : "bg-status-lain-bg text-status-lain-text"
                        }`}
                      >
                        {u.aktif ? "Aktif" : "Nonaktif"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => toggleUserActive(u)}
                        className="min-h-[40px] px-3 bg-surface-container hover:bg-surface-dim rounded-lg font-label-sm text-label-sm text-on-surface"
                      >
                        {u.aktif ? "Nonaktifkan" : "Aktifkan"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {showAddUserModal && (
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-inverse-surface/60 backdrop-blur-sm"
          >
            <form
              onSubmit={handleCreateUser}
              className="flex flex-col w-full max-w-md gap-3 border shadow-2xl bg-surface-card border-surface-border rounded-2xl p-space-lg"
            >
              <h3 className="font-headline-sm text-headline-sm text-on-surface">
                Registrasi Akun Timses / Saksi Baru
              </h3>
              <label className="font-label-sm text-secondary">
                Nama Lengkap Petugas
                <input
                  type="text"
                  required
                  placeholder="Contoh: Hendra Saputra"
                  value={newUserForm.nama_lengkap}
                  onChange={(e) =>
                    setNewUserForm({
                      ...newUserForm,
                      nama_lengkap: e.target.value,
                    })
                  }
                  className="w-full min-h-[44px] px-3 mt-1 bg-surface border border-surface-border rounded-lg text-on-surface"
                />
              </label>
              <div className="grid grid-cols-2 gap-2">
                <label className="font-label-sm text-secondary">
                  ID Login / No. WA
                  <input
                    type="text"
                    required
                    placeholder="0812xxxx / saksi03"
                    value={newUserForm.login_id}
                    onChange={(e) =>
                      setNewUserForm({
                        ...newUserForm,
                        login_id: e.target.value,
                      })
                    }
                    className="w-full min-h-[44px] px-3 mt-1 bg-surface border border-surface-border rounded-lg text-on-surface"
                  />
                </label>
                <label className="font-label-sm text-secondary">
                  Kata Sandi
                  <input
                    type="text"
                    required
                    value={newUserForm.kata_sandi}
                    onChange={(e) =>
                      setNewUserForm({
                        ...newUserForm,
                        kata_sandi: e.target.value,
                      })
                    }
                    className="w-full min-h-[44px] px-3 mt-1 bg-surface border border-surface-border rounded-lg text-on-surface"
                  />
                </label>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <label className="font-label-sm text-secondary">
                  Peran Akses
                  <select
                    value={newUserForm.peran}
                    onChange={(e) =>
                      setNewUserForm({ ...newUserForm, peran: e.target.value })
                    }
                    className="w-full min-h-[44px] px-3 mt-1 bg-surface border border-surface-border rounded-lg text-on-surface"
                  >
                    <option value="relawan">Relawan / Kordes</option>
                    <option value="saksi">Saksi TPS</option>
                    <option value="admin">Admin War Room</option>
                  </select>
                </label>
                <label className="font-label-sm text-secondary">
                  Alokasi TPS
                  <select
                    value={newUserForm.tps_kode}
                    onChange={(e) =>
                      setNewUserForm({
                        ...newUserForm,
                        tps_kode: e.target.value,
                      })
                    }
                    className="w-full min-h-[44px] px-3 mt-1 bg-surface border border-surface-border rounded-lg text-on-surface"
                  >
                    <option value="TPS 01">TPS 01</option>
                    <option value="TPS 02">TPS 02</option>
                    <option value="TPS 03">TPS 03</option>
                    <option value="TPS 04">TPS 04</option>
                    <option value="ALL">Semua TPS</option>
                  </select>
                </label>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="min-h-[44px] px-4 bg-surface-container rounded-lg font-label-md"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="min-h-[44px] px-4 bg-primary-container text-on-primary rounded-lg font-label-md"
                >
                  Daftarkan Akun
                </button>
              </div>
            </form>
          </div>
        )}

        {showAddCandidateModal && (
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-inverse-surface/60 backdrop-blur-sm"
          >
            <form
              onSubmit={handleCreateCandidate}
              className="flex flex-col w-full max-w-md gap-3 border shadow-2xl bg-surface-card border-surface-border rounded-2xl p-space-lg"
            >
              <h3 className="font-headline-sm text-headline-sm text-on-surface">
                Tambah Calon Kepala Kampung
              </h3>
              <div className="grid grid-cols-3 gap-2">
                <label className="font-label-sm text-secondary">
                  No. Urut
                  <input
                    type="text"
                    required
                    value={newCandidateForm.nomor_urut}
                    onChange={(e) =>
                      setNewCandidateForm({
                        ...newCandidateForm,
                        nomor_urut: e.target.value,
                      })
                    }
                    className="w-full min-h-[44px] px-3 mt-1 bg-surface border border-surface-border rounded-lg text-on-surface"
                  />
                </label>
                <label className="col-span-2 font-label-sm text-secondary">
                  Nama Lengkap Paslon
                  <input
                    type="text"
                    required
                    value={newCandidateForm.nama_lengkap}
                    onChange={(e) =>
                      setNewCandidateForm({
                        ...newCandidateForm,
                        nama_lengkap: e.target.value,
                      })
                    }
                    className="w-full min-h-[44px] px-3 mt-1 bg-surface border border-surface-border rounded-lg text-on-surface"
                  />
                </label>
              </div>
              <label className="font-label-sm text-secondary">
                Slogan Kampanye
                <input
                  type="text"
                  value={newCandidateForm.slogan}
                  onChange={(e) =>
                    setNewCandidateForm({
                      ...newCandidateForm,
                      slogan: e.target.value,
                    })
                  }
                  className="w-full min-h-[44px] px-3 mt-1 bg-surface border border-surface-border rounded-lg text-on-surface"
                />
              </label>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddCandidateModal(false)}
                  className="min-h-[44px] px-4 bg-surface-container rounded-lg font-label-md"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="min-h-[44px] px-4 bg-primary-container text-on-primary rounded-lg font-label-md"
                >
                  Simpan Calon
                </button>
              </div>
            </form>
          </div>
        )}

        {editingCandidate && (
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-inverse-surface/60 backdrop-blur-sm"
          >
            <form
              onSubmit={handleUpdateCandidate}
              className="flex flex-col w-full max-w-md gap-3 border shadow-2xl bg-surface-card border-surface-border rounded-2xl p-space-lg"
            >
              <h3 className="font-headline-sm text-headline-sm text-on-surface">
                Edit Kandidat No. {editingCandidate.nomor_urut}
              </h3>
              <label className="font-label-sm text-secondary">
                Nama Lengkap Kandidat
                <input
                  type="text"
                  required
                  value={editingCandidate.nama_lengkap}
                  onChange={(e) =>
                    setEditingCandidate({
                      ...editingCandidate,
                      nama_lengkap: e.target.value,
                    })
                  }
                  className="w-full min-h-[44px] px-3 mt-1 bg-surface border border-surface-border rounded-lg text-on-surface"
                />
              </label>
              <label className="font-label-sm text-secondary">
                Slogan Kampanye
                <input
                  type="text"
                  value={editingCandidate.slogan || ""}
                  onChange={(e) =>
                    setEditingCandidate({
                      ...editingCandidate,
                      slogan: e.target.value,
                    })
                  }
                  className="w-full min-h-[44px] px-3 mt-1 bg-surface border border-surface-border rounded-lg text-on-surface"
                />
              </label>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingCandidate(null)}
                  className="min-h-[44px] px-4 bg-surface-container rounded-lg font-label-md"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="min-h-[44px] px-4 bg-primary-container text-on-primary rounded-lg font-label-md"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </WarRoomShell>
  )
}
