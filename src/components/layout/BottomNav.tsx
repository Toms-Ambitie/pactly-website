import React from 'react';
import { LayoutDashboard, FileText, Package, Bell, Settings } from 'lucide-react';
import type { Page } from './Sidebar';

interface BottomNavProps {
  current: Page;
  onChange: (p: Page) => void;
  urgentCount: number;
  unreadCount: number;
}

const NAV: { id: Page; label: string; icon: React.ReactNode }[] = [
  { id: 'dashboard',   label: 'Home',       icon: <LayoutDashboard size={22} /> },
  { id: 'contracts',   label: 'Contracten', icon: <FileText size={22} /> },
  { id: 'abonnements', label: 'Abon.',      icon: <Package size={22} /> },
  { id: 'meldingen',   label: 'Meldingen', icon: <Bell size={22} /> },
  { id: 'settings',    label: 'Meer',      icon: <Settings size={22} /> },
];

export function BottomNav({ current, onChange, urgentCount, unreadCount }: BottomNavProps) {
  return (
    <nav className="sm:hidden fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 flex z-40 shadow-[0_-1px_12px_rgba(0,0,0,0.06)]">
      {NAV.map(item => {
        const active = current === item.id;
        const badge = item.id === 'dashboard' ? urgentCount
                    : item.id === 'meldingen' ? unreadCount
                    : 0;
        return (
          <button
            key={item.id}
            onClick={() => onChange(item.id)}
            className={[
              'flex-1 flex flex-col items-center gap-1 py-3 text-[10px] font-semibold transition-colors relative',
              active ? 'text-violet' : 'text-gray-400',
            ].join(' ')}
          >
            {item.icon}
            {item.label}
            {badge > 0 && (
              <span className="absolute top-2 right-1/4 bg-coral text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {badge > 9 ? '9+' : badge}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}
