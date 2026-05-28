import React, { useState } from 'react';
import type { Contract, HouseholdMember } from '../types';
import { CATEGORY_META } from '../types';
import { MemberPill } from '../components/ui/MemberPill';
import { formatEuro } from '../utils/dateHelpers';

interface KostenProps {
  contracts: Contract[];
  members: HouseholdMember[];
}

type GroupBy = 'categorie' | 'persoon' | 'type';

// ─── SVG Donut ────────────────────────────────────────────────────────────────

interface DonutSlice {
  label: string;
  value: number;
  color: string;
}

function DonutChart({ slices, total }: { slices: DonutSlice[]; total: number }) {
  const R = 56;
  const cx = 70;
  const cy = 70;
  const circumference = 2 * Math.PI * R;

  let offset = 0;
  const segments = slices.map(s => {
    const pct = total > 0 ? s.value / total : 0;
    const dash = pct * circumference;
    const gap  = circumference - dash;
    const seg  = { ...s, dash, gap, offset };
    offset += dash;
    return seg;
  });

  return (
    <svg width={140} height={140} viewBox="0 0 140 140">
      <circle cx={cx} cy={cy} r={R} fill="none" stroke="#f3f4f6" strokeWidth={18} />
      {segments.map((seg, i) => (
        <circle
          key={i}
          cx={cx} cy={cy} r={R}
          fill="none"
          stroke={seg.color}
          strokeWidth={18}
          strokeDasharray={`${seg.dash} ${seg.gap}`}
          strokeDashoffset={-seg.offset + circumference / 4}
          strokeLinecap="butt"
          style={{ transition: 'stroke-dasharray 0.5s ease' }}
        />
      ))}
      <text x={cx} y={cy - 7} textAnchor="middle" fontSize={11} fill="#6B6A7A" fontFamily="Space Mono, monospace">
        per maand
      </text>
      <text x={cx} y={cy + 10} textAnchor="middle" fontSize={14} fontWeight="800" fill="#181A2B" fontFamily="Plus Jakarta Sans, sans-serif">
        {formatEuro(total)}
      </text>
    </svg>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function Kosten({ contracts, members }: KostenProps) {
  const [groupBy, setGroupBy] = useState<GroupBy>('categorie');

  const activeContracts = contracts.filter(c => c.status !== 'verlopen');
  const totalMonthly = activeContracts.reduce((s, c) => s + c.monthlyAmount, 0);
  const totalYearly  = totalMonthly * 12;
  const payingContracts = activeContracts.filter(c => c.monthlyAmount > 0);
  const avgPerContract  = payingContracts.length > 0 ? totalMonthly / payingContracts.length : 0;

  // ─ Group by category ─
  const byCategory = Object.entries(CATEGORY_META)
    .map(([key, meta]) => {
      const amount = activeContracts
        .filter(c => c.category === key)
        .reduce((s, c) => s + c.monthlyAmount, 0);
      return { key, label: meta.label, icon: meta.icon, color: meta.color, amount };
    })
    .filter(g => g.amount > 0)
    .sort((a, b) => b.amount - a.amount);

  // ─ Group by person ─
  const byPerson = members.map(m => ({
    member: m,
    amount: activeContracts
      .filter(c => c.betaler === m.id)
      .reduce((s, c) => s + c.monthlyAmount, 0),
    contracts: activeContracts.filter(c => c.betaler === m.id),
  })).filter(p => p.amount > 0);

  // ─ Group by type ─
  const contractAmount   = activeContracts.filter(c => c.type === 'contract').reduce((s, c) => s + c.monthlyAmount, 0);
  const abonnementAmount = activeContracts.filter(c => c.type === 'abonnement').reduce((s, c) => s + c.monthlyAmount, 0);
  const byType = [
    { label: 'Contracten',   icon: '📄', color: '#4B519E', amount: contractAmount  },
    { label: 'Abonnementen', icon: '📦', color: '#FF6B7D', amount: abonnementAmount },
  ].filter(t => t.amount > 0);

  // Donut slices
  const donutSlices: DonutSlice[] = groupBy === 'categorie'
    ? byCategory.map(g => ({ label: g.label, value: g.amount, color: g.color }))
    : groupBy === 'persoon'
    ? byPerson.map(p => ({ label: p.member.name, value: p.amount, color: p.member.color }))
    : byType.map(t => ({ label: t.label, value: t.amount, color: t.color }));

  // Sorted contract list for table
  const sortedContracts = [...activeContracts]
    .filter(c => c.monthlyAmount > 0)
    .sort((a, b) => b.monthlyAmount - a.monthlyAmount);

  const maxAmount = sortedContracts[0]?.monthlyAmount || 1;

  return (
    <div className="h-full overflow-y-auto pb-20 sm:pb-6">
      {/* Header */}
      <div
        className="px-4 sm:px-5 pt-6 sm:pt-8 pb-5 sm:pb-6 relative overflow-hidden border-b border-gray-100"
        style={{ background: 'linear-gradient(160deg, #E7E8F4 0%, #FBF9FF 100%)' }}
      >
        <div
          className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-25 -translate-y-1/4 translate-x-1/4"
          style={{ background: 'radial-gradient(circle, #4B519E, transparent)' }}
        />
        <div className="relative z-10">
          <h1 className="text-2xl font-extrabold text-dark mb-1">Kosten</h1>
          <p className="text-mid text-sm">Overzicht van jouw maandlasten</p>
        </div>
      </div>

      <div className="px-4 sm:px-5 pt-4 sm:pt-5 flex flex-col gap-3 sm:gap-4">

        {/* ── 3 KPI stat cards ───────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {/* Total per month — accent background */}
          <div
            className="rounded-2xl p-4 sm:p-5 col-span-1"
            style={{ background: 'linear-gradient(135deg, #4B519E 0%, #7B5FF0 100%)' }}
          >
            <div className="text-xs font-semibold uppercase tracking-wide text-white/70 mb-2">Per maand</div>
            <div className="text-xl sm:text-2xl font-extrabold text-white leading-tight tracking-tight">{formatEuro(totalMonthly)}</div>
            <div className="text-xs text-white/60 mt-1">Over alle contracten</div>
          </div>
          {/* Total per year */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5">
            <div className="text-xs font-semibold uppercase tracking-wide text-mid mb-2">Per jaar</div>
            <div className="text-xl sm:text-2xl font-extrabold text-dark leading-tight tracking-tight">{formatEuro(totalYearly)}</div>
            <div className="text-xs text-mid font-mono mt-1">Excl. éénmalig</div>
          </div>
          {/* Average per contract */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5">
            <div className="text-xs font-semibold uppercase tracking-wide text-mid mb-2">Gem. per contract</div>
            <div className="text-xl sm:text-2xl font-extrabold text-dark leading-tight tracking-tight">{formatEuro(avgPerContract)}</div>
            <div className="text-xs text-mid font-mono mt-1">{payingContracts.length} betalende</div>
          </div>
        </div>

        {/* ── Group toggle ────────────────────────────────────────── */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
          {(['categorie', 'persoon', 'type'] as GroupBy[]).map(g => (
            <button
              key={g}
              onClick={() => setGroupBy(g)}
              className={[
                'flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all',
                groupBy === g ? 'bg-white text-dark shadow-sm' : 'text-mid hover:text-dark',
              ].join(' ')}
            >
              {g.charAt(0).toUpperCase() + g.slice(1)}
            </button>
          ))}
        </div>

        {/* ── Desktop 2-column: donut left + table right ─────────── */}
        <div className="flex flex-col lg:flex-row gap-3 sm:gap-4">

          {/* Donut + legend (left / top) */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4 lg:w-72 xl:w-80 flex-shrink-0">
            <div className="text-xs font-bold text-mid uppercase tracking-wider mb-4">Verdeling</div>
            <div className="flex flex-col items-center">
              <DonutChart slices={donutSlices} total={totalMonthly} />
            </div>
            <div className="mt-3 flex flex-col gap-1.5">
              {donutSlices.map(s => (
                <div key={s.label} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
                  <span className="text-xs text-mid truncate flex-1">{s.label}</span>
                  <span className="text-xs font-bold text-dark font-mono">{formatEuro(s.value)}</span>
                  <span className="text-[10px] text-mid/60 font-mono w-8 text-right">
                    {totalMonthly > 0 ? Math.round((s.value / totalMonthly) * 100) : 0}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Breakdown by selected group (right / bottom on mobile) */}
          <div className="flex-1 min-w-0 flex flex-col gap-3">

            {/* Breakdown bars card */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              {groupBy === 'categorie' && byCategory.map((g, i) => (
                <div key={g.key} className={`flex items-center gap-4 px-5 py-4 ${i < byCategory.length - 1 ? 'border-b border-gray-50' : ''}`}>
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                    style={{ backgroundColor: g.color + '18' }}
                  >
                    {g.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between mb-2">
                      <div className="text-sm font-semibold text-dark">{g.label}</div>
                      <div className="text-sm font-bold text-dark font-mono ml-2 flex-shrink-0">{formatEuro(g.amount)}</div>
                    </div>
                    <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${totalMonthly > 0 ? (g.amount / totalMonthly) * 100 : 0}%`, backgroundColor: g.color }}
                      />
                    </div>
                    <div className="text-xs text-mid font-mono mt-1">
                      {totalMonthly > 0 ? Math.round((g.amount / totalMonthly) * 100) : 0}% van totaal
                    </div>
                  </div>
                </div>
              ))}

              {groupBy === 'persoon' && (
                byPerson.length === 0 ? (
                  <div className="px-4 py-8 text-center text-sm text-mid">
                    Wijs betaler toe aan contracten om hier een overzicht te zien.
                  </div>
                ) : byPerson.map((p, i) => (
                  <div key={p.member.id} className={`flex items-center gap-4 px-5 py-4 ${i < byPerson.length - 1 ? 'border-b border-gray-50' : ''}`}>
                    <MemberPill member={p.member} size="md" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between mb-2">
                        <div className="text-xs text-mid">{p.contracts.length} contract{p.contracts.length !== 1 ? 'en' : ''}</div>
                        <div className="text-sm font-bold text-dark font-mono ml-2 flex-shrink-0">{formatEuro(p.amount)}</div>
                      </div>
                      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${totalMonthly > 0 ? (p.amount / totalMonthly) * 100 : 0}%`, backgroundColor: p.member.color }}
                        />
                      </div>
                      <div className="text-xs text-mid font-mono mt-1">
                        {totalMonthly > 0 ? Math.round((p.amount / totalMonthly) * 100) : 0}% van totaal
                      </div>
                    </div>
                  </div>
                ))
              )}

              {groupBy === 'type' && byType.map((t, i) => (
                <div key={t.label} className={`flex items-center gap-4 px-5 py-4 ${i < byType.length - 1 ? 'border-b border-gray-50' : ''}`}>
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                    style={{ backgroundColor: t.color + '18' }}
                  >
                    {t.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between mb-2">
                      <div className="text-sm font-semibold text-dark">{t.label}</div>
                      <div className="text-sm font-bold text-dark font-mono ml-2 flex-shrink-0">{formatEuro(t.amount)}</div>
                    </div>
                    <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${totalMonthly > 0 ? (t.amount / totalMonthly) * 100 : 0}%`, backgroundColor: t.color }}
                      />
                    </div>
                    <div className="text-xs text-mid font-mono mt-1">
                      {totalMonthly > 0 ? Math.round((t.amount / totalMonthly) * 100) : 0}% van totaal
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* ── Full contract table ─────────────────────────────── */}
            {sortedContracts.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                {/* Desktop table */}
                <div className="hidden sm:block">
                  <div className="px-5 py-3 border-b border-gray-100 grid grid-cols-[1fr_1fr_auto_auto_80px] gap-3 items-center">
                    <div className="text-xs font-semibold text-mid uppercase tracking-wide">Contract</div>
                    <div className="text-xs font-semibold text-mid uppercase tracking-wide">Aanbieder</div>
                    <div className="text-xs font-semibold text-mid uppercase tracking-wide text-right">Per maand</div>
                    <div className="text-xs font-semibold text-mid uppercase tracking-wide text-right">Per jaar</div>
                    <div></div>
                  </div>
                  {sortedContracts.map((c, i) => {
                    const meta = CATEGORY_META[c.category];
                    return (
                      <div
                        key={c.id}
                        className={`px-5 py-3 grid grid-cols-[1fr_1fr_auto_auto_80px] gap-3 items-center ${i < sortedContracts.length - 1 ? 'border-b border-gray-50' : ''}`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="text-base flex-shrink-0">{meta.icon}</span>
                          <span className="text-sm font-semibold text-dark truncate">{c.name}</span>
                        </div>
                        <div className="text-sm text-mid truncate">{c.provider}</div>
                        <div className="text-sm font-bold text-dark font-mono text-right">{formatEuro(c.monthlyAmount)}</div>
                        <div className="text-xs text-mid font-mono text-right">{formatEuro(c.monthlyAmount * 12)}</div>
                        <div>
                          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{ width: `${(c.monthlyAmount / maxAmount) * 100}%`, backgroundColor: meta.color }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {/* Totals row */}
                  <div className="px-5 py-3.5 border-t-2 border-gray-100 grid grid-cols-[1fr_1fr_auto_auto_80px] gap-3 items-center bg-gray-50/50">
                    <div className="col-span-2 text-sm font-bold text-dark">Totaal</div>
                    <div className="text-sm font-extrabold text-violet font-mono text-right">{formatEuro(totalMonthly)}</div>
                    <div className="text-sm font-extrabold text-violet font-mono text-right">{formatEuro(totalYearly)}</div>
                    <div></div>
                  </div>
                </div>

                {/* Mobile list */}
                <div className="sm:hidden">
                  <div className="px-4 py-3 border-b border-gray-50">
                    <span className="text-xs font-semibold text-mid uppercase tracking-wide">Alle contracten</span>
                  </div>
                  {sortedContracts.map((c, i) => {
                    const meta = CATEGORY_META[c.category];
                    return (
                      <div key={c.id} className={`flex items-center gap-3 px-4 py-3 ${i < sortedContracts.length - 1 ? 'border-b border-gray-50' : ''}`}>
                        <div
                          className="w-8 h-8 rounded-xl flex items-center justify-center text-base flex-shrink-0"
                          style={{ backgroundColor: meta.color + '18' }}
                        >
                          {meta.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold text-dark truncate">{c.name}</div>
                          <div className="text-xs text-mid font-mono">{c.provider}</div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="text-sm font-bold text-dark font-mono">{formatEuro(c.monthlyAmount)}</div>
                          <div className="text-[10px] text-mid font-mono">{formatEuro(c.monthlyAmount * 12)}/jr</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
