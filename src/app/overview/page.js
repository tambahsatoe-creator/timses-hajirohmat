'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import WarRoomShell from '@/components/WarRoomShell';
import { supabase } from '@/lib/supabase';

const INITIAL_DUSUN = [
  {
    id: 1,
    kode: 'D1',
    nama: 'Dusun 01 Krajan',
    badge: 'Basis Kuat (72%)',
    badgeTone: 'hijau',
    tpsLabel: 'TPS 01 & TPS 02',
    kordes: 'Hendra Gunawan',
    kordesWa: '6281298440001',
    tercapai: 216,
    target: 280,
    hijau: 198,
    ragu: 32,
    lawan: 12,
    plottingPct: 94,
    catatan: '12 Relawan Door-to-Door Aktif',
  },
  {
    id: 2,
    kode: 'D2',
    nama: 'Dusun 02 Sukamaju',
    badge: 'Pertarungan Ketat',
    badgeTone: 'kuning',
    tpsLabel: 'TPS 03',
    kordes: 'Ridwan Kamiludin',
    kordesWa: '6282144320002',
    tercapai: 144,
    target: 210,
    hijau: 132,
    ragu: 24,
    lawan: 8,
    plottingPct: 88,
    catatan: 'Perlu Tambahan Canvassing RT 03',
  },
  {
    id: 3,
    kode: 'D3',
    nama: 'Dusun 03 Harapan',
    badge: 'Kandang Suara (81%)',
    badgeTone: 'hijau',
    tpsLabel: 'TPS 04',
    kordes: 'Siti Nurhaliza',
    kordesWa: '6285711920003',
    tercapai: 102,
    target: 160,
    hijau: 102,
    ragu: 12,
    lawan: 4,
    plottingPct: 96,
    catatan: '8 Relawan Aktif',
  },
];

const INITIAL_FEED = [
  {
    id: 1,
    inisial: 'AW',
    warnaBg: 'bg-primary-container text-on-primary',
    nama: 'Andi Wijaya',
    peran: 'Relawan Dusun Krajan',
    waktu: '3 menit lalu',
    pesan: 'Mencatat verifikasi 3 warga baru di RT 02 Dusun Krajan. Status dukungan: Pasti Hijau.',
    lokasi: 'RT 02 / RW 01 Dusun Krajan',
    statusTag: 'Data Valid NIK',
  },
  {
    id: 2,
    inisial: 'FS',
    warnaBg: 'bg-secondary text-on-secondary',
    nama: 'Fajar Sidiq',
    peran: 'Saksi TPS 01',
    waktu: '11 menit lalu',
    pesan: 'Undangan C-Pemberitahuan 92% telah terdistribusi fisik kepada pemilih terdaftar kita.',
    lokasi: 'TPS 01 Krajan',
    statusTag: 'Logistik Aman',
  },
  {
    id: 3,
    inisial: 'RK',
    warnaBg: 'bg-status-ragu-text text-on-primary',
    nama: 'Ridwan Kamiludin',
    peran: 'Kordes Sukamaju',
    waktu: '28 menit lalu',
    pesan: 'Mengalihkan status 2 warga RT 03 dari Masih Ragu menjadi Pasti Hijau setelah silaturahmi.',
    lokasi: 'Dusun Sukamaju',
    statusTag: 'Konversi Berhasil',
  },
];

const INITIAL_TPS_STATUS = [
  { kode: '01', nama: 'TPS 01 Krajan Barat', saksi: 'Fajar Sidiq (Mandat Valid)', status: 'Hadir 100%', pemilihKita: 148, wa: '6281244519921', aman: true },
  { kode: '02', nama: 'TPS 02 Krajan Timur', saksi: 'Budi Santoso (Mandat Valid)', status: 'Hadir 100%', pemilihKita: 112, wa: '6285277112094', aman: true },
  { kode: '03', nama: 'TPS 03 Sukamaju', saksi: 'Agus Purnomo (Mandat Valid)', status: 'Perlu Monitor', pemilihKita: 96, wa: '6282166443200', aman: false },
  { kode: '04', nama: 'TPS 04 Harapan Makmur', saksi: 'Dewi Lestari (Mandat Valid)', status: 'Hadir 100%', pemilihKita: 76, wa: '6285643219988', aman: true },
];

export default function OverviewWarRoomPage() {
  const [liveClock, setLiveClock] = useState('14:38:22 WIB');
  const [searchQuery, setSearchQuery] = useState('');
  const [syncLoading, setSyncLoading] = useState(false);
  const [voterStats, setVoterStats] = useState({
    targetMenang: 650,
    terdata: 524,
    hijau: 432,
    kuning: 68,
    merah: 24,
    estimasiMenang: 78.4,
  });
  const [feedList, setFeedList] = useState(INITIAL_FEED);
  const [statusBanner, setStatusBanner] = useState('');

  useEffect(() => {
    function updateClock() {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, '0');
      const m = String(now.getMinutes()).padStart(2, '0');
      const s = String(now.getSeconds()).padStart(2, '0');
      setLiveClock(`${h}:${m}:${s} WIB`);
    }
    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchLiveOverview();
  }, []);

  async function fetchLiveOverview() {
    if (!supabase) return;
    setSyncLoading(true);
    try {
      const { data: pemilihData, error } = await supabase
        .from('pemilih')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && pemilihData && pemilihData.length > 0) {
        const extraHijau = pemilihData.filter((p) => p.status_dukungan === 'hijau').length;
        const extraKuning = pemilihData.filter((p) => p.status_dukungan === 'kuning').length;
        const extraMerah = pemilihData.filter((p) => p.status_dukungan === 'merah').length;

        const baseHijau = 430 + extraHijau;
        const baseKuning = 67 + extraKuning;
        const baseMerah = 23 + extraMerah;

        setVoterStats({
          targetMenang: 650,
          terdata: baseHijau + baseKuning + baseMerah,
          hijau: baseHijau,
          kuning: baseKuning,
          merah: baseMerah,
          estimasiMenang: 78.4,
        });

        const latestFromDb = pemilihData.slice(0, 2).map((item, idx) => ({
          id: `db-${idx}`,
          inisial: 'TM',
          warnaBg: 'bg-primary-container text-on-primary',
          nama: item.pencatat_nama || 'Andi Wijaya',
          peran: `Timses ${item.dusun || 'Dusun Krajan'}`,
          waktu: 'Baru disetor',
          pesan: `Mencatat dukungan ${item.nama_lengkap} (${item.jumlah_anggota_kk || 1} anggota KK) di ${item.rt}. Status: ${(item.status_dukungan || 'hijau').toUpperCase()}.`,
          lokasi: `${item.rt} • ${item.tps}`,
          statusTag: 'Sinkron Database',
        }));

        setFeedList([...latestFromDb, ...INITIAL_FEED]);
      }
    } catch {
      // Gunakan metrik bawaan jika jaringan lambat
    } finally {
      setSyncLoading(false);
    }
  }

  function handleShareSummary() {
    const text = `Ringkasan Komando Timses H. Rahmat Hidayat:%0A- Target Menang: ${voterStats.targetMenang} Suara%0A- Terdata: ${voterStats.terdata} Warga%0A- Pasti Hijau: ${voterStats.hijau} Suara%0A- Masih Ragu: ${voterStats.kuning} Suara%0A- Estimasi Menang: ${voterStats.estimasiMenang}%`;
    window.open(`https://wa.me/?text=${text}`, '_blank');
  }

  const filteredDusun = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return INITIAL_DUSUN;
    return INITIAL_DUSUN.filter((d) =>
      `${d.nama} ${d.kordes} ${d.tpsLabel}`.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const filteredTps = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return INITIAL_TPS_STATUS;
    return INITIAL_TPS_STATUS.filter((t) =>
      `${t.nama} ${t.saksi}`.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  return (
    <WarRoomShell
      searchValue={searchQuery}
      onSearchChange={setSearchQuery}
      searchPlaceholder="Cari TPS, Dusun, atau Kordes..."
      onSyncClick={() => {
        fetchLiveOverview();
        setStatusBanner('Data Pusat Komando berhasil disinkronkan.');
        setTimeout(() => setStatusBanner(''), 3000);
      }}
      syncLoading={syncLoading}
    >
      <div className="px-4 lg:px-space-xl py-space-xl flex flex-col w-full space-y-space-xl max-w-[1600px] mx-auto">
        {statusBanner && (
          <div role="status" className="flex items-center gap-2 px-4 py-3 border bg-status-kita-bg border-status-kita-border text-status-kita-text rounded-xl font-label-md">
            <span className="material-symbols-outlined text-[20px]">check_circle</span>
            <span>{statusBanner}</span>
          </div>
        )}

        <section className="flex flex-col w-full border shadow-sm bg-surface-card border-surface-border rounded-xl p-space-lg lg:flex-row lg:items-center lg:justify-between gap-space-lg">
          <div className="flex items-center gap-space-lg">
            <div className="relative shrink-0">
              <div className="flex items-center justify-center w-16 h-16 rounded-full shadow-sm bg-primary-container text-on-primary font-headline-md">
                HR
              </div>
              <div className="absolute -bottom-1 -right-1 bg-primary text-on-primary rounded-full px-2 py-0.5 font-label-sm">
                01
              </div>
            </div>

            <div className="flex flex-col">
              <div className="flex flex-wrap items-center gap-space-xs">
                <h1 className="font-headline-md text-on-surface">H. Rahmat Hidayat</h1>
                <span className="material-symbols-outlined text-primary text-[20px]">verified</span>
                <span className="bg-primary-fixed text-on-primary-fixed-variant px-2.5 py-0.5 rounded-full font-label-sm">
                  No. Urut 01
                </span>
                <span className="bg-surface-container px-2.5 py-0.5 rounded-full font-label-sm text-on-surface-variant">
                  Pilkades Kampung Makmur Jaya
                </span>
              </div>
              <div className="flex flex-wrap items-center mt-1 gap-space-sm text-on-surface-variant font-body-sm">
                <span>Sinkronisasi Real-Time</span>
                <span>•</span>
                <span className="font-mono font-medium text-on-surface">{liveClock}</span>
                <span>•</span>
                <span className="text-primary-dark font-label-sm">Dashboard Admin Pusat Komando</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-space-sm">
            <button
              type="button"
              onClick={() => window.print()}
              className="min-h-[44px] px-space-lg bg-surface-container-low hover:bg-surface-container border border-surface-border text-on-surface rounded-lg font-label-md flex items-center gap-space-xs"
            >
              <span className="material-symbols-outlined text-[18px]">download</span>
              <span>Export Rekap</span>
            </button>
            <button
              type="button"
              onClick={handleShareSummary}
              className="min-h-[44px] px-space-lg bg-primary-container hover:bg-primary-dark text-on-primary rounded-lg font-label-md flex items-center gap-space-xs"
            >
              <span className="material-symbols-outlined text-[18px]">share</span>
              <span>Bagikan Ringkasan</span>
            </button>
          </div>
        </section>

        <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-space-md">
          <div className="flex flex-col justify-between border shadow-sm bg-surface-card border-surface-border rounded-xl p-space-lg">
            <span className="uppercase font-label-sm text-on-surface-variant">Target Menang</span>
            <div className="my-space-xs">
              <div className="font-bold font-headline-lg text-on-surface">{voterStats.targetMenang}</div>
              <span className="font-body-sm text-on-surface-variant">Suara Sah Minimum</span>
            </div>
            <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-secondary" style={{ width: '100%' }}></div>
            </div>
          </div>

          <div className="flex flex-col justify-between border shadow-sm bg-surface-card border-surface-border rounded-xl p-space-lg">
            <span className="uppercase font-label-sm text-on-surface-variant">Terdata Lapangan</span>
            <div className="my-space-xs">
              <div className="font-bold font-headline-lg text-on-surface">{voterStats.terdata}</div>
              <span className="font-medium font-body-sm text-primary-dark">
                {((voterStats.terdata / voterStats.targetMenang) * 100).toFixed(1)}% Terverifikasi
              </span>
            </div>
            <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-primary-container" style={{ width: '80.6%' }}></div>
            </div>
          </div>

          <div className="flex flex-col justify-between border shadow-sm bg-status-kita-bg border-status-kita-border rounded-xl p-space-lg">
            <span className="uppercase font-label-sm text-status-kita-text">Pasti Hijau (Kita)</span>
            <div className="my-space-xs">
              <div className="font-bold font-headline-lg text-status-kita-text">{voterStats.hijau}</div>
              <span className="font-medium font-body-sm text-status-kita-text">66.5% Basis Kokoh</span>
            </div>
            <div className="w-full bg-surface-container-lowest h-1.5 rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-primary-container" style={{ width: '66.5%' }}></div>
            </div>
          </div>

          <div className="flex flex-col justify-between border shadow-sm bg-status-ragu-bg border-status-ragu-border rounded-xl p-space-lg">
            <span className="uppercase font-label-sm text-status-ragu-text">Masih Ragu</span>
            <div className="my-space-xs">
              <div className="font-bold font-headline-lg text-status-ragu-text">{voterStats.kuning}</div>
              <span className="font-medium font-body-sm text-status-ragu-text">10.5% Swing Voters</span>
            </div>
            <div className="w-full bg-surface-container-lowest h-1.5 rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-status-ragu-text" style={{ width: '10.5%' }}></div>
            </div>
          </div>

          <div className="flex flex-col justify-between border shadow-sm bg-status-lain-bg border-status-lain-border rounded-xl p-space-lg">
            <span className="uppercase font-label-sm text-status-lain-text">Pilih Lawan</span>
            <div className="my-space-xs">
              <div className="font-bold font-headline-lg text-status-lain-text">{voterStats.merah}</div>
              <span className="font-medium font-body-sm text-status-lain-text">3.7% Basis Lawan</span>
            </div>
            <div className="w-full bg-surface-container-lowest h-1.5 rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-error" style={{ width: '3.7%' }}></div>
            </div>
          </div>

          <div className="flex flex-col justify-between shadow-sm bg-primary text-on-primary rounded-xl p-space-lg">
            <span className="uppercase font-label-sm text-primary-fixed">Estimasi Menang</span>
            <div className="my-space-xs">
              <div className="font-bold font-headline-lg text-on-primary">{voterStats.estimasiMenang}%</div>
              <span className="font-body-sm text-primary-fixed">Unggul Signifikan</span>
            </div>
            <div className="w-full bg-primary-dark h-1.5 rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-primary-fixed" style={{ width: '78.4%' }}></div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl">
          <div className="flex flex-col lg:col-span-7 gap-space-xl">
            <section className="flex flex-col border shadow-sm bg-surface-card border-surface-border rounded-xl p-space-lg gap-space-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-headline-sm text-on-surface">Pemetaan Suara & Kesiapan Dusun</h2>
                  <p className="font-body-sm text-on-surface-variant">Penetrasi basis suara berdasarkan wilayah Dusun dan TPS</p>
                </div>
                <Link href="/rekap-dpt-saksi" className="text-primary-dark font-label-sm hover:underline">
                  Lihat Rekap DPT →
                </Link>
              </div>

              <div className="flex flex-col gap-space-md">
                {filteredDusun.map((dusun) => (
                  <article key={dusun.id} className="flex flex-col border p-space-lg rounded-xl bg-surface-container-lowest border-surface-border gap-space-md">
                    <div className="flex flex-col justify-between sm:flex-row sm:items-center gap-space-md">
                      <div className="flex items-center gap-space-md">
                        <div className="flex items-center justify-center w-12 h-12 font-bold rounded-xl bg-surface-container text-primary-dark">
                          {dusun.kode}
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-space-xs">
                            <h3 className="font-label-lg text-on-surface">{dusun.nama}</h3>
                            <span className={`px-2.5 py-0.5 rounded-full font-label-sm ${dusun.badgeTone === 'hijau' ? 'bg-status-kita-bg text-status-kita-text' : 'bg-status-ragu-bg text-status-ragu-text'}`}>
                              {dusun.badge}
                            </span>
                          </div>
                          <p className="font-body-sm text-on-surface-variant">
                            {dusun.tpsLabel} • Koordinator: {dusun.kordes}
                          </p>
                        </div>
                      </div>
                      <div className="sm:text-right">
                        <div className="font-headline-sm text-on-surface">
                          {dusun.tercapai} <span className="font-body-sm text-on-surface-variant">/ {dusun.target}</span>
                        </div>
                        <span className="font-label-sm text-status-kita-text">
                          Target {((dusun.tercapai / dusun.target) * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t font-label-sm text-on-surface-variant border-surface-border">
                      <span className="text-status-kita-text">Hijau: {dusun.hijau} Warga</span>
                      <span className="text-status-ragu-text">Ragu: {dusun.ragu} Warga</span>
                      <span className="text-status-lain-text">Lawan: {dusun.lawan} Warga</span>
                      <a
                        href={`https://wa.me/${dusun.kordesWa}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="min-h-[38px] px-3 py-1 rounded-lg bg-surface-container text-on-surface flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-[16px] text-primary">chat</span>
                        <span>Hubungi Kordes</span>
                      </a>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section className="flex flex-col border shadow-sm bg-surface-card border-surface-border rounded-xl p-space-lg gap-space-lg">
              <h2 className="font-headline-sm text-on-surface">Live Feed Aktivitas Lapangan</h2>
              <div className="space-y-space-md">
                {feedList.map((item) => (
                  <article key={item.id} className="flex items-start border p-space-md rounded-xl bg-surface-container-lowest border-surface-border gap-space-md">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold shrink-0 ${item.warnaBg}`}>
                      {item.inisial}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-label-md text-on-surface">{item.nama} • {item.peran}</span>
                        <span className="font-mono font-label-sm text-on-surface-variant">{item.waktu}</span>
                      </div>
                      <p className="mt-1 font-body-sm text-on-surface">{item.pesan}</p>
                      <div className="flex items-center mt-2 gap-space-md text-on-surface-variant font-label-sm">
                        <span>{item.lokasi}</span>
                        <span className="text-primary">• {item.statusTag}</span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </div>

          <div className="flex flex-col lg:col-span-5 gap-space-xl">
            <section className="flex flex-col border shadow-sm bg-surface-card border-surface-border rounded-xl p-space-lg gap-space-lg">
              <div className="flex items-center justify-between">
                <h2 className="font-headline-sm text-on-surface">Peta Kekuatan Kandidat</h2>
                <span className="font-label-sm bg-surface-container px-2.5 py-1 rounded-full">DPT 810</span>
              </div>

              <div className="space-y-space-md">
                <div className="flex items-center justify-between border p-space-md rounded-xl bg-status-kita-bg border-status-kita-border">
                  <div>
                    <span className="block font-label-md text-status-kita-text">01. H. Rahmat Hidayat (KITA)</span>
                    <span className="font-body-sm text-status-kita-text">{voterStats.hijau} Suara Pasti</span>
                  </div>
                  <div className="font-bold font-headline-md text-status-kita-text">66.5%</div>
                </div>

                <div className="flex items-center justify-between border p-space-md rounded-xl bg-surface-container-lowest border-surface-border">
                  <div>
                    <span className="block font-label-md text-on-surface">02. Drs. Bambang S.</span>
                    <span className="font-body-sm text-on-surface-variant">139 Suara Terdeteksi</span>
                  </div>
                  <div className="font-bold font-headline-md text-on-surface">21.4%</div>
                </div>

                <div className="flex items-center justify-between border p-space-md rounded-xl bg-surface-container-lowest border-surface-border">
                  <div>
                    <span className="block font-label-md text-on-surface">03. Hj. Ratna Sari</span>
                    <span className="font-body-sm text-on-surface-variant">79 Suara Terdeteksi</span>
                  </div>
                  <div className="font-bold font-headline-md text-on-surface">12.1%</div>
                </div>
              </div>
            </section>

            <section className="flex flex-col border shadow-sm bg-surface-card border-surface-border rounded-xl p-space-lg gap-space-lg">
              <div className="flex items-center justify-between">
                <h2 className="font-headline-sm text-on-surface">Status Kawal Saksi TPS</h2>
                <span className="bg-status-kita-bg text-status-kita-text px-2.5 py-0.5 rounded-full font-label-sm">4 TPS Siap</span>
              </div>

              <div className="space-y-space-sm">
                {filteredTps.map((item) => (
                  <div key={item.kode} className="flex items-center justify-between border p-space-md rounded-xl bg-surface-container-lowest border-surface-border gap-space-md">
                    <div>
                      <h3 className="font-label-md text-on-surface">{item.nama}</h3>
                      <p className="font-body-sm text-on-surface-variant">{item.saksi}</p>
                    </div>
                    <a
                      href={`https://wa.me/${item.wa}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="min-h-[40px] px-space-md bg-status-kita-bg text-status-kita-text rounded-lg font-label-sm flex items-center gap-1 shrink-0"
                    >
                      <span className="material-symbols-outlined text-[16px]">chat</span>
                      <span>Japri WA</span>
                    </a>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </WarRoomShell>
  );
}