import React, { useState } from 'react';
import { Bell, BellOff, CheckCheck, AlertTriangle, Info, Zap } from 'lucide-react';
import type { Notification, Contract } from '../types';
import { CATEGORY_META } from '../types';
import { formatDate } from '../utils/dateHelpers';
import { daysUntilEnd } from '../utils/contractStatus';

type Filter = 'alle' | 'ongelezen' | 'urgent' | 'warning' | 'info';

interface MeldingenProps {
  notifications: Notification[];
  contracts: Contract[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onGoToContract?: (id: string) => void;
}

const TYPE_META = {
  urgent:  { icon: <Zap size={14} />,           color: '#E8357A', bg: '#fdf2f8', label: 'Urgent'      },
  warning: { icon: <AlertTriangle size={14} />, color: '#FF7A35', bg: '#fff7f2', label: 'Waarschuwing' },
  info:    { icon: <Info size={14} />,          color: '#5B3FE8', bg: '#f3f0ff', label: 'Info'         },
};

export function Meldingen({ notifications, contracts, onMarkRead, onMarkAllRead, onGoToContract }: MeldingenProps) {
  const [filter, setFilter] = useState<Filter>('alle');

  const filtered = filter === 'alle'
    ? notifications
    : filter === 'ongelezen'
    ? notifications.filter(n => !n.read)
    : notifications.filter(n => n.type === filter);

  const unreadCount = notifications.filter(n => !n.read).length;

  const getContract = (id: string) => contracts.find(c => c.id === id);

  // Timeline: contracts with end dates in next 365 days
  const timeline = contracts
    .filter(c => {
      if (!c.endDate) return false;
      const d = daysUntilEnd(c.endDate);
      return d !== null && d > 0 && d < 365;
    })
    .sort((a, b) => (daysUntilEnd(a.endDate) ?? 999) - (daysUntilEnd(b.endDate) ?? 999));

  const timelineDotColor = (endDate: string | null) => {
    const d = daysUntilEnd(endDate);
    if (d === null) return '#5B3FE8';
    if (d < 30)  return '#E8357A';
    if (d < 90)  return '#FF7A35';
    return '#5B3FE8';
  };

  const timelineBadge = (endDate: string | null) => {
    const d = daysUntilEnd(endDate);
    if (d === null) return { bg: '#eff6ff', color: '#3b82f6', label: '–' };
    if (d < 30)  return { bg: '#fdf2f8', color: '#E8357A', label: `Over ${d}d` };
    if (d < 90)  return { bg: '#fffbeb', color: '#d97706', label: `Over ${d}d` };
    return { bg: '#eff6ff', color: '#3b82f6', label: `Over ${d}d` };
  };

  return (
    <div className="h-full overflow-y-auto pb-20 sm:pb-6">
      {/* Header */}
      <div
        className="px-4 sm:px-5 pt-6 sm:pt-8 pb-5 sm:pb-6 relative overflow-hidden border-b border-gray-100"
        style={{ background: 'linear-gradient(160deg, #FFF0F6 0%, #FDF9FF 100%)' }}
      >
        <div
          className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-25 -translate-y-1/4 translate-x-1/4"
          style={{ background: 'radial-gradient(circle, #E8357A, transparent)' }}
        />
        <div className="relative z-10 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-dark mb-1">Meldingen</h1>
            <p className="text-mid text-sm">
              {unreadCount > 0 ? `${unreadCount} ongelezen melding${unreadCount !== 1 ? 'en' : ''}` : 'Alles gelezen'}
            </p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={onMarkAllRead}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-gray-200 text-mid text-xs font-semibold hover:border-violet hover:text-violet transition-all shadow-sm"
            >
              <CheckCheck size={13} /> Alles gelezen
            </button>
          )}
        </div>
      </div>

      <div className="px-4 sm:px-5 pt-4 sm:pt-5 flex flex-col gap-3 sm:gap-4">
        {/* Filter chips */}
        <div className="flex gap-2 overflow-x-auto">
          {(['alle', 'ongelezen', 'urgent', 'warning', 'info'] as Filter[]).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={[
                'px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex-shrink-0',
                filter === f
                  ? 'bg-violet text-white'
                  : 'bg-white text-mid border border-gray-200 hover:border-violet/40',
              ].join(' ')}
            >
              {{ alle: 'Alle', ongelezen: 'Ongelezen', urgent: 'Urgent', warning: 'Waarschuwing', info: 'Info' }[f]}
              {f !== 'alle' && f !== 'ongelezen' && (
                <span className="ml-1 opacity-70">({notifications.filter(n => n.type === f).length})</span>
              )}
              {f === 'ongelezen' && (
                <span className="ml-1 opacity-70">({unreadCount})</span>
              )}
            </button>
          ))}
        </div>

        {/* 2-column layout on desktop */}
        <div className="flex flex-col lg:flex-row gap-3 sm:gap-4">

          {/* ── Notifications list (left / main) ─────────────────── */}
          <div className="flex-1 min-w-0 flex flex-col gap-2">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center">
                  <BellOff size={28} className="text-mid/40" />
                </div>
                <p className="text-dark font-semibold">Geen meldingen</p>
                <p className="text-mid text-sm">U bent helemaal bijgewerkt</p>
              </div>
            ) : (
              filtered.map(notif => {
                const meta = TYPE_META[notif.type];
                const contract = getContract(notif.contractId);
                return (
                  <div
                    key={notif.id}
                    onClick={() => {
                      if (!notif.read) onMarkRead(notif.id);
                      if (contract && onGoToContract) onGoToContract(notif.contractId);
                    }}
                    className={[
                      'bg-white rounded-2xl border p-4 cursor-pointer transition-all hover:shadow-sm',
                      notif.read ? 'border-gray-100 opacity-70' : 'border-l-4',
                    ].join(' ')}
                    style={notif.read ? {} : { borderLeftColor: meta.color }}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ background: notif.read ? '#f3f4f6' : meta.bg, color: notif.read ? '#9ca3af' : meta.color }}
                      >
                        {meta.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                          <span className="text-sm font-bold text-dark">{notif.title}</span>
                          {!notif.read && (
                            <span
                              className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold text-white flex-shrink-0"
                              style={{ background: meta.color }}
                            >
                              Nieuw
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-mid leading-relaxed">{notif.message}</p>
                        <div className="flex items-center gap-2 mt-2">
                          {contract && (
                            <span className="text-xs font-mono text-mid">{contract.name}</span>
                          )}
                          <span className="text-xs text-mid/60 font-mono">·</span>
                          <span className="text-xs text-mid/60 font-mono">{formatDate(notif.date)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <span
                          className="text-[10px] font-bold px-2 py-1 rounded-lg"
                          style={{ background: meta.bg, color: meta.color }}
                        >
                          {meta.label}
                        </span>
                        {!notif.read && (
                          <button
                            onClick={e => { e.stopPropagation(); onMarkRead(notif.id); }}
                            className="text-mid/40 hover:text-violet transition-colors p-1"
                            title="Markeer als gelezen"
                          >
                            <Bell size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* ── Verloopkalender timeline (right, desktop only) ───── */}
          {timeline.length > 0 && (
            <div className="lg:w-72 xl:w-80 flex-shrink-0">
              <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5">
                <div className="text-sm font-bold text-dark mb-5">Verloopkalender</div>
                <div className="relative">
                  {/* Vertical line */}
                  <div className="absolute left-[7px] top-2 bottom-2 w-px bg-gray-100" />

                  <div className="flex flex-col gap-5">
                    {timeline.map(c => {
                      const meta = CATEGORY_META[c.category];
                      const dotColor = timelineDotColor(c.endDate);
                      const badge = timelineBadge(c.endDate);
                      return (
                        <div
                          key={c.id}
                          className="relative pl-6 cursor-pointer group"
                          onClick={() => onGoToContract && onGoToContract(c.id)}
                        >
                          {/* Dot */}
                          <div
                            className="absolute left-0 top-1 w-3.5 h-3.5 rounded-full border-2 border-white shadow-sm"
                            style={{ backgroundColor: dotColor }}
                          />
                          <div className="text-xs text-mid font-mono mb-0.5">{formatDate(c.endDate)}</div>
                          <div className="text-sm font-semibold text-dark group-hover:text-violet transition-colors">{c.name}</div>
                          <div className="text-xs text-mid">{c.provider}</div>
                          <span
                            className="inline-block mt-1.5 text-[10px] font-bold px-2 py-0.5 rounded-lg"
                            style={{ background: badge.bg, color: badge.color }}
                          >
                            {badge.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
