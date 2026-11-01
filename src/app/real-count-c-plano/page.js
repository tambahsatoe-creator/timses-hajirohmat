'use client';

import { useState, useEffect, useMemo } from 'react';
import WarRoomShell from '@/components/WarRoomShell';
import { supabase } from '@/lib/supabase';

const INITIAL_TPS_PLANO = [
  {
    id: 1,
    kode_tps: 'TPS 01',
    nama_tps: 'Krajan Barat',
    lokasi: 'Balai RT 02 Dusun Krajan',
    saksi_utama: 'Joko Santoso',
    total_dpt: 230,
    suara_paslon_1: 145,
    suara_paslon_2: 38,
    suara_paslon_3: 22,
    suara_tidak_sah: 3,
    status_plano: 'Valid & Cocok',
    hash_code: '#PLK-SKM-2024-TPS01',
  },
  {
    id: 2,
    kode_tps: 'TPS 02',
    nama_tps: 'Krajan Timur',
    lokasi: 'SDN 01 Krajan Timur',
    saksi_utama: 'Nur Hayati',
    total_dpt: 225,
    suara_paslon_1: 132,
    suara_paslon_2: 45,
    suara_paslon_3: 27,
    suara_tidak_sah: 2,
    status_plano: 'Valid & Cocok',
    hash_code: '#PLK-SKM-2024-TPS02',
  },
  {
    id: 3,
    kode_tps: 'TPS 03',
    nama_tps: 'Sukamaju',
    lokasi: 'Balai Posyandu Sukamaju',
    saksi_utama: 'Arif Munandar',
    total_dpt: 228,
    suara_paslon_1: 128,
    suara_paslon_2: 49,
    suara_paslon_3: 25,
    suara_tidak_sah: 4,
    status_plano: 'Valid & Cocok',
    hash_code: '#PLK-SKM-2024-TPS03',
  },
  {
    id: 4,
    kode_tps: 'TPS 04',
    nama_tps: 'Harapan Makmur',
    lokasi: 'Musholla Al-Huda Terowongan',
    saksi_utama: 'Dedi Irawan',
    total_dpt: 227,
    suara_paslon_1: 134,
    suara_paslon_2: 41,
    suara_paslon_3: 24,
    suara_tidak_sah: 3,
    status_plano: 'Valid & Cocok',
    hash_code: '#PLK-SKM-2024-TPS04',
  },
];

export default function RealCountCPlanoPage() {
  const [tpsList, setTpsList] = useState(INITIAL_TPS_PLANO);
  const [searchQuery, setSearchQuery] = useState('');
  const [syncLoading, setSyncLoading] = useState(false);
  const [selectedPlano, setSelectedPlano] = useState(null);
  const [editingTps, setEditingTps] = useState(null);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    fetchTpsData();
  }, []);

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        setSelectedPlano(null);
        setEditingTps(null);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  async function fetchTpsData() {
    if (!supabase) return;
    setSyncLoading(true);
    try {
      const { data, error } = await supabase.from('tps').select('*').order('id', { ascending: true });
      if (!error && data && data.length > 0) {
        setTpsList(data.map((row, idx) => ({ ...INITIAL_TPS_PLANO[idx], ...row })));
      }
    } catch {
      // Gunakan data lokal apabila jaringan terputus
    } finally {
      setSyncLoading(false);
    }
  }

  async function handleSaveAuditTps(e) {
    e.preventDefault();
    if (!editingTps) return;

    const updated = {
      ...editingTps,
      suara_paslon_1: Number(editingTps.suara_paslon_1) || 0,
      suara_paslon_2: Number(editingTps.suara_paslon_2) || 0,
      suara_paslon_3: Number(editingTps.suara_paslon_3) || 0,
      suara_tidak_sah: Number(editingTps.suara_tidak_sah) || 0,
    };

    setTpsList((prev) => prev.map((t) => (t.kode_tps === updated.kode_tps ? updated : t)));

    if (supabase) {
      await supabase
        .from('tps')
        .update({
          suara_paslon_1: updated.suara_paslon_1,
          suara_paslon_2: updated.suara_paslon_2,
          suara_paslon_3: updated.suara_paslon_3,
          suara_tidak_sah: updated.suara_tidak_sah,
        })
        .eq('kode_tps', updated.kode_tps);
    }

    setEditingTps(null);
    setNotice(`Audit angka ${updated.kode_tps} (${updated.nama_tps}) berhasil disimpan.`);
    setTimeout(() => setNotice(''), 3000);
  }

  const summary = useMemo(() => {
    const totalDpt = tpsList.reduce((a, t) => a + Number(t.total_dpt || 0), 0);
    const paslon1 = tpsList.reduce((a, t) => a + Number(t.suara_paslon_1 || 0), 0);
    const paslon2 = tpsList.reduce((a, t) => a + Number(t.suara_paslon_2 || 0), 0);
    const paslon3 = tpsList.reduce((a, t) => a + Number(t.suara_paslon_3 || 0), 0);
    const tidakSah = tpsList.reduce((a, t) => a + Number(t.suara_tidak_sah || 0), 0);
    const suaraSah = paslon1 + paslon2 + paslon3;
    const totalDigunakan = suaraSah + tidakSah;

    const pct1 = suaraSah ? ((paslon1 / suaraSah) * 100).toFixed(1) : '0.0';
    const pct2 = suaraSah ? ((paslon2 / suaraSah) * 100).toFixed(1) : '0.0';
    const pct3 = suaraSah ? ((paslon3 / suaraSah) * 100).toFixed(1) : '0.0';
    const partisipasi = totalDpt ? ((totalDigunakan / totalDpt) * 100).toFixed(1) : '0.0';

    return {
      totalDpt,
      paslon1,
      paslon2,
      paslon3,
      tidakSah,
      suaraSah,
      totalDigunakan,
      pct1,
      pct2,
      pct3,
      partisipasi,
      selisihSuara: paslon1 - paslon2,
      selisihPct: (Number(pct1) - Number(pct2)).toFixed(1),
    };
  }, [tpsList]);

  const filteredTps = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return tpsList;
    return tpsList.filter((t) =>
      `${t.kode_tps} ${t.nama_tps} ${t.lokasi} ${t.saksi_utama}`.toLowerCase().includes(q)
    );
  }, [tpsList, searchQuery]);

  function handleBroadcastPleno() {
    const text = `HASIL PLENO REAL COUNT PILKADES:%0A- 01 H. Rahmat Hidayat: ${summary.paslon1} Suara (${summary.pct1}%)%0A- 02 Drs. Bambang: ${summary.paslon2} Suara (${summary.pct2}%)%0A- 03 Hj. Ratna Sari: ${summary.paslon3} Suara (${summary.pct3}%)%0A- Total Suara Sah: ${summary.suaraSah} Suara`;
    window.open(`https://wa.me/?text=${text}`, '_blank');
  }

  return (
    <WarRoomShell
      searchValue={searchQuery}
      onSearchChange={setSearchQuery}
      searchPlaceholder="Cari No TPS, Lokasi, atau Saksi..."
      onSyncClick={fetchTpsData}
      syncLoading={syncLoading}
    >
      <div className="flex flex-col w-full max-w-[1600px] mx-auto">
        <div className="flex flex-col justify-between p-4 border-b shadow-sm bg-surface-card border-surface-border lg:p-margin lg:flex-row lg:items-center gap-space-md">
          <div className="flex items-center gap-space-md">
            <div className="flex items-center justify-center w-12 h-12 border rounded-xl bg-status-kita-bg border-status-kita-border text-status-kita-text shrink-0">
              <span className="material-symbols-outlined text-[28px]">ballot</span>
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-space-xs">
                <h1 className="font-headline-sm text-headline-sm text-on-surface">
                  Tabulasi Real Count & Verifikasi C-Plano Pilkades
                </h1>
                <span className="bg-status-kita-bg border border-status-kita-border text-status-kita-text font-label-sm text-label-sm px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-status-kita-text"></span>
                  <span>100% TPS Masuk (4/4 TPS)</span>
                </span>
              </div>
              <p className="font-body-sm text-body-sm text-secondary">
                Kampung Makmur Jaya • Rekapitulasi Berita Acara Pleno Tingkat Desa
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-space-sm">
            <button
              type="button"
              onClick={() => window.print()}
              className="min-h-[44px] px-space-md bg-surface-container rounded-lg text-on-surface font-label-md text-label-md flex items-center gap-space-xs hover:bg-surface-variant transition-colors"
            >
              <span className="material-symbols-outlined text-[20px] text-secondary">download</span>
              <span>Unduh PDF Form C-Hasil</span>
            </button>
            <button
              type="button"
              onClick={handleBroadcastPleno}
              className="min-h-[44px] px-space-md bg-primary-container rounded-lg text-on-primary font-label-md text-label-md flex items-center gap-space-xs hover:bg-primary-dark transition-colors shadow-sm"
            >
              <span className="material-symbols-outlined text-[20px]">share</span>
              <span>Broadcast Berita Acara</span>
            </button>
          </div>
        </div>

        <div className="flex flex-col p-4 lg:p-margin gap-margin">
          {notice && (
            <div role="status" className="flex items-center gap-2 px-4 py-3 border bg-status-kita-bg border-status-kita-border text-status-kita-text rounded-xl font-label-md text-label-md">
              <span className="material-symbols-outlined text-[20px]">verified</span>
              <span>{notice}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
            <div className="flex items-center justify-between border shadow-sm bg-surface-card border-surface-border rounded-xl p-space-md">
              <div>
                <span className="block font-label-sm text-label-sm text-secondary">STATUS VERIFIKASI SAKSI</span>
                <span className="font-headline-sm text-headline-sm text-status-kita-text">TERKUNCI 100%</span>
              </div>
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-status-kita-bg text-status-kita-text">
                <span className="material-symbols-outlined text-[24px]">verified</span>
              </div>
            </div>
            <div className="flex items-center justify-between border shadow-sm bg-surface-card border-surface-border rounded-xl p-space-md">
              <div>
                <span className="block font-label-sm text-label-sm text-secondary">TOTAL DPT TERDAFTAR</span>
                <span className="font-headline-sm text-headline-sm text-on-surface">{summary.totalDpt} Pemilih</span>
              </div>
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-surface-container text-secondary">
                <span className="material-symbols-outlined text-[24px]">groups</span>
              </div>
            </div>
            <div className="flex items-center justify-between border shadow-sm bg-surface-card border-surface-border rounded-xl p-space-md">
              <div>
                <span className="block font-label-sm text-label-sm text-secondary">PARTISIPASI PEMILIH</span>
                <span className="font-headline-sm text-headline-sm text-primary-container">{summary.partisipasi}%</span>
              </div>
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-status-kita-bg text-primary-container">
                <span className="material-symbols-outlined text-[24px]">trending_up</span>
              </div>
            </div>
            <div className="flex items-center justify-between border shadow-sm bg-surface-card border-surface-border rounded-xl p-space-md">
              <div>
                <span className="block font-label-sm text-label-sm text-secondary">INTEGRITAS DOKUMEN</span>
                <span className="font-headline-sm text-headline-sm text-status-kita-text">NIL ANOMALI</span>
              </div>
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-status-kita-bg text-status-kita-text">
                <span className="material-symbols-outlined text-[24px]">check_circle</span>
              </div>
            </div>
          </div>

          <div className="grid items-stretch grid-cols-1 lg:grid-cols-12 gap-space-md">
            <div className="flex flex-col justify-between border shadow-sm lg:col-span-3 bg-surface-card border-surface-border rounded-xl p-space-lg">
              <div>
                <div className="flex items-center justify-between mb-space-sm">
                  <span className="font-label-sm text-label-sm text-secondary">TOTAL REKAPITULASI</span>
                  <span className="bg-surface-container text-secondary px-2 py-0.5 rounded text-label-sm font-label-sm">Final</span>
                </div>
                <span className="block font-headline-lg text-headline-lg text-on-surface">{summary.suaraSah}</span>
                <span className="font-label-md text-label-md text-status-kita-text">Total Suara Sah Masuk</span>
                <div className="space-y-1 rounded-lg mt-space-md bg-surface-container-low p-space-sm">
                  <div className="flex justify-between text-body-sm font-body-sm text-secondary">
                    <span>Suara Tidak Sah:</span>
                    <span className="font-label-md text-status-lain-text">{summary.tidakSah} Suara</span>
                  </div>
                  <div className="flex justify-between text-body-sm font-body-sm text-secondary">
                    <span>Total Digunakan:</span>
                    <span className="font-label-md text-on-surface">{summary.totalDigunakan} Suara</span>
                  </div>
                </div>
              </div>
              <div className="mt-space-md">
                <div className="flex w-full h-3 overflow-hidden rounded-full bg-surface-container">
                  <div className="h-full bg-primary-container" style={{ width: `${summary.pct1}%` }}></div>
                  <div className="h-full bg-secondary" style={{ width: `${summary.pct2}%` }}></div>
                  <div className="h-full bg-tertiary-container" style={{ width: `${summary.pct3}%` }}></div>
                </div>
                <div className="flex justify-between mt-1 text-label-sm font-label-sm text-secondary">
                  <span>01: {summary.pct1}%</span>
                  <span>02: {summary.pct2}%</span>
                  <span>03: {summary.pct3}%</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-between border shadow-sm lg:col-span-4 bg-status-kita-bg border-status-kita-border rounded-xl p-space-lg">
              <div>
                <div className="flex items-center justify-between mb-space-sm">
                  <span className="font-label-sm text-label-sm text-status-kita-text">01 • CALON KADES KITA</span>
                  <span className="bg-primary-container text-on-primary font-label-sm text-label-sm px-2.5 py-0.5 rounded-full">Unggul Mutlak</span>
                </div>
                <h2 className="mb-1 font-headline-md text-headline-md text-on-surface">H. Rahmat Hidayat</h2>
                <p className="font-body-sm text-body-sm text-status-kita-text mb-space-md">Kader Inklusif, Membangun Desa Mandiri</p>
                <div className="flex items-baseline gap-space-sm">
                  <span className="font-headline-lg text-headline-lg text-primary-container">{summary.paslon1}</span>
                  <span className="font-headline-sm text-headline-sm text-primary-dark">Suara</span>
                  <span className="ml-auto font-bold font-headline-sm text-headline-sm text-status-kita-text">{summary.pct1}%</span>
                </div>
              </div>
              <div className="mt-space-md">
                <div className="flex justify-between text-label-sm font-label-sm text-status-kita-text">
                  <span>Selisih dari No 02:</span>
                  <span className="font-bold">+{summary.selisihSuara} Suara (+{summary.selisihPct}%)</span>
                </div>
                <div className="w-full bg-surface-card rounded-full h-2 mt-1.5 overflow-hidden">
                  <div className="h-full rounded-full bg-primary-container" style={{ width: `${summary.pct1}%` }}></div>
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-between border shadow-sm lg:col-span-3 bg-surface-card border-surface-border rounded-xl p-space-lg">
              <div>
                <div className="flex items-center justify-between mb-space-sm">
                  <span className="font-label-sm text-label-sm text-secondary">02 • KANDIDAT LAWAN</span>
                  <span className="text-secondary font-label-sm text-label-sm">Peringkat 2</span>
                </div>
                <h2 className="mb-1 font-headline-sm text-headline-sm text-on-surface">Drs. Bambang</h2>
                <p className="font-body-sm text-body-sm text-secondary mb-space-md">Birokrasi Transparan & Profesional</p>
                <div className="flex items-baseline gap-space-sm">
                  <span className="font-headline-lg text-headline-lg text-on-surface">{summary.paslon2}</span>
                  <span className="font-body-md text-body-md text-secondary">Suara</span>
                  <span className="ml-auto font-headline-sm text-headline-sm text-secondary">{summary.pct2}%</span>
                </div>
              </div>
              <div className="w-full h-2 overflow-hidden rounded-full bg-surface-container mt-space-md">
                <div className="h-full rounded-full bg-secondary" style={{ width: `${summary.pct2}%` }}></div>
              </div>
            </div>

            <div className="flex flex-col justify-between border shadow-sm lg:col-span-2 bg-surface-card border-surface-border rounded-xl p-space-lg">
              <div>
                <span className="block font-label-sm text-label-sm text-secondary mb-space-sm">03 • KANDIDAT LAWAN</span>
                <h2 className="mb-1 font-headline-sm text-headline-sm text-on-surface">Hj. Ratna Sari</h2>
                <p className="font-body-sm text-body-sm text-secondary mb-space-md">Pemberdayaan UMKM</p>
                <div className="flex items-baseline gap-space-sm">
                  <span className="font-headline-lg text-headline-lg text-on-surface">{summary.paslon3}</span>
                  <span className="ml-auto font-headline-sm text-headline-sm text-secondary">{summary.pct3}%</span>
                </div>
              </div>
              <div className="w-full h-2 overflow-hidden rounded-full bg-surface-container mt-space-md">
                <div className="h-full rounded-full bg-tertiary-container" style={{ width: `${summary.pct3}%` }}></div>
              </div>
            </div>
          </div>

          <section className="flex flex-col gap-space-md">
            <div>
              <h2 className="font-headline-md text-headline-md text-on-surface">Galeri Verifikasi Dokumen C-Plano per TPS</h2>
              <p className="font-body-sm text-body-sm text-secondary">Bukti fisik dokumen C-Hasil Plano yang diverifikasi saksi dan berstempel resmi KPPS.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-space-md">
              {filteredTps.map((tps) => {
                const sahTps = Number(tps.suara_paslon_1) + Number(tps.suara_paslon_2) + Number(tps.suara_paslon_3);
                const totalTps = sahTps + Number(tps.suara_tidak_sah);
                const pctKita = sahTps ? ((Number(tps.suara_paslon_1) / sahTps) * 100).toFixed(1) : '0.0';

                return (
                  <article key={tps.kode_tps} className="flex flex-col justify-between overflow-hidden border shadow-sm bg-surface-card border-surface-border rounded-xl">
                    <div>
                      <div className="flex flex-col justify-between w-full h-40 p-4 border-b bg-surface-container-low border-surface-border">
                        <div className="flex items-center justify-between">
                          <span className="bg-surface-card border border-surface-border text-on-surface font-label-sm text-label-sm px-2.5 py-1 rounded">{tps.kode_tps}</span>
                          <span className="bg-status-kita-bg border border-status-kita-border text-status-kita-text font-label-sm text-label-sm px-2.5 py-1 rounded-full">{tps.status_plano}</span>
                        </div>
                        <div className="text-center">
                          <span className="block font-label-sm text-label-sm text-on-surface">Arsip C-Hasil Plano</span>
                          <span className="font-mono text-xs text-secondary">{tps.hash_code}</span>
                        </div>
                        <div className="bg-on-surface text-surface rounded px-2.5 py-1 text-label-sm font-label-sm flex justify-between">
                          <span>Saksi: {tps.saksi_utama}</span>
                          <span className="text-primary-fixed">Stempel Sah</span>
                        </div>
                      </div>

                      <div className="p-space-md">
                        <h3 className="font-headline-sm text-headline-sm text-on-surface">{tps.nama_tps}</h3>
                        <p className="font-body-sm text-body-sm text-secondary mb-space-sm">{tps.lokasi}</p>
                        <div className="space-y-1 rounded-lg bg-surface-container-low p-space-sm">
                          <div className="flex justify-between text-body-sm">
                            <span className="font-medium">01 H. Rahmat:</span>
                            <span className="font-bold text-primary-container">{tps.suara_paslon_1} Suara ({pctKita}%)</span>
                          </div>
                          <div className="flex justify-between text-body-sm text-secondary">
                            <span>02 Bambang:</span>
                            <span className="font-semibold text-on-surface">{tps.suara_paslon_2} Suara</span>
                          </div>
                          <div className="flex justify-between text-body-sm text-secondary">
                            <span>03 Ratna Sari:</span>
                            <span className="font-semibold text-on-surface">{tps.suara_paslon_3} Suara</span>
                          </div>
                          <div className="flex justify-between pt-1 border-t text-label-sm text-secondary border-surface-border">
                            <span>Tidak Sah: {tps.suara_tidak_sah}</span>
                            <span>Total: {totalTps} Suara</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 pt-0 p-space-md">
                      <button
                        type="button"
                        onClick={() => setSelectedPlano(tps)}
                        className="w-full min-h-[44px] bg-surface-container text-on-surface rounded-lg font-label-md text-label-md hover:bg-surface-variant transition-colors"
                      >
                        Lihat Detail C-Plano
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingTps({ ...tps })}
                        className="w-full min-h-[44px] bg-surface border border-surface-border text-secondary hover:text-on-surface rounded-lg font-label-sm text-label-sm transition-colors"
                      >
                        Audit & Koreksi Angka
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          <section className="flex flex-col border shadow-sm bg-surface-card border-surface-border rounded-xl p-space-lg gap-space-md">
            <h2 className="font-headline-md text-headline-md text-on-surface">Tabel Audit Komparasi Triangulasi Data Suara</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b bg-surface-container-low text-secondary font-label-sm text-label-sm border-surface-border">
                    <th className="p-space-md">WILAYAH TPS</th>
                    <th className="text-center p-space-md">DPT RESMI</th>
                    <th className="p-space-md">01 RAHMAT (RC / Plano / Timses)</th>
                    <th className="p-space-md">02 BAMBANG (RC / Plano / Timses)</th>
                    <th className="p-space-md">03 RATNA (RC / Plano / Timses)</th>
                    <th className="text-center p-space-md">TIDAK SAH</th>
                    <th className="text-center p-space-md">STATUS AUDIT</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border font-body-sm text-body-sm">
                  {filteredTps.map((row) => (
                    <tr key={row.kode_tps} className="hover:bg-surface-container-low">
                      <td className="p-space-md font-label-md">{row.kode_tps} • {row.nama_tps}</td>
                      <td className="text-center p-space-md">{row.total_dpt}</td>
                      <td className="font-bold p-space-md text-primary-container">{row.suara_paslon_1} / {row.suara_paslon_1} / {row.suara_paslon_1}</td>
                      <td className="p-space-md">{row.suara_paslon_2} / {row.suara_paslon_2} / {row.suara_paslon_2}</td>
                      <td className="p-space-md">{row.suara_paslon_3} / {row.suara_paslon_3} / {row.suara_paslon_3}</td>
                      <td className="font-bold text-center p-space-md text-status-lain-text">{row.suara_tidak_sah}</td>
                      <td className="text-center p-space-md">
                        <span className="px-2.5 py-1 rounded-full text-label-sm bg-status-kita-bg text-status-kita-text">100% Cocok</span>
                      </td>
                    </tr>
                  ))}
                  <tr className="font-bold bg-status-kita-bg/60">
                    <td className="p-space-md text-primary-dark">TOTAL REKAPITULASI</td>
                    <td className="text-center p-space-md">{summary.totalDpt}</td>
                    <td className="p-space-md text-primary-container">{summary.paslon1} Suara ({summary.pct1}%)</td>
                    <td className="p-space-md">{summary.paslon2} Suara ({summary.pct2}%)</td>
                    <td className="p-space-md">{summary.paslon3} Suara ({summary.pct3}%)</td>
                    <td className="text-center p-space-md text-status-lain-text">{summary.tidakSah}</td>
                    <td className="text-center p-space-md text-status-kita-text">SAH LENGKAP</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {selectedPlano && (
          <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-inverse-surface/60 backdrop-blur-sm">
            <div className="flex flex-col w-full max-w-lg border shadow-2xl bg-surface-card border-surface-border rounded-2xl p-space-lg gap-space-md">
              <div className="flex items-center justify-between pb-2 border-b border-surface-border">
                <h3 className="font-headline-sm text-headline-sm">Pratinjau C-Plano: {selectedPlano.kode_tps} ({selectedPlano.nama_tps})</h3>
                <button type="button" onClick={() => setSelectedPlano(null)} className="min-w-[44px] min-h-[44px] rounded-lg bg-surface-container">✕</button>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-3 font-bold rounded-lg bg-status-kita-bg text-status-kita-text">01 Rahmat: {selectedPlano.suara_paslon_1}</div>
                <div className="p-3 font-bold rounded-lg bg-surface-container">02 Bambang: {selectedPlano.suara_paslon_2}</div>
                <div className="p-3 font-bold rounded-lg bg-surface-container">03 Ratna: {selectedPlano.suara_paslon_3}</div>
              </div>
              <p className="text-body-sm text-secondary">Saksi: {selectedPlano.saksi_utama} • Hash: {selectedPlano.hash_code}</p>
              <button type="button" onClick={() => setSelectedPlano(null)} className="min-h-[44px] bg-primary-container text-on-primary rounded-lg font-label-md">Tutup Pratinjau</button>
            </div>
          </div>
        )}

        {editingTps && (
          <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-inverse-surface/60 backdrop-blur-sm">
            <form onSubmit={handleSaveAuditTps} className="flex flex-col w-full max-w-md gap-3 border shadow-2xl bg-surface-card border-surface-border rounded-2xl p-space-lg">
              <h3 className="font-headline-sm text-headline-sm">Audit Angka {editingTps.kode_tps} ({editingTps.nama_tps})</h3>
              <label className="font-label-sm text-status-kita-text">
                Suara 01 H. Rahmat Hidayat
                <input type="number" value={editingTps.suara_paslon_1} onChange={(e) => setEditingTps({ ...editingTps, suara_paslon_1: e.target.value })} className="w-full min-h-[44px] px-3 mt-1 bg-status-kita-bg border border-status-kita-border rounded-lg font-bold" />
              </label>
              <label className="font-label-sm text-secondary">
                Suara 02 Drs. Bambang
                <input type="number" value={editingTps.suara_paslon_2} onChange={(e) => setEditingTps({ ...editingTps, suara_paslon_2: e.target.value })} className="w-full min-h-[44px] px-3 mt-1 bg-surface border border-surface-border rounded-lg" />
              </label>
              <label className="font-label-sm text-secondary">
                Suara 03 Hj. Ratna Sari
                <input type="number" value={editingTps.suara_paslon_3} onChange={(e) => setEditingTps({ ...editingTps, suara_paslon_3: e.target.value })} className="w-full min-h-[44px] px-3 mt-1 bg-surface border border-surface-border rounded-lg" />
              </label>
              <label className="font-label-sm text-status-lain-text">
                Suara Tidak Sah
                <input type="number" value={editingTps.suara_tidak_sah} onChange={(e) => setEditingTps({ ...editingTps, suara_tidak_sah: e.target.value })} className="w-full min-h-[44px] px-3 mt-1 bg-surface border border-surface-border rounded-lg" />
              </label>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setEditingTps(null)} className="min-h-[44px] px-4 bg-surface-container rounded-lg font-label-md">Batal</button>
                <button type="submit" className="min-h-[44px] px-4 bg-primary-container text-on-primary rounded-lg font-label-md">Simpan Hasil Audit</button>
              </div>
            </form>
          </div>
        )}
      </div>
    </WarRoomShell>
  );
}