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

/** Hexagoon-beeldmerk — Pactly Brandbook v3.0 */
export function PactlyMark({ size = 36 }: { size?: number }) {
  const uid = Math.random().toString(36).slice(2, 8);
  return (
    <svg
      width={size}
      height={Math.round(size * 1.15)}
      viewBox="0 0 40 46"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Pactly beeldmerk"
    >
      <defs>
        <linearGradient id={`hg-${uid}`} x1="0" y1="0" x2="40" y2="46" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#9098C8" />
          <stop offset="100%" stopColor="#4B519E" />
        </linearGradient>
      </defs>
      {/* Hexagoon (pointy-top, ratio 1:0.866 per brandbook) */}
      <polygon
        points="20,2 37.3,11.5 37.3,34.5 20,44 2.7,34.5 2.7,11.5"
        fill={`url(#hg-${uid})`}
      />
      {/* P — open stroke met ronde caps (Brandbook: Stem 12pt) */}
      <path
        d="M 14 35 V 11 Q 27 11 27 18.5 Q 27 26 14 26"
        stroke="white"
        strokeWidth="3.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

/** Volledig woordmerk: beeldmerk + "Pactly." met coral punt */
export function PactlyWordmark() {
  return (
    <div className="flex items-center gap-3">
      <PactlyMark size={32} />
      <div>
        <div className="flex items-baseline">
          <span style={{ fontWeight: 700, fontSize: 17, lineHeight: 1, letterSpacing: '-0.02em', color: '#181A2B' }}>
            Pactly
          </span>
          <span style={{ fontWeight: 700, fontSize: 17, lineHeight: 1, color: '#FF6B7D' }}>.</span>
        </div>
        <div style={{ fontSize: 11, marginTop: 3, fontWeight: 500, color: '#6B6A7A' }}>
          contractbeheer
        </div>
      </div>
    </div>
  );
}

export function Sidebar({ current, onChange, urgentCount, unreadCount, onUploadContract, onAddAbonnement }: SidebarProps) {
  return (
    <aside className="hidden sm:flex flex-col w-56 min-w-[14rem] bg-white border-r h-full" style={{ borderColor: '#E4E1F0' }}>
      {/* Logo */}
      <div className="px-5 py-5 border-b" style={{ borderColor: '#E4E1F0' }}>
        <PactlyWordmark />
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
                  <span style={{ color: '#6B6A7A', fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    {item.section}
                  </span>
                </div>
              )}
              <button
                onClick={() => onChange(item.id)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all relative"
                style={active
                  ? { backgroundColor: 'rgba(75,81,158,0.08)', color: '#4B519E' }
                  : { color: '#6B6A7A' }
                }
                onMouseEnter={e => { if (!active) { const el = e.currentTarget as HTMLElement; el.style.backgroundColor = '#F2F4F7'; el.style.color = '#181A2B'; } }}
                onMouseLeave={e => { if (!active) { const el = e.currentTarget as HTMLElement; el.style.backgroundColor = ''; el.style.color = '#6B6A7A'; } }}
              >
                {item.icon}
                {item.label}
                {badge > 0 && (
                  <span
                    className="ml-auto text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
                    style={active
                      ? { backgroundColor: '#4B519E', color: 'white' }
                      : { backgroundColor: '#FF6B7D', color: 'white' }
                    }
                  >
                    {badge > 9 ? '9+' : badge}
                  </span>
                )}
              </button>
            </React.Fragment>
          );
        })}

        {/* Divider + Instellingen */}
        <div className="mt-2 pt-2" style={{ borderTop: '1px solid #E4E1F0' }}>
          <button
            onClick={() => onChange('settings')}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={current === 'settings'
              ? { backgroundColor: 'rgba(75,81,158,0.08)', color: '#4B519E' }
              : { color: '#6B6A7A' }
            }
            onMouseEnter={e => { if (current !== 'settings') { const el = e.currentTarget as HTMLElement; el.style.backgroundColor = '#F2F4F7'; el.style.color = '#181A2B'; } }}
            onMouseLeave={e => { if (current !== 'settings') { const el = e.currentTarget as HTMLElement; el.style.backgroundColor = ''; el.style.color = '#6B6A7A'; } }}
          >
            <Settings size={18} />
            Instellingen
          </button>
        </div>
      </nav>

      {/* Primaire CTA's — volgorde per Brandbook §7 */}
      <div className="px-3 pb-3 flex flex-col gap-2">
        <button
          onClick={onUploadContract}
          className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-white text-sm font-bold shadow-sm hover:opacity-90 hover:-translate-y-0.5 transition-all"
          style={{ background: 'linear-gradient(135deg, #6B72B8 0%, #4B519E 100%)' }}
        >
          <Upload size={15} />
          Contract uploaden
        </button>
        <button
          onClick={onAddAbonnement}
          className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border text-sm font-semibold transition-all hover:opacity-80"
          style={{ backgroundColor: 'rgba(75,81,158,0.06)', borderColor: 'rgba(75,81,158,0.20)', color: '#4B519E' }}
        >
          <Plus size={15} />
          Abonnement toevoegen
        </button>
      </div>

      {/* Footer */}
      <div className="px-5 py-3" style={{ borderTop: '1px solid #E4E1F0' }}>
        <p className="text-xs font-mono" style={{ color: '#6B6A7A' }}>Pactly MVP v1.0</p>
      </div>
    </aside>
  );
}
