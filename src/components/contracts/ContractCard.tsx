import React from 'react';
import type { Contract, HouseholdMember } from '../../types';
import { CATEGORY_META, STATUS_META, CONTRACT_TAGS } from '../../types';
import { MemberPill } from '../ui/MemberPill';
import { formatDate, formatEuro } from '../../utils/dateHelpers';
import { daysUntilEnd, contractProgress } from '../../utils/contractStatus';

interface ContractCardProps {
  contract: Contract;
  members?: HouseholdMember[];
  onClick: () => void;
  view?: 'grid' | 'list';
}

export function ContractCard({ contract, members = [], onClick, view = 'grid' }: ContractCardProps) {
  const catMeta  = CATEGORY_META[contract.category];
  const statMeta = STATUS_META[contract.status];
  const progress = contractProgress(contract.startDate, contract.endDate);
  const daysLeft = daysUntilEnd(contract.endDate);
  const isDoorlopend = contract.endDate === null;

  const daysLabel = isDoorlopend
    ? 'Doorlopend'
    : contract.status === 'verlopen'
    ? 'Verlopen'
    : daysLeft === 0 ? 'Vandaag'
    : daysLeft === 1 ? 'Morgen'
    : `${daysLeft}d`;

  const betaler   = members.find(m => m.id === contract.betaler);
  const beheerder = members.find(m => m.id === contract.beheerder);
  const barColor  = statMeta.barColor === '#F7FF5C' ? '#6B6B8A' : statMeta.barColor;

  // ─── LIST view (compact row) ───────────────────────────────────────────────
  if (view === 'list') {
    return (
      <div
        onClick={onClick}
        className="bg-white cursor-pointer hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0"
      >
        {/* Color accent left strip */}
        <div className="flex items-center gap-3 px-4 py-3">
          <div
            className="w-1 self-stretch rounded-full flex-shrink-0"
            style={{ backgroundColor: catMeta.color }}
          />
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
            style={{ backgroundColor: catMeta.color + '18' }}
          >
            {catMeta.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-dark text-sm leading-tight truncate">{contract.name}</div>
            <div className="text-xs text-mid font-mono truncate">{contract.provider}</div>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="text-right hidden sm:block">
              <div className="text-xs text-mid font-mono">
                {isDoorlopend ? 'Doorlopend' : formatDate(contract.endDate)}
              </div>
              <div
                className="text-[10px] font-bold font-mono"
                style={{ color: barColor }}
              >
                {daysLabel}
              </div>
            </div>
            <div className="text-right">
              <span className="text-sm font-bold" style={{ color: catMeta.color }}>
                {formatEuro(contract.monthlyAmount)}
              </span>
              <span className="text-xs text-mid">/mnd</span>
            </div>
            <StatusPill status={contract.status} statMeta={statMeta} />
          </div>
        </div>
        {/* Progress bar */}
        <div className="mx-4 mb-2.5 mt-0.5">
          <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width: isDoorlopend ? '100%' : `${Math.min(progress * 100, 100)}%`,
                backgroundColor: statMeta.barColor,
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  // ─── GRID view (tile card) ─────────────────────────────────────────────────
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl border border-gray-100 cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-200 overflow-hidden group"
    >
      {/* Top color strip */}
      <div className="h-1.5 w-full" style={{ backgroundColor: catMeta.color }} />

      <div className="p-4 sm:p-5">
        {/* Icon row + badge */}
        <div className="flex items-start justify-between mb-4">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
            style={{ backgroundColor: catMeta.color + '18' }}
          >
            {catMeta.icon}
          </div>
          <StatusPill status={contract.status} statMeta={statMeta} />
        </div>

        {/* Name + provider */}
        <div className="mb-3">
          <div className="font-bold text-dark text-base leading-snug mb-0.5">{contract.name}</div>
          <div className="text-xs text-mid font-mono">{contract.provider}</div>
        </div>

        {/* Cost — big and prominent */}
        <div className="mb-4">
          <span className="text-2xl font-extrabold text-dark tracking-tight">
            {formatEuro(contract.monthlyAmount)}
          </span>
          <span className="text-xs text-mid ml-1">/mnd</span>
          {contract.monthlyAmount > 0 && (
            <div className="text-xs text-mid/70 font-mono mt-0.5">
              {formatEuro(contract.monthlyAmount * 12)} per jaar
            </div>
          )}
        </div>

        {/* Progress bar */}
        <div className="mb-3">
          <div className="flex justify-between text-xs font-mono text-mid mb-1.5">
            <span>{isDoorlopend ? 'Doorlopend' : formatDate(contract.endDate)}</span>
            <span
              className="font-bold"
              style={{ color: barColor }}
            >
              {daysLabel}
            </span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: isDoorlopend ? '100%' : `${Math.min(progress * 100, 100)}%`,
                backgroundColor: statMeta.barColor,
              }}
            />
          </div>
        </div>

        {/* Footer: members + tags */}
        {(betaler || beheerder || (contract.tags && contract.tags.length > 0)) && (
          <div className="pt-3 border-t border-gray-50 flex items-center gap-1.5 flex-wrap">
            {betaler && <MemberPill member={betaler} size="sm" />}
            {beheerder && beheerder.id !== betaler?.id && (
              <MemberPill member={beheerder} size="sm" />
            )}
            {contract.tags?.slice(0, 2).map(tagId => {
              const meta = CONTRACT_TAGS.find(t => t.id === tagId);
              if (!meta) return null;
              return (
                <span
                  key={tagId}
                  className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-semibold text-white"
                  style={{ backgroundColor: meta.color }}
                >
                  {meta.icon} {meta.label}
                </span>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Shared status pill ────────────────────────────────────────────────────

function StatusPill({ status, statMeta }: { status: string; statMeta: { label: string; color: string; bg: string } }) {
  return (
    <span
      className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold flex-shrink-0"
      style={{ backgroundColor: statMeta.bg, color: statMeta.color }}
    >
      {statMeta.label}
    </span>
  );
}
