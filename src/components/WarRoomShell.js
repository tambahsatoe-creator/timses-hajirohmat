'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/overview', icon: 'dashboard', label: 'Pusat Komando', shortLabel: 'Komando' },
  { href: '/real-count-c-plano', icon: 'how_to_vote', label: 'Kotak Suara / Real Count', shortLabel: 'Real Count' },
  { href: '/rekap-dpt-saksi', icon: 'badge', label: 'Rekap DPT & Saksi TPS', shortLabel: 'DPT & Saksi' },
  { href: '/pemetaan-teritorial', icon: 'map', label: 'Pemetaan Teritorial', shortLabel: 'Teritorial' },
  { href: '/tren-elektabilitas', icon: 'insights', label: 'Tren Elektabilitas & Analitik', shortLabel: 'Analitik' },
  { href: '/master-konfigurasi', icon: 'tune', label: 'Master Konfigurasi Sistem', shortLabel: 'Konfigurasi' },
];

export default function WarRoomShell({
  children,
  searchValue = '',
  onSearchChange,
  searchPlaceholder = 'Cari No TPS, Saksi, NIK DPT...',
  onSyncClick,
  syncLoading = false,
}) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const raw = localStorage.getItem('mytps_user');
    if (!raw) return;
    try {
      const user = JSON.parse(raw);
      if (user.peran === 'relawan') {
        router.replace('/input-cepat-warga');
      } else if (user.peran === 'saksi') {
        router.replace('/saksi-tps?tab=realcount');
      }
    } catch {
      // Abaikan bila data sesi kosong
    }
  }, [router]);

  function handleLogout() {
    localStorage.removeItem('mytps_user');
    router.push('/login');
  }

  return (
    <div className="flex flex-col min-h-screen bg-bg-base text-on-surface">
      <aside
        aria-label="Navigasi Pusat Komando"
        className="fixed top-0 left-0 z-50 flex-col items-center hidden w-20 h-full border-r select-none lg:flex bg-surface-card border-surface-border py-space-md"
      >
        <Link
          href="/overview"
          title="Beranda War Room"
          className="flex items-center justify-center w-12 h-12 transition-colors rounded-xl bg-primary-container text-on-primary mb-space-lg hover:bg-primary-dark"
        >
          <span className="material-symbols-outlined text-[26px]">shield</span>
        </Link>

        <nav className="flex flex-col items-center flex-1 w-full gap-space-sm px-space-xs">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? 'page' : undefined}
                title={item.label}
                className={`relative group flex items-center justify-center w-12 h-12 rounded-xl transition-all ${
                  isActive
                    ? 'bg-status-kita-bg text-status-kita-text border border-status-kita-border'
                    : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[24px]">{item.icon}</span>
                <span className="absolute z-50 py-1 transition-opacity rounded shadow-sm opacity-0 pointer-events-none left-16 px-space-sm bg-inverse-surface text-inverse-on-surface font-label-sm text-label-sm group-hover:opacity-100 whitespace-nowrap">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="flex flex-col items-center w-full border-t gap-space-sm px-space-xs pt-space-sm border-surface-border">
          <button
            type="button"
            onClick={handleLogout}
            title="Keluar dari Admin War Room"
            className="flex items-center justify-center w-12 h-12 transition-all rounded-xl text-status-lain-text hover:bg-status-lain-bg"
          >
            <span className="material-symbols-outlined text-[24px]">logout</span>
          </button>
        </div>
      </aside>

      <div className="flex flex-col flex-1 lg:pl-20">
        <header className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between h-16 px-4 border-b lg:left-20 bg-surface-card border-surface-border lg:px-space-xl gap-space-md">
          <div className="flex items-center min-w-0 gap-space-md">
            <div className="flex items-center py-1 border rounded gap-space-xs px-space-sm bg-status-kita-bg border-status-kita-border text-status-kita-text font-label-sm text-label-sm shrink-0">
              <span className="w-2 h-2 rounded-full bg-primary-container"></span>
              <span>ADMIN WAR ROOM</span>
            </div>
            <div className="items-center hidden truncate border-l md:flex text-secondary font-label-sm text-label-sm border-surface-border pl-space-md">
              <span className="material-symbols-outlined text-[16px] mr-1 text-primary-container">hub</span>
              <span>4 TPS Desa Aktif • Kampung Makmur Jaya</span>
            </div>
          </div>

          <div className="flex items-center gap-space-sm sm:gap-space-md">
            {onSearchChange && (
              <div className="relative items-center hidden sm:flex">
                <span className="material-symbols-outlined absolute left-3 text-secondary text-[20px]">search</span>
                <input
                  type="text"
                  value={searchValue}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="pl-10 border rounded-lg w-52 lg:w-72 h-11 pr-space-md bg-surface border-surface-border font-body-sm text-body-sm text-on-surface placeholder:text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                />
              </div>
            )}

            {onSyncClick && (
              <button
                type="button"
                onClick={onSyncClick}
                disabled={syncLoading}
                className="min-h-[44px] px-space-md bg-surface border border-surface-border rounded-lg text-on-surface font-label-md text-label-md flex items-center gap-space-xs hover:bg-surface-container transition-colors disabled:opacity-60"
              >
                <span className={`material-symbols-outlined text-[18px] text-primary-container ${syncLoading ? 'animate-spin' : ''}`}>
                  sync
                </span>
                <span className="hidden sm:inline">{syncLoading ? 'Menyinkronkan...' : 'Sinkronkan'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleLogout}
              className="min-h-[44px] px-3 bg-status-lain-bg border border-status-lain-border rounded-lg text-status-lain-text font-label-sm text-label-sm flex items-center gap-1 hover:opacity-90 transition-opacity"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
              <span>Keluar</span>
            </button>
          </div>
        </header>

        <main className="flex-1 w-full pt-16 pb-24 lg:pb-10">{children}</main>
      </div>

      <nav
        aria-label="Navigasi Mobile War Room"
        className="fixed inset-x-0 bottom-0 z-50 border-t lg:hidden bg-surface-card border-surface-border pb-safe"
      >
        <div className="grid h-16 grid-cols-6 px-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? 'page' : undefined}
                className={`flex flex-col items-center justify-center min-h-[44px] rounded-lg transition-colors ${
                  isActive ? 'text-primary font-bold' : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                <span className="text-[10px] font-semibold mt-0.5 truncate max-w-full px-0.5">{item.shortLabel}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}