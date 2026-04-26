import React from 'react';
import { LayoutDashboard, FileText, Package, Calendar, EuroIcon, Bell, Settings, Upload, Plus } from 'lucide-react';

export type Page = 'dashboard' | 'contracts' | 'abonnements' | 'timeline' | 'kosten' | 'meldingen' | 'settings';

interface SidebarProps {
  current: Page;
  onChange: (p: Page) => void;
  urgentCount: number;
  unreadCount: number;
  onUploadContract?: () => void;
  onAddAbonnement?: () => void;
}

const NAV: { id: Page; label: string; icon: React.ReactNode; section?: string }[] = [
  { id: 'dashboard',   label: 'Dashboard',      icon: <LayoutDashboard size={18} /> },
  { id: 'contracts',   label: 'Contracten',      icon: <FileText size={18} />,   section: 'Beheer' },
  { id: 'abonnements', label: 'Abonnementen',    icon: <Package size={18} /> },
  { id: 'kosten',      label: 'Kosten',          icon: <EuroIcon size={18} />,   section: 'Overzicht' },
  { id: 'timeline',    label: 'Tijdlijn',        icon: <Calendar size={18} /> },
  { id: 'meldingen',   label: 'Meldingen',       icon: <Bell size={18} /> },
];

export function Sidebar({ current, onChange, urgentCount, unreadCount, onUploadContract, onAddAbonnement }: SidebarProps) {
  return (
    <aside className="hidden sm:flex flex-col w-56 min-w-[14rem] bg-white border-r border-gray-200 h-full">
      {/* Logo */}
      <div className="px-5 py-5 flex items-center gap-3 border-b border-gray-100">
        <div className="w-9 h-9 rounded-xl bg-pactly-gradient flex items-center justify-center flex-shrink-0 shadow-sm">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M3 4h8l3 3v7H3V4z" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
            <path d="M10 4v3h3" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
            <line x1="6" y1="9" x2="12" y2="9" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="6" y1="12" x2="10" y2="12" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>
        <div>
          <div className="text-dark font-extrabold text-base leading-none tracking-tight">Pactly</div>
          <div className="text-mid text-xs mt-0.5">contractbeheer</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-2 flex flex-col gap-0.5 overflow-y-auto">
        {NAV.map((item, idx) => {
          const active = current === item.id;
          const badge = item.id === 'dashboard' ? urgentCount
                      : item.id === 'meldingen' ? unreadCount
                      : 0;
          const prevItem = NAV[idx - 1];
          const showSection = item.section && (!prevItem || prevItem.section !== item.section);

          return (
            <React.Fragment key={item.id}>
              {showSection && (
                <div className="px-3 pt-4 pb-1">
                  <span className="text-gray-400 text-[10px] font-semibold uppercase tracking-widest">{item.section}</span>
                </div>
              )}
              <button
                onClick={() => onChange(item.id)}
                className={[
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all relative',
                  active
                    ? 'bg-violet text-white shadow-sm'
                    : 'text-mid hover:bg-gray-50 hover:text-dark',
                ].join(' ')}
              >
                {item.icon}
                {item.label}
                {badge > 0 && (
                  <span className={`ml-auto text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center ${active ? 'bg-white/25 text-white' : 'bg-coral text-white'}`}>
                    {badge > 9 ? '9+' : badge}
                  </span>
                )}
              </button>
            </React.Fragment>
          );
        })}

        {/* Divider + Settings */}
        <div className="border-t border-gray-100 mt-2 pt-2">
          <button
            onClick={() => onChange('settings')}
            className={[
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all',
              current === 'settings'
                ? 'bg-violet text-white shadow-sm'
                : 'text-mid hover:bg-gray-50 hover:text-dark',
            ].join(' ')}
          >
            <Settings size={18} />
            Instellingen
          </button>
        </div>
      </nav>

      {/* Primary CTAs */}
      <div className="px-3 pb-3 flex flex-col gap-2">
        <button
          onClick={onUploadContract}
          className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-pactly-gradient text-white text-sm font-bold shadow-sm hover:opacity-90 hover:-translate-y-0.5 transition-all"
        >
          <Upload size={15} />
          Contract uploaden
        </button>
        <button
          onClick={onAddAbonnement}
          className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border text-violet text-sm font-semibold transition-all hover:opacity-80"
          style={{ backgroundColor: 'rgba(91,63,232,0.07)', borderColor: 'rgba(91,63,232,0.20)' }}
        >
          <Plus size={15} />
          Abonnement toevoegen
        </button>
      </div>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-gray-100">
        <p className="text-xs text-gray-400 font-mono">Pactly MVP v1.0</p>
      </div>
    </aside>
  );
}
