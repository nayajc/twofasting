'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const TABS = [
  {
    href: '/timer',
    label: '타이머',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#111827' : '#9CA3AF'} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
  {
    href: '/weight',
    label: '체중',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#111827' : '#9CA3AF'} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2h12l1 5H5L6 2z"/><rect x="2" y="7" width="20" height="15" rx="2"/><path d="M12 12v4"/><path d="M10 14h4"/>
      </svg>
    ),
  },
  {
    href: '/history',
    label: '기록',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#111827' : '#9CA3AF'} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
];

export function BottomNav() {
  const path = usePathname();
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex safe-bottom z-50">
      {TABS.map(tab => {
        const active = path.startsWith(tab.href);
        return (
          <Link key={tab.href} href={tab.href} className="flex-1 flex flex-col items-center py-3 gap-1">
            {tab.icon(active)}
            <span className={`text-[11px] font-bold ${active ? 'text-gray-900' : 'text-gray-400'}`}>
              {tab.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
