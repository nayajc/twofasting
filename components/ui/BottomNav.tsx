'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';

const TABS = [
  { href: '/timer', icon: '⏱️', label: '타이머' },
  { href: '/history', icon: '📅', label: '히스토리' },
];

export function BottomNav() {
  const path = usePathname();
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex safe-bottom z-50 shadow-lg">
      {TABS.map(tab => {
        const active = path.startsWith(tab.href);
        return (
          <Link key={tab.href} href={tab.href} className="flex-1 flex flex-col items-center py-3 gap-0.5">
            <motion.span
              animate={{ scale: active ? 1.2 : 1 }}
              className="text-2xl"
            >
              {tab.icon}
            </motion.span>
            <span className={`text-xs font-bold ${active ? 'text-primary' : 'text-gray-400'}`}>
              {tab.label}
            </span>
            {active && (
              <motion.div layoutId="nav-indicator" className="absolute bottom-1 w-1 h-1 rounded-full bg-primary" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
