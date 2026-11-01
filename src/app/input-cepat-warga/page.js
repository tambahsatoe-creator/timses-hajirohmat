"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import MobileNav from "@/components/MobileNav"
import { supabase, saveToOfflineQueue } from "@/lib/supabase"

export default function InputCepatWargaPage() {
  const router = useRouter()
  const [namaUtama, setNamaUtama] = useState("")
  const [namaKk, setNamaKk] = useState("")
  const [manualKk, setManualKk] = useState(false)
  const [rt, setRt] = useState("RT 01")
  const [nomorWa, setNomorWa] = useState("")
  const [tps, setTps] = useState("TPS 01 Krajan")
  const [pilihanUtama, setPilihanUtama] = useState("hijau")
  const [lawanUtama, setLawanUtama] = useState("No. 02 Drs. Bambang")
  const [catatan, setCatatan] = useState("")
  const [anggotaKeluarga, setAnggotaKeluarga] = useState([])
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState({
    show: false,
    title: "",
    sub: "",
    isError: false,
  })

  function handleNamaUtamaChange(val) {
    setNamaUtama(val)
    if (!manualKk) {
      setNamaKk(val)
    }
  }

  function handleNamaKkChange(val) {
    setManualKk(true)
    setNamaKk(val)
  }

  function tambahAnggotaKeluarga() {
    setAnggotaKeluarga((prev) => [
      ...prev,
      {
        id: `anggota-${Date.now()}-${prev.length}`,
        nama: "",
        hubungan: "Istri",
        status_dukungan: "hijau",
      },
    ])
  }

  function hapusAnggota(id) {
    setAnggotaKeluarga((prev) => prev.filter((item) => item.id !== id))
  }

  function updateAnggota(id, field, value) {
    setAnggotaKeluarga((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    )
  }

  function triggerToast(title, sub, isError = false) {
    setToast({ show: true, title, sub, isError })
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }))
    }, 2400)
  }

  async function simpanData(e) {
    if (e) e.preventDefault()
    const cleanNama = namaUtama.trim()
    if (!cleanNama) {
      triggerToast(
        "Nama Pemilih Wajib Diisi",
        "Masukkan nama lengkap pemilih utama terlebih dahulu.",
        true,
      )
      return
    }

    setSaving(true)
    const finalKk = (namaKk || cleanNama).trim()
    const totalAnggota = anggotaKeluarga.length + 1

    const mainPayload = {
      no_dpt: `#${Math.floor(100 + Math.random() * 899)}`,
      nama_lengkap: cleanNama,
      nama_kk: finalKk,
      hubungan_kk: "Kepala Keluarga",
      dusun: "Dusun 01 Krajan",
      rt,
      rw: "RW 01",
      tps,
      nomor_wa: nomorWa.trim() || null,
      status_dukungan: pilihanUtama,
      pilihan_lawan: pilihanUtama === "merah" ? lawanUtama : null,
      jumlah_anggota_kk: totalAnggota,
      catatan_lapangan: catatan.trim() || null,
      sudah_coblos: false,
      status_c_pemberitahuan: "Terkonfirmasi Hadir",
    }

    const extraPayloads = anggotaKeluarga
      .filter((a) => a.nama.trim() !== "")
      .map((a) => ({
        no_dpt: `#${Math.floor(100 + Math.random() * 899)}`,
        nama_lengkap: a.nama.trim(),
        nama_kk: finalKk,
        hubungan_kk: a.hubungan,
        dusun: "Dusun 01 Krajan",
        rt,
        rw: "RW 01",
        tps,
        nomor_wa: nomorWa.trim() || null,
        status_dukungan: a.status_dukungan,
        pilihan_lawan: null,
        jumlah_anggota_kk: 1,
        catatan_lapangan: `Anggota KK ${finalKk} (${a.hubungan})`,
        sudah_coblos: false,
        status_c_pemberitahuan: "Terkonfirmasi Hadir",
      }))

    const allPayloads = [mainPayload, ...extraPayloads]

    try {
      if (supabase) {
        const { error } = await supabase.from("pemilih").insert(allPayloads)
        if (error) throw error
      } else {
        allPayloads.forEach((p) => saveToOfflineQueue(p))
      }

      triggerToast(
        "Data Berhasil Disimpan",
        `Dukungan ${allPayloads.length} anggota keluarga tersinkron ke sistem.`,
      )

      setNamaUtama("")
      setNamaKk("")
      setManualKk(false)
      setNomorWa("")
      setCatatan("")
      setAnggotaKeluarga([])
      setPilihanUtama("hijau")
    } catch {
      allPayloads.forEach((p) => saveToOfflineQueue(p))
      triggerToast(
        "Tersimpan di Antrean Offline",
        "Sinyal sedang lemah. Data otomatis disinkronkan saat online.",
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-surface font-body-md text-body-md text-on-surface">
      <header className="fixed inset-x-0 top-0 z-40 w-full border-b pt-safe bg-surface-card/95 backdrop-blur-md border-surface-border">
        <div className="flex items-center justify-between max-w-lg px-4 mx-auto h-14">
          <button
            type="button"
            onClick={() => router.push("/beranda-setoran")}
            aria-label="Kembali ke Beranda Setoran"
            className="min-w-[44px] min-h-[44px] flex items-center justify-center text-on-surface hover:text-primary rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <span className="material-symbols-outlined text-[24px]">
              arrow_back
            </span>
          </button>
          <h1 className="font-bold text-center font-headline-sm text-headline-sm text-on-surface">
            Input Cepat Warga
          </h1>
          <button
            type="button"
            onClick={simpanData}
            disabled={saving}
            className="min-h-[44px] text-primary font-label-md text-label-md font-bold px-3 py-1 hover:bg-status-kita-bg rounded-lg transition-colors flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <span className="material-symbols-outlined text-[20px]">check</span>
            <span>Simpan</span>
          </button>
        </div>
      </header>

      <main className="flex flex-col flex-1 w-full max-w-lg pt-16 pb-40 mx-auto">
        <div className="px-margin-mobile py-space-md bg-surface-container-high">
          <div className="flex items-center mb-1 gap-space-xs">
            <span className="material-symbols-outlined text-primary text-[20px]">
              how_to_reg
            </span>
            <h2 className="font-headline-sm text-headline-sm text-on-surface">
              Catat Dukungan Pemilih
            </h2>
          </div>
          <p className="leading-snug font-body-sm text-body-sm text-on-surface-variant">
            Nama Kepala Keluarga (KK) otomatis mengunci untuk seluruh anggota
            keluarga serumah.
          </p>
        </div>

        <form
          onSubmit={simpanData}
          className="flex flex-col px-margin-mobile gap-space-lg mt-space-md"
        >
          <section className="flex flex-col border shadow-sm bg-surface-card border-surface-border rounded-xl p-space-md gap-space-md">
            <div className="flex items-center justify-between">
              <span className="font-bold tracking-wider uppercase font-label-md text-label-md text-on-surface">
                Identitas Utama Pertemuan
              </span>
              <span className="font-label-sm text-label-sm bg-surface-container px-2 py-0.5 rounded text-on-secondary-container">
                Langkah 1/3
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <label
                htmlFor="input-nama-utama"
                className="font-semibold font-label-sm text-label-sm text-on-surface"
              >
                Nama Lengkap Pemilih Utama *
              </label>
              <input
                id="input-nama-utama"
                type="text"
                required
                value={namaUtama}
                onChange={(e) => handleNamaUtamaChange(e.target.value)}
                placeholder="Contoh: Ahmad Supardi"
                className="w-full min-h-[44px] px-3 bg-surface border border-surface-border rounded-lg font-body-md text-body-md text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              />
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="input-nama-kk"
                  className="font-semibold font-label-sm text-label-sm text-on-surface"
                >
                  Nama Kepala Keluarga (KK)
                </label>
                <span className="font-label-sm text-label-sm text-primary flex items-center gap-0.5">
                  <span className="material-symbols-outlined text-[14px]">
                    lock
                  </span>
                  <span>Terkunci KK</span>
                </span>
              </div>
              <input
                id="input-nama-kk"
                type="text"
                value={namaKk}
                onChange={(e) => handleNamaKkChange(e.target.value)}
                placeholder="Sama dengan nama pemilih utama"
                className="w-full min-h-[44px] px-3 bg-surface-container-low border border-surface-border rounded-lg font-body-md text-body-md text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              />
            </div>

            <div className="grid grid-cols-2 gap-space-sm">
              <div className="flex flex-col gap-1">
                <span className="font-semibold font-label-sm text-label-sm text-on-surface">
                  Dusun (Terkunci)
                </span>
                <div className="min-h-[44px] px-3 bg-surface-container-low border border-surface-border rounded-lg flex items-center gap-1.5 text-on-surface-variant">
                  <span className="material-symbols-outlined text-[18px] text-primary">
                    pin_drop
                  </span>
                  <span className="font-medium truncate font-body-sm text-body-sm text-on-surface">
                    Dusun 01 Krajan
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label
                  htmlFor="select-rt"
                  className="font-semibold font-label-sm text-label-sm text-on-surface"
                >
                  RT Wilayah *
                </label>
                <select
                  id="select-rt"
                  value={rt}
                  onChange={(e) => setRt(e.target.value)}
                  className="w-full min-h-[44px] px-3 bg-surface border border-surface-border rounded-lg font-body-md text-body-md text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <option value="RT 01">RT 01</option>
                  <option value="RT 02">RT 02</option>
                  <option value="RT 03">RT 03</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-space-sm">
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="input-wa"
                  className="font-semibold font-label-sm text-label-sm text-on-surface"
                >
                  Nomor WhatsApp
                </label>
                <input
                  id="input-wa"
                  type="tel"
                  value={nomorWa}
                  onChange={(e) => setNomorWa(e.target.value)}
                  placeholder="08xxxxxxxxxx"
                  className="w-full min-h-[44px] px-3 bg-surface border border-surface-border rounded-lg font-body-md text-body-md text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label
                  htmlFor="select-tps"
                  className="font-semibold font-label-sm text-label-sm text-on-surface"
                >
                  Ploting TPS
                </label>
                <select
                  id="select-tps"
                  value={tps}
                  onChange={(e) => setTps(e.target.value)}
                  className="w-full min-h-[44px] px-3 bg-surface border border-surface-border rounded-lg font-body-md text-body-md text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <option value="TPS 01 Krajan">TPS 01 Krajan</option>
                  <option value="TPS 02 Krajan">TPS 02 Krajan</option>
                  <option value="TPS 03 Krajan">TPS 03 Krajan</option>
                  <option value="TPS 04 Harapan">TPS 04 Harapan</option>
                </select>
              </div>
            </div>
          </section>

          <section className="flex flex-col border shadow-sm bg-surface-card border-surface-border rounded-xl p-space-md gap-space-md">
            <div className="flex items-center justify-between">
              <span className="font-bold tracking-wider uppercase font-label-md text-label-md text-on-surface">
                Arah Dukungan Pemilih Utama
              </span>
              <span className="font-bold font-label-sm text-label-sm text-primary">
                1-Klik Cepat
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              <button
                type="button"
                onClick={() => setPilihanUtama("hijau")}
                className={`min-h-[54px] w-full px-4 rounded-xl flex items-center justify-between transition-all border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                  pilihanUtama === "hijau"
                    ? "bg-status-kita-bg border-status-kita-border text-status-kita-text shadow-sm"
                    : "bg-surface border-surface-border text-on-surface-variant"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-6 h-6 text-xs font-bold rounded-full bg-primary-container text-on-primary">
                    A
                  </span>
                  <div className="flex flex-col text-left">
                    <span className="font-bold font-label-md text-label-md">
                      HIJAU (Pasti Haji Rohmat)
                    </span>
                    <span className="font-label-sm text-label-sm opacity-90">
                      Pemilih loyal & siap coblos nomor 01
                    </span>
                  </div>
                </div>
                <span className="material-symbols-outlined text-[24px]">
                  {pilihanUtama === "hijau"
                    ? "check_circle"
                    : "radio_button_unchecked"}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setPilihanUtama("kuning")}
                className={`min-h-[54px] w-full px-4 rounded-xl flex items-center justify-between transition-all border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                  pilihanUtama === "kuning"
                    ? "bg-status-ragu-bg border-status-ragu-border text-status-ragu-text shadow-sm"
                    : "bg-surface border-surface-border text-on-surface-variant"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-6 h-6 text-xs font-bold border rounded-full bg-status-ragu-bg border-status-ragu-border text-status-ragu-text">
                    B
                  </span>
                  <div className="flex flex-col text-left">
                    <span className="font-bold font-label-md text-label-md">
                      KUNING (Masih Ragu / Swing)
                    </span>
                    <span className="font-label-sm text-label-sm opacity-90">
                      Perlu dikunjungi ulang oleh tokoh
                    </span>
                  </div>
                </div>
                <span className="material-symbols-outlined text-[24px]">
                  {pilihanUtama === "kuning"
                    ? "check_circle"
                    : "radio_button_unchecked"}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setPilihanUtama("merah")}
                className={`min-h-[54px] w-full px-4 rounded-xl flex items-center justify-between transition-all border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                  pilihanUtama === "merah"
                    ? "bg-status-lain-bg border-status-lain-border text-status-lain-text shadow-sm"
                    : "bg-surface border-surface-border text-on-surface-variant"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-6 h-6 text-xs font-bold border rounded-full bg-status-lain-bg border-status-lain-border text-status-lain-text">
                    C
                  </span>
                  <div className="flex flex-col text-left">
                    <span className="font-bold font-label-md text-label-md">
                      MERAH (Pilih Calon Lawan)
                    </span>
                    <span className="font-label-sm text-label-sm opacity-90">
                      Dukungan mengarah ke paslon lain
                    </span>
                  </div>
                </div>
                <span className="material-symbols-outlined text-[24px]">
                  {pilihanUtama === "merah"
                    ? "check_circle"
                    : "radio_button_unchecked"}
                </span>
              </button>
            </div>

            {pilihanUtama === "merah" && (
              <div className="flex flex-col gap-1 p-3 border rounded-lg bg-status-lain-bg border-status-lain-border">
                <label
                  htmlFor="select-lawan-utama"
                  className="font-bold font-label-sm text-label-sm text-status-lain-text"
                >
                  Identifikasi Pilihan Lawan:
                </label>
                <select
                  id="select-lawan-utama"
                  value={lawanUtama}
                  onChange={(e) => setLawanUtama(e.target.value)}
                  className="w-full min-h-[44px] px-3 bg-surface-card border border-surface-border rounded-lg font-body-md text-body-md text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-error"
                >
                  <option value="No. 02 Drs. Bambang">
                    No. 02 Drs. Bambang
                  </option>
                  <option value="No. 03 Hj. Ratna Sari">
                    No. 03 Hj. Ratna Sari
                  </option>
                  <option value="Dirahasiakan / Tidak Mau Sebut">
                    Dirahasiakan / Tidak Mau Sebut
                  </option>
                </select>
              </div>
            )}
          </section>

          <section className="flex flex-col border shadow-sm bg-surface-card border-surface-border rounded-xl p-space-md gap-space-md">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="font-bold font-label-md text-label-md text-on-surface">
                  Anggota Keluarga Satu KK
                </span>
                <span className="font-label-sm text-label-sm text-on-surface-variant">
                  Otomatis mewarisi KK, RT & TPS
                </span>
              </div>
              <span className="font-label-sm text-label-sm bg-primary text-on-primary px-2.5 py-1 rounded-full font-bold">
                {anggotaKeluarga.length + 1} Orang
              </span>
            </div>

            {anggotaKeluarga.length > 0 && (
              <div className="flex flex-col gap-space-sm">
                {anggotaKeluarga.map((anggota, index) => (
                  <div
                    key={anggota.id}
                    className="p-3 bg-surface-container-low border border-surface-border rounded-xl flex flex-col gap-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-secondary text-on-secondary flex items-center justify-center font-bold text-[11px]">
                          {index + 2}
                        </span>
                        <span className="font-bold font-label-sm text-label-sm text-on-surface">
                          Anggota Tambahan (Satu KK)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => hapusAnggota(anggota.id)}
                        aria-label="Hapus anggota keluarga"
                        className="min-w-[44px] min-h-[44px] text-error flex items-center justify-center rounded-lg hover:bg-status-lain-bg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-error"
                      >
                        <span className="material-symbols-outlined text-[20px]">
                          delete
                        </span>
                      </button>
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={anggota.nama}
                        onChange={(e) =>
                          updateAnggota(anggota.id, "nama", e.target.value)
                        }
                        placeholder="Nama Istri / Anak"
                        className="w-full min-h-[44px] px-3 bg-surface-card border border-surface-border rounded-lg font-body-sm text-body-sm text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      />
                      <select
                        value={anggota.hubungan}
                        onChange={(e) =>
                          updateAnggota(anggota.id, "hubungan", e.target.value)
                        }
                        className="min-h-[44px] px-2 bg-surface-card border border-surface-border rounded-lg font-label-sm text-label-sm text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      >
                        <option value="Istri">Istri</option>
                        <option value="Anak">Anak</option>
                        <option value="Orang Tua">Orang Tua</option>
                        <option value="Famili Lain">Famili Lain</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-3 gap-1.5">
                      <button
                        type="button"
                        onClick={() =>
                          updateAnggota(anggota.id, "status_dukungan", "hijau")
                        }
                        className={`min-h-[44px] rounded-lg font-label-sm text-label-sm font-bold flex items-center justify-center gap-1 border ${
                          anggota.status_dukungan === "hijau"
                            ? "bg-status-kita-bg border-status-kita-border text-status-kita-text"
                            : "bg-surface-card border-surface-border text-on-surface-variant"
                        }`}
                      >
                        <span className="w-2 h-2 rounded-full bg-status-kita-text"></span>
                        <span>Hijau</span>
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          updateAnggota(anggota.id, "status_dukungan", "kuning")
                        }
                        className={`min-h-[44px] rounded-lg font-label-sm text-label-sm font-bold flex items-center justify-center gap-1 border ${
                          anggota.status_dukungan === "kuning"
                            ? "bg-status-ragu-bg border-status-ragu-border text-status-ragu-text"
                            : "bg-surface-card border-surface-border text-on-surface-variant"
                        }`}
                      >
                        <span className="w-2 h-2 rounded-full bg-status-ragu-text"></span>
                        <span>Kuning</span>
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          updateAnggota(anggota.id, "status_dukungan", "merah")
                        }
                        className={`min-h-[44px] rounded-lg font-label-sm text-label-sm font-bold flex items-center justify-center gap-1 border ${
                          anggota.status_dukungan === "merah"
                            ? "bg-status-lain-bg border-status-lain-border text-status-lain-text"
                            : "bg-surface-card border-surface-border text-on-surface-variant"
                        }`}
                      >
                        <span className="w-2 h-2 rounded-full bg-status-lain-text"></span>
                        <span>Merah</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={tambahAnggotaKeluarga}
              className="min-h-[46px] w-full bg-surface-container hover:bg-surface-container-highest text-primary font-label-md text-label-md font-bold rounded-xl flex items-center justify-center gap-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <span className="material-symbols-outlined text-[20px]">
                group_add
              </span>
              <span>+ Tambah Anggota Keluarga Serumah (Istri/Anak)</span>
            </button>
          </section>

          <section className="bg-surface-card border border-surface-border rounded-xl p-space-md shadow-sm flex flex-col gap-1.5">
            <label
              htmlFor="catatan-lapangan"
              className="font-bold font-label-md text-label-md text-on-surface"
            >
              Catatan Lapangan Khusus
            </label>
            <textarea
              id="catatan-lapangan"
              rows={3}
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              placeholder="Contoh: Minta dikunjungi ulang minggu depan / Perlu jemputan kendaraan saat pencoblosan."
              className="w-full p-3 border rounded-lg resize-none bg-surface border-surface-border font-body-md text-body-md text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            />
          </section>

          <button
            type="submit"
            disabled={saving}
            className="w-full min-h-[50px] bg-primary-container hover:bg-primary-dark text-on-primary font-headline-sm text-headline-sm rounded-xl flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary"
          >
            <span className="material-symbols-outlined text-[22px]">save</span>
            <span>
              {saving ? "Menyimpan Data..." : "Simpan Data Pemilih & Keluarga"}
            </span>
          </button>
        </form>

        {toast.show && (
          <div
            role="status"
            aria-live="polite"
            className="fixed z-50 max-w-md mx-auto top-20 left-4 right-4"
          >
            <div
              className={`p-4 rounded-xl shadow-lg flex items-center gap-3 border ${
                toast.isError
                  ? "bg-status-lain-bg border-status-lain-border text-status-lain-text"
                  : "bg-status-kita-bg border-status-kita-border text-status-kita-text"
              }`}
            >
              <span className="material-symbols-outlined text-[26px]">
                {toast.isError ? "error" : "task_alt"}
              </span>
              <div className="flex flex-col">
                <span className="font-bold font-label-md text-label-md">
                  {toast.title}
                </span>
                <span className="font-body-sm text-body-sm">{toast.sub}</span>
              </div>
            </div>
          </div>
        )}
      </main>

      <MobileNav />
    </div>
  )
}
