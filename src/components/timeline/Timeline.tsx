import React, { useState } from 'react';
import { addMonths, addYears, format, parseISO, isWithinInterval, startOfDay } from 'date-fns';
import { nl } from 'date-fns/locale';
import type { Contract } from '../../types';
import { CATEGORY_META, STATUS_META } from '../../types';

type Window = 12 | 36 | 60 | 120;

interface TimelineProps {
  contracts: Contract[];
  onSelect: (contract: Contract) => void;
}

export function Timeline({ contracts, onSelect }: TimelineProps) {
  const [window, setWindow] = useState<Window>(12);

  const today = startOfDay(new Date());
  const end   = window === 12
    ? addMonths(today, 12)
    : window === 36
    ? addYears(today, 3)
    : window === 60
    ? addYears(today, 5)
    : addYears(today, 10);
  const totalMs = end.getTime() - today.getTime();

  // Only show contracts with an endDate that overlap with the window
  const visible = contracts.filter(c => {
    if (!c.endDate) return false; // doorlopend — skip timeline
    const cStart = parseISO(c.startDate);
    const cEnd   = parseISO(c.endDate);
    return cEnd >= today && cStart <= end;
  });

  // Generate month markers
  const months: Date[] = [];
  let cur = new Date(today);
  cur.setDate(1);
  while (cur <= end) {
    months.push(new Date(cur));
    cur.setMonth(cur.getMonth() + 1);
  }

  const pct = (date: Date) => {
    const clamped = Math.min(Math.max(date.getTime(), today.getTime()), end.getTime());
    return ((clamped - today.getTime()) / totalMs) * 100;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Toggle */}
      <div className="flex gap-2 px-5 py-4">
        {([12, 36, 60, 120] as Window[]).map(w => (
          <button
            key={w}
            onClick={() => setWindow(w)}
            className={[
              'px-4 py-1.5 rounded-full text-xs font-bold transition-all',
              window === w
                ? 'bg-violet text-white shadow-sm'
                : 'bg-white text-mid hover:bg-violet-light hover:text-violet border border-gray-200',
            ].join(' ')}
          >
            {w === 12 ? '1 jaar' : w === 36 ? '3 jaar' : w === 60 ? '5 jaar' : '10 jaar'}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-x-auto px-5 pb-8">
        <div className="min-w-[600px]">
          {/* Month labels */}
          <div className="relative h-6 mb-2">
            {months.map((m, i) => {
              const left = pct(m);
              if (left > 98) return null;
              const label = window === 12
                ? format(m, 'MMM', { locale: nl })
                : window === 36
                ? (i % 3 === 0 ? format(m, 'MMM yy', { locale: nl }) : '')
                : window === 60
                ? (i % 6 === 0 ? format(m, 'MMM yy', { locale: nl }) : '')
                : (i % 12 === 0 ? format(m, 'yyyy', { locale: nl }) : '');
              if (!label) return null;
              return (
                <span
                  key={i}
                  className="absolute text-xs font-mono text-mid transform -translate-x-1/2"
                  style={{ left: `${left}%` }}
                >
                  {label}
                </span>
              );
            })}
          </div>

          {/* Grid lines */}
          <div className="relative">
            <div className="absolute inset-0">
              {months.map((m, i) => {
                const left = pct(m);
                if (left > 98) return null;
                // For long windows, only draw yearly gridlines
                const show = window <= 36 || (window === 60 && i % 6 === 0) || (window === 120 && i % 12 === 0);
                if (!show) return null;
                return (
                  <div
                    key={i}
                    className="absolute top-0 bottom-0 w-px bg-gray-100"
                    style={{ left: `${left}%` }}
                  />
                );
              })}
              {/* Today line */}
              <div className="absolute top-0 bottom-0 w-0.5 bg-violet z-10" style={{ left: '0%' }} />
            </div>

            {/* Contract bars */}
            <div className="relative z-20 flex flex-col gap-2 py-1">
              {visible.length === 0 ? (
                <div className="text-center py-10 text-mid text-sm">
                  Geen contracten in deze periode.
                </div>
              ) : (
                visible.map(c => {
                  const catMeta  = CATEGORY_META[c.category];
                  const statMeta = STATUS_META[c.status];
                  const startPct = pct(parseISO(c.startDate));
                  const endPct   = pct(parseISO(c.endDate!));
                  const widthPct = Math.max(endPct - startPct, 1.5);
                  const barColor = statMeta.barColor;

                  // Notice period deadline marker
                  const noticeDate = c.noticePeriodDays > 0
                    ? new Date(parseISO(c.endDate!).getTime() - c.noticePeriodDays * 86_400_000)
                    : null;
                  const noticePct = noticeDate && noticeDate >= today && noticeDate <= end
                    ? pct(noticeDate)
                    : null;

                  return (
                    <div key={c.id} className="relative h-9">
                      {/* Row background */}
                      <div className="absolute inset-y-0 inset-x-0 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors" />

                      {/* Notice period marker (vertical dashed line) */}
                      {noticePct !== null && (
                        <div
                          className="absolute top-0.5 bottom-0.5 w-0.5 rounded-full z-30 opacity-70"
                          style={{ left: `${noticePct}%`, backgroundColor: '#FF7A35' }}
                          title={`Opzegtermijn: ${c.noticePeriodDays} dagen`}
                        />
                      )}

                      {/* Bar */}
                      <button
                        onClick={() => onSelect(c)}
                        className="absolute top-1 bottom-1 rounded-lg flex items-center px-2 gap-2 text-xs font-semibold cursor-pointer hover:brightness-90 transition-all min-w-0"
                        style={{
                          left: `${startPct}%`,
                          width: `${widthPct}%`,
                          backgroundColor: barColor === '#F7FF5C' ? '#F7FF5C' : barColor,
                          color: barColor === '#F7FF5C' ? '#1A1A2E' : '#ffffff',
                        }}
                        title={c.name}
                      >
                        <span className="text-base leading-none">{catMeta.icon}</span>
                        <span className="truncate hidden sm:block">{c.name}</span>
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Legend */}
          <div className="mt-6 flex flex-wrap gap-3">
            {visible.map(c => (
              <button
                key={c.id}
                onClick={() => onSelect(c)}
                className="flex items-center gap-1.5 text-xs text-mid hover:text-dark transition-colors"
              >
                <span className="text-sm">{CATEGORY_META[c.category].icon}</span>
                {c.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
