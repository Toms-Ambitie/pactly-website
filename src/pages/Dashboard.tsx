import React from 'react';
import type { Contract, HouseholdMember } from '../types';
import { CATEGORY_META } from '../types';
import { MemberPill } from '../components/ui/MemberPill';
import { UrgentBanner } from '../components/dashboard/UrgentBanner';
import { formatEuro, formatDate } from '../utils/dateHelpers';
import { daysUntilEnd } from '../utils/contractStatus';
import type { Page } from '../components/layout/Sidebar';

interface DashboardProps {
  contracts: Contract[];
  members: HouseholdMember[];
  userName: string;
  unreadCount: number;
  onNavigate: (page: Page) => void;
  onSelectContract: (c: Contract, returnPage: Page) => void;
}

export function Dashboard({ contracts, members, userName, unreadCount, onNavigate, onSelectContract }: DashboardProps) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Goedemorgen' : hour < 18 ? 'Goedemiddag' : 'Goedenavond';
  const name = userName.trim() || 'daar';

  const activeContracts = contracts.filter(c => c.status !== 'verlopen');
  const totalMonthly = activeContracts.reduce((s, c) => s + c.monthlyAmount, 0);
  const totalYearly  = totalMonthly * 12;

  const expiringSoon = contracts.filter(c => {
    if (!c.endDate) return false;
    const d = daysUntilEnd(c.endDate);
    return d !== null && d >= 0 && d < 90;
  }).length;

  const urgentCount = contracts.filter(c => c.status === 'urgent' || c.status === 'evalueer').length;

  // Per-person cost breakdown
  const perPerson = members.map(m => ({
    member: m,
    amount: contracts.filter(c => c.betaler === m.id).reduce((s, c) => s + c.monthlyAmount, 0),
    count: contracts.filter(c => c.betaler === m.id).length,
  })).filter(p => p.amount > 0);

  // Upcoming: contracts expiring within 180 days, sorted soonest first
  const upcoming = contracts
    .filter(c => {
      if (!c.endDate) return false;
      const d = daysUntilEnd(c.endDate);
      return d !== null && d >= 0 && d <= 180;
    })
    .sort((a, b) => (daysUntilEnd(a.endDate) ?? 999) - (daysUntilEnd(b.endDate) ?? 999))
    .slice(0, 5);

  return (
    <div className="h-full overflow-y-auto pb-20 sm:pb-6">

      {/* ── Hero banner — dark violet gradient ─────────────────── */}
      <div
        className="px-4 sm:px-8 pt-6 sm:pt-8 pb-7 sm:pb-8 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #181A2B 0%, #2D1B69 60%, #1A0E40 100%)' }}
      >
        {/* Radial glows */}
        <div
          className="absolute top-0 right-1/4 w-72 h-72 rounded-full opacity-20 -translate-y-1/2 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #4B519E, transparent)' }}
        />
        <div
          className="absolute bottom-0 left-0 w-52 h-52 rounded-full opacity-15 translate-y-1/2 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #FF6B7D, transparent)' }}
        />

        <div className="relative z-10 flex items-center justify-between gap-4">
          {/* Left: date + greeting + CTAs */}
          <div className="flex-1 min-w-0">
            <p className="text-white/55 text-xs font-semibold uppercase tracking-widest mb-2">
              {new Date().toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-1.5 tracking-tight">
              {greeting}, {name} 👋
            </h1>
            <p className="text-white/70 text-sm mb-5 leading-relaxed">
              {urgentCount > 0
                ? <><strong className="text-coral">{urgentCount} contract{urgentCount !== 1 ? 'en' : ''}</strong> vereisen aandacht{unreadCount > 0 ? ` · ${unreadCount} ongelezen meldingen` : ''}.</>
                : <>Alles in orde{unreadCount > 0 ? <> · <strong className="text-white/90">{unreadCount}</strong> ongelezen melding{unreadCount !== 1 ? 'en' : ''}</> : ''}.</>
              }
            </p>
            <div className="flex gap-2.5 flex-wrap">
              <button
                onClick={() => onNavigate('contracts')}
                className="px-4 py-2 rounded-xl text-xs font-semibold transition-all hover:opacity-90"
                style={{ background: 'rgba(255,255,255,0.18)', color: 'white', border: '1px solid rgba(255,255,255,0.28)', backdropFilter: 'blur(6px)' }}
              >
                Alle contracten
              </button>
              <button
                onClick={() => onNavigate('meldingen')}
                className="px-4 py-2 rounded-xl text-xs font-semibold transition-all hover:opacity-90"
                style={{ background: 'rgba(255,255,255,0.08)', color: 'white', border: '1px solid rgba(255,255,255,0.15)', backdropFilter: 'blur(6px)' }}
              >
                Meldingen bekijken
              </button>
            </div>
          </div>

          {/* Right: glass cost box (hidden on mobile) */}
          <div
            className="flex-shrink-0 text-right rounded-2xl px-6 py-5 hidden sm:block"
            style={{ background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)' }}
          >
            <div className="text-xs font-semibold uppercase tracking-wider text-white/55 mb-2">Maandelijks totaal</div>
            <div className="text-4xl font-extrabold text-white tracking-tight leading-none">{formatEuro(totalMonthly)}</div>
            <div className="text-sm text-white/55 mt-1.5">{formatEuro(totalYearly)} per jaar</div>
          </div>
        </div>

        {/* Mobile: total below greeting */}
        <div className="relative z-10 sm:hidden mt-4 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.12)' }}>
          <div className="text-xs font-semibold uppercase tracking-wider text-white/55 mb-1">Maandelijks totaal</div>
          <div className="text-3xl font-extrabold text-white tracking-tight">{formatEuro(totalMonthly)}</div>
          <div className="text-xs text-white/55 mt-0.5">{formatEuro(totalYearly)} per jaar</div>
        </div>
      </div>

      <div className="px-4 sm:px-5 pt-4 sm:pt-5 flex flex-col gap-3 sm:gap-4">

        {/* ── 3 stat cards ───────────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3">

          {/* Active contracts */}
          <button
            onClick={() => onNavigate('contracts')}
            className="bg-white rounded-2xl border border-gray-100 p-3 sm:p-4 text-left hover:shadow-md hover:-translate-y-0.5 transition-all"
          >
            <div className="flex items-start justify-between mb-2 sm:mb-3">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center text-base sm:text-lg flex-shrink-0" style={{ background: 'rgba(75,81,158,0.09)' }}>📋</div>
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(75,81,158,0.09)' }}>
                <div className="w-2 h-2 rounded-full bg-violet" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-extrabold text-violet leading-none">{activeContracts.length}</div>
            <div className="text-[11px] sm:text-xs font-semibold text-dark mt-1 leading-tight">Actieve contracten</div>
            <div className="text-[10px] sm:text-xs text-mid font-mono mt-0.5 leading-tight">{expiringSoon} binnenkort</div>
          </button>

          {/* Action needed */}
          <button
            onClick={() => onNavigate('contracts')}
            className="bg-white rounded-2xl border border-gray-100 p-3 sm:p-4 text-left hover:shadow-md hover:-translate-y-0.5 transition-all"
          >
            <div className="flex items-start justify-between mb-2 sm:mb-3">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center text-base sm:text-lg flex-shrink-0" style={{ background: urgentCount > 0 ? 'rgba(232,53,122,0.09)' : 'rgba(0,0,0,0.04)' }}>⚠️</div>
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: urgentCount > 0 ? 'rgba(232,53,122,0.09)' : 'rgba(0,0,0,0.04)' }}>
                <div className="w-2 h-2 rounded-full" style={{ background: urgentCount > 0 ? '#FF6B7D' : '#d1d5db' }} />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-extrabold leading-none" style={{ color: urgentCount > 0 ? '#FF6B7D' : '#9ca3af' }}>{urgentCount}</div>
            <div className="text-[11px] sm:text-xs font-semibold text-dark mt-1 leading-tight">Vereisen aandacht</div>
            <div className="text-[10px] sm:text-xs text-mid font-mono mt-0.5 leading-tight">Binnen 90 dagen</div>
          </button>

          {/* Notifications */}
          <button
            onClick={() => onNavigate('meldingen')}
            className="bg-white rounded-2xl border border-gray-100 p-3 sm:p-4 text-left hover:shadow-md hover:-translate-y-0.5 transition-all"
          >
            <div className="flex items-start justify-between mb-2 sm:mb-3">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center text-base sm:text-lg flex-shrink-0" style={{ background: unreadCount > 0 ? 'rgba(232,53,122,0.09)' : 'rgba(0,0,0,0.04)' }}>🔔</div>
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: unreadCount > 0 ? 'rgba(232,53,122,0.09)' : 'rgba(0,0,0,0.04)' }}>
                <div className="w-2 h-2 rounded-full" style={{ background: unreadCount > 0 ? '#FF6B7D' : '#d1d5db' }} />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-extrabold leading-none" style={{ color: unreadCount > 0 ? '#FF6B7D' : '#9ca3af' }}>{unreadCount}</div>
            <div className="text-[11px] sm:text-xs font-semibold text-dark mt-1 leading-tight">Ongelezen meldingen</div>
            <div className="text-[10px] sm:text-xs text-mid font-mono mt-0.5 leading-tight">Bekijk meldingen</div>
          </button>
        </div>

        {/* ── Urgent banner (only if urgency present) ────────────── */}
        <UrgentBanner contracts={contracts} onViewUrgent={() => onNavigate('contracts')} />

        {/* ── 2-column: upcoming + per-person ────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">

          {/* Upcoming expirations */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="px-4 sm:px-5 py-3.5 border-b border-gray-50 flex items-center justify-between">
              <span className="text-sm font-bold text-dark">Aankomende verloopdatums</span>
              <button onClick={() => onNavigate('timeline')} className="text-xs text-violet font-semibold hover:underline">
                Bekijk alles →
              </button>
            </div>
            {upcoming.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-mid">
                Geen contracten die binnenkort verlopen.
              </div>
            ) : (
              upcoming.map((c, i) => {
                const days = daysUntilEnd(c.endDate);
                const meta = CATEGORY_META[c.category];
                const isUrgent = c.status === 'urgent';
                const badgeBg  = days !== null && days < 30 ? '#fdf2f8' : days !== null && days < 90 ? '#fffbeb' : '#eff6ff';
                const badgeColor = days !== null && days < 30 ? '#FF6B7D' : days !== null && days < 90 ? '#d97706' : '#3b82f6';
                return (
                  <button
                    key={c.id}
                    onClick={() => onSelectContract(c, 'dashboard')}
                    className={`w-full flex items-center gap-3 px-4 sm:px-5 py-3 text-left hover:bg-gray-50 transition-colors ${i < upcoming.length - 1 ? 'border-b border-gray-50' : ''}`}
                  >
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0"
                      style={{ backgroundColor: meta.color + '18' }}
                    >
                      {meta.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-dark truncate">{c.name}</div>
                      <div className="text-xs text-mid font-mono mt-0.5">{formatDate(c.endDate)}</div>
                    </div>
                    <span
                      className="text-[11px] font-bold font-mono px-2 py-1 rounded-lg flex-shrink-0"
                      style={{ background: badgeBg, color: badgeColor }}
                    >
                      {days === 0 ? 'Vandaag' : `${days}d`}
                    </span>
                  </button>
                );
              })
            )}
          </div>

          {/* Per-person cost breakdown */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5">
            <div className="mb-1">
              <div className="text-sm font-bold text-dark">Kosten per persoon</div>
              <div className="text-xs text-mid mt-0.5">Wie betaalt wat in het huishouden</div>
            </div>
            {perPerson.length === 0 ? (
              <div className="pt-4 text-sm text-mid text-center py-6">
                Wijs een betaler toe aan contracten.
              </div>
            ) : (
              <div className="mt-4 flex flex-col gap-3.5">
                {perPerson.map(({ member, amount, count }) => {
                  const pct = totalMonthly > 0 ? (amount / totalMonthly) * 100 : 0;
                  return (
                    <div key={member.id}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <MemberPill member={member} size="sm" />
                          <span className="text-xs text-mid">{count} item{count !== 1 ? 's' : ''}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-extrabold" style={{ color: member.color }}>{formatEuro(amount)}</div>
                          <div className="text-[10px] text-mid font-mono">{Math.round(pct)}% van totaal</div>
                        </div>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${pct}%`, backgroundColor: member.color }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            <button
              onClick={() => onNavigate('kosten')}
              className="w-full mt-4 pt-3 border-t border-gray-50 text-xs text-violet font-semibold text-center hover:underline"
            >
              Volledig kostenoverzicht →
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
