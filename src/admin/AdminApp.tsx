import React, { useState, useMemo } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Payment {
  method:    'iDEAL' | 'Creditcard' | 'PayPal';
  cycle:     'maandelijks' | 'jaarlijks';
  paidSince: string;
  totalPaid: number;
}

interface AdminUser {
  id:                string;
  email:             string;
  registeredAt:      string;
  lastActiveAt:      string;
  plan:              'free' | 'premium';
  status:            'active' | 'inactive' | 'suspended';
  contractCount:     number;
  subscriptionCount: number;
  avgMonthlyCost:    number;
  features: { meldingen: boolean; tijdlijn: boolean; kosten: boolean; abonnementen: boolean };
  payment?: Payment;
}

type View = 'dashboard' | 'users' | 'waitlist' | 'financieel' | 'marketing' | 'developer' | 'avg';

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_USERS: AdminUser[] = [
  { id: 'u-001', email: 'anna.vandenberg@gmail.com',  registeredAt: '2025-10-15', lastActiveAt: '2026-04-24', plan: 'free',    status: 'active',    contractCount: 8,  subscriptionCount: 4, avgMonthlyCost: 1240, features: { meldingen: true,  tijdlijn: true,  kosten: true,  abonnementen: true  } },
  { id: 'u-002', email: 'mark.bakker@hotmail.nl',     registeredAt: '2025-11-03', lastActiveAt: '2026-04-26', plan: 'free',    status: 'active',    contractCount: 3,  subscriptionCount: 2, avgMonthlyCost: 650,  features: { meldingen: true,  tijdlijn: false, kosten: true,  abonnementen: true  } },
  { id: 'u-003', email: 's.koopman@gmail.com',        registeredAt: '2025-11-22', lastActiveAt: '2026-04-20', plan: 'premium', status: 'active',    contractCount: 12, subscriptionCount: 6, avgMonthlyCost: 2100, features: { meldingen: true,  tijdlijn: true,  kosten: true,  abonnementen: true  }, payment: { method: 'iDEAL',      cycle: 'maandelijks', paidSince: '2025-11-22', totalPaid: 24.95 } },
  { id: 'u-004', email: 'p.dejong@outlook.com',       registeredAt: '2025-12-10', lastActiveAt: '2026-01-18', plan: 'free',    status: 'inactive',  contractCount: 1,  subscriptionCount: 0, avgMonthlyCost: 180,  features: { meldingen: false, tijdlijn: false, kosten: false, abonnementen: false } },
  { id: 'u-005', email: 'l.maas@gmail.com',           registeredAt: '2025-12-28', lastActiveAt: '2026-04-25', plan: 'free',    status: 'active',    contractCount: 5,  subscriptionCount: 3, avgMonthlyCost: 980,  features: { meldingen: true,  tijdlijn: true,  kosten: true,  abonnementen: false } },
  { id: 'u-006', email: 'tom.vermeulen@gmail.com',    registeredAt: '2026-01-09', lastActiveAt: '2026-04-26', plan: 'premium', status: 'active',    contractCount: 6,  subscriptionCount: 3, avgMonthlyCost: 1120, features: { meldingen: true,  tijdlijn: true,  kosten: false, abonnementen: true  }, payment: { method: 'Creditcard', cycle: 'jaarlijks',   paidSince: '2026-01-09', totalPaid: 39    } },
  { id: 'u-007', email: 'f.aouam@gmail.com',          registeredAt: '2026-01-21', lastActiveAt: '2026-04-23', plan: 'free',    status: 'active',    contractCount: 4,  subscriptionCount: 2, avgMonthlyCost: 790,  features: { meldingen: true,  tijdlijn: false, kosten: true,  abonnementen: true  } },
  { id: 'u-008', email: 'd.hendriks@icloud.com',      registeredAt: '2026-02-05', lastActiveAt: '2026-02-28', plan: 'free',    status: 'inactive',  contractCount: 0,  subscriptionCount: 0, avgMonthlyCost: 0,    features: { meldingen: false, tijdlijn: false, kosten: false, abonnementen: false } },
  { id: 'u-009', email: 'emma.smit@gmail.com',        registeredAt: '2026-02-14', lastActiveAt: '2026-04-26', plan: 'premium', status: 'active',    contractCount: 9,  subscriptionCount: 5, avgMonthlyCost: 1480, features: { meldingen: true,  tijdlijn: true,  kosten: true,  abonnementen: true  }, payment: { method: 'iDEAL',      cycle: 'maandelijks', paidSince: '2026-02-14', totalPaid: 14.97 } },
  { id: 'u-010', email: 'j.rijkema@outlook.nl',       registeredAt: '2026-02-27', lastActiveAt: '2026-04-21', plan: 'free',    status: 'active',    contractCount: 2,  subscriptionCount: 1, avgMonthlyCost: 420,  features: { meldingen: true,  tijdlijn: false, kosten: false, abonnementen: true  } },
  { id: 'u-011', email: 'nadia.bloem@gmail.com',      registeredAt: '2026-03-04', lastActiveAt: '2026-03-15', plan: 'free',    status: 'suspended', contractCount: 7,  subscriptionCount: 4, avgMonthlyCost: 1050, features: { meldingen: true,  tijdlijn: true,  kosten: true,  abonnementen: false } },
  { id: 'u-012', email: 'bas.lammers@gmail.com',      registeredAt: '2026-03-12', lastActiveAt: '2026-04-26', plan: 'free',    status: 'active',    contractCount: 3,  subscriptionCount: 2, avgMonthlyCost: 590,  features: { meldingen: true,  tijdlijn: false, kosten: true,  abonnementen: false } },
  { id: 'u-013', email: 's.willems@yahoo.com',        registeredAt: '2026-03-25', lastActiveAt: '2026-04-25', plan: 'free',    status: 'active',    contractCount: 5,  subscriptionCount: 3, avgMonthlyCost: 910,  features: { meldingen: true,  tijdlijn: true,  kosten: false, abonnementen: true  } },
  { id: 'u-014', email: 'rick.nijssen@gmail.com',     registeredAt: '2026-04-02', lastActiveAt: '2026-04-10', plan: 'free',    status: 'inactive',  contractCount: 1,  subscriptionCount: 0, avgMonthlyCost: 95,   features: { meldingen: false, tijdlijn: false, kosten: false, abonnementen: false } },
  { id: 'u-015', email: 'iris.kuijpers@gmail.com',    registeredAt: '2026-04-08', lastActiveAt: '2026-04-26', plan: 'premium', status: 'active',    contractCount: 11, subscriptionCount: 7, avgMonthlyCost: 1890, features: { meldingen: true,  tijdlijn: true,  kosten: true,  abonnementen: true  }, payment: { method: 'PayPal',     cycle: 'jaarlijks',   paidSince: '2026-04-08', totalPaid: 39    } },
];

// ─── Auth ─────────────────────────────────────────────────────────────────────
const ADMIN_PASSWORD = 'pactly2026';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TODAY = new Date('2026-04-26');

function daysSince(dateStr: string) { return Math.floor((TODAY.getTime() - new Date(dateStr).getTime()) / 86_400_000); }
function monthsSince(dateStr: string) { const d = new Date(dateStr); return (TODAY.getFullYear() - d.getFullYear()) * 12 + (TODAY.getMonth() - d.getMonth()); }
function formatDate(s: string) { return new Date(s).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric' }); }
function relativeDate(s: string) { const d = daysSince(s); return d === 0 ? 'vandaag' : d === 1 ? 'gisteren' : d < 7 ? `${d}d geleden` : d < 31 ? `${Math.floor(d/7)}w geleden` : d < 365 ? `${Math.floor(d/30)}mnd geleden` : `${Math.floor(d/365)}jr geleden`; }
function euros(n: number) { return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(n); }
function pct(a: number, b: number) { return b > 0 ? Math.round((a / b) * 100) : 0; }
function copyToClipboard(t: string) { navigator.clipboard?.writeText(t).catch(() => {}); }
function emailDomain(email: string) { return email.split('@')[1] ?? ''; }

// ─── Shared UI components ─────────────────────────────────────────────────────

function StatusBadge({ status }: { status: AdminUser['status'] }) {
  const cfg = {
    active:    { label: 'Actief',         cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    inactive:  { label: 'Inactief',       cls: 'bg-gray-100 text-gray-500 border-gray-200' },
    suspended: { label: 'Gesuspendeerd',  cls: 'bg-red-50 text-red-600 border-red-200' },
  };
  const { label, cls } = cfg[status];
  return <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${cls}`}>{label}</span>;
}

function PlanBadge({ plan }: { plan: AdminUser['plan'] }) {
  return plan === 'premium'
    ? <span className="px-2 py-0.5 rounded-full text-xs font-bold border bg-violet-50 text-[#4B519E] border-violet-200">⭐ Plus</span>
    : <span className="px-2 py-0.5 rounded-full text-xs font-semibold border bg-gray-100 text-gray-500 border-gray-200">Free</span>;
}

function KpiCard({ label, value, sub, accent = false, color, delta }: { label: string; value: string | number; sub?: string; accent?: boolean; color?: 'green' | 'amber' | 'red'; delta?: string }) {
  const bg        = accent ? 'bg-violet-50 border-violet-200' : color === 'green' ? 'bg-emerald-50 border-emerald-200' : color === 'amber' ? 'bg-amber-50 border-amber-200' : color === 'red' ? 'bg-red-50 border-red-200' : 'bg-white border-gray-100';
  const textColor = accent ? 'text-[#4B519E]' : color === 'green' ? 'text-emerald-700' : color === 'amber' ? 'text-amber-700' : color === 'red' ? 'text-red-600' : 'text-[#181A2B]';
  return (
    <div className={`rounded-xl border p-5 ${bg}`}>
      <p className="text-xs text-[#6B6A7A] uppercase tracking-wider font-mono mb-1">{label}</p>
      <p className={`text-3xl font-extrabold ${textColor}`}>{value}</p>
      {delta && <p className="text-xs text-emerald-600 mt-0.5 font-mono">{delta}</p>}
      {sub && <p className="text-xs text-[#6B6A7A] mt-1">{sub}</p>}
    </div>
  );
}

function SectionTitle({ icon, title, sub }: { icon: string; title: string; sub?: string }) {
  return (
    <div className="mb-3">
      <p className="text-xs text-[#6B6A7A] uppercase tracking-wider font-mono flex items-center gap-2">
        <span>{icon}</span>{title}
      </p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}

function FeatureBar({ label, used, total, color = 'bg-[#4B519E]' }: { label: string; used: number; total: number; color?: string }) {
  const p = pct(used, total);
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-[#181A2B]">{label}</span>
        <span className="text-[#6B6A7A] font-mono">{used}/{total} · {p}%</span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${p}%` }} />
      </div>
    </div>
  );
}

// ─── User detail modal ────────────────────────────────────────────────────────

function UserDetailModal({ user, onClose, onStatusChange }: { user: AdminUser; onClose: () => void; onStatusChange: (id: string, s: AdminUser['status']) => void }) {
  const [showDelete, setShowDelete] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [exportDone, setExportDone] = useState(false);
  const featureLabels: Record<keyof AdminUser['features'], string> = { meldingen: 'Meldingen', tijdlijn: 'Tijdlijn', kosten: 'Kosten', abonnementen: 'Abonnementen' };
  const memberMonths = monthsSince(user.registeredAt);
  const daysSinceActive = daysSince(user.lastActiveAt);
  const isAtRisk = daysSinceActive > 30 && user.status === 'active';

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 space-y-5 shadow-xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-[#6B6A7A] font-mono mb-0.5">ACCOUNT · {user.id.toUpperCase()}</p>
            <h2 className="text-[#181A2B] font-bold text-lg">{user.email}</h2>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <PlanBadge plan={user.plan} />
              <StatusBadge status={user.status} />
              {isAtRisk && <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">⚠️ Risico op churn</span>}
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-[#181A2B] text-2xl leading-none ml-4">×</button>
        </div>

        {/* Account info */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div><p className="text-[#6B6A7A] text-xs mb-0.5">Geregistreerd</p><p className="text-[#181A2B]">{formatDate(user.registeredAt)}</p></div>
          <div><p className="text-[#6B6A7A] text-xs mb-0.5">Lid (maanden)</p><p className="text-[#181A2B]">{memberMonths} mnd</p></div>
          <div><p className="text-[#6B6A7A] text-xs mb-0.5">Laatste activiteit</p><p className={`font-medium ${daysSinceActive > 30 ? 'text-amber-600' : 'text-[#181A2B]'}`}>{relativeDate(user.lastActiveAt)}</p></div>
          <div><p className="text-[#6B6A7A] text-xs mb-0.5">Contracten / abo's</p><p className="text-[#181A2B]">{user.contractCount} / {user.subscriptionCount}</p></div>
          <div className="col-span-2"><p className="text-[#6B6A7A] text-xs mb-0.5">Gem. maandlasten (getrackt)</p><p className="text-[#181A2B] font-semibold">{euros(user.avgMonthlyCost)}<span className="text-[#6B6A7A] text-xs font-normal ml-1">/mnd · {euros(user.avgMonthlyCost * 12)}/jr</span></p></div>
        </div>

        {/* Payment info */}
        {user.plan === 'premium' && user.payment && (
          <div className="bg-violet-50 border border-violet-200 rounded-xl p-4 text-sm space-y-2.5">
            <p className="text-xs text-[#4B519E] uppercase tracking-wider font-mono">Betaalinformatie</p>
            <div className="grid grid-cols-2 gap-2">
              <div><p className="text-[#6B6A7A] text-xs mb-0.5">Methode</p><p className="text-[#181A2B] font-medium">{user.payment.method}</p></div>
              <div><p className="text-[#6B6A7A] text-xs mb-0.5">Cyclus</p><p className="text-[#181A2B] capitalize">{user.payment.cycle}</p></div>
              <div><p className="text-[#6B6A7A] text-xs mb-0.5">Betaald sinds</p><p className="text-[#181A2B]">{formatDate(user.payment.paidSince)}</p></div>
              <div><p className="text-[#6B6A7A] text-xs mb-0.5">Totaal betaald</p><p className="text-emerald-600 font-bold">{euros(user.payment.totalPaid)}</p></div>
            </div>
            <p className="text-xs text-[#6B6A7A]">Betaalstatus: <span className="text-emerald-600 font-semibold">✓ Voldaan</span> · Volledige betaalgegevens via betaalprovider (AVG art. 5.1.c)</p>
          </div>
        )}

        {/* Feature usage */}
        <div>
          <p className="text-xs text-[#6B6A7A] uppercase tracking-wider mb-2">Features in gebruik</p>
          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(user.features) as Array<keyof AdminUser['features']>).map(key => (
              <div key={key} className={`flex items-center gap-2 text-xs px-3 py-2 rounded-lg ${user.features[key] ? 'bg-violet-50 text-[#4B519E]' : 'bg-gray-100 text-gray-400'}`}>
                <span>{user.features[key] ? '✓' : '·'}</span><span>{featureLabels[key]}</span>
              </div>
            ))}
          </div>
          {!user.features.tijdlijn && <p className="text-xs text-amber-600 mt-2">💡 Tijdlijn niet gebruikt — kans voor re-engagement.</p>}
        </div>

        {/* AVG notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-xs text-blue-700 leading-relaxed">
          <strong className="text-blue-800">AVG — Beperkte inzage:</strong> Contractinhoud, notities en bijlagen zijn niet zichtbaar (art. 5.1.c).
        </div>

        {/* Support actions */}
        <div className="space-y-2">
          <p className="text-xs text-[#6B6A7A] uppercase tracking-wider">Support-acties</p>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => { setResetSent(true); setTimeout(() => setResetSent(false), 3000); }} className="px-4 py-2 text-sm rounded-lg bg-gray-100 hover:bg-gray-200 text-[#181A2B] transition-colors">
              {resetSent ? '✓ Verstuurd' : '📧 Stuur reset-link'}
            </button>
            <button onClick={() => { setExportDone(true); setTimeout(() => setExportDone(false), 3000); }} className="px-4 py-2 text-sm rounded-lg bg-gray-100 hover:bg-gray-200 text-[#181A2B] transition-colors">
              {exportDone ? '✓ Export klaar' : '📄 Data-export (AVG)'}
            </button>
          </div>
          {user.status === 'active' && <button onClick={() => onStatusChange(user.id, 'suspended')} className="w-full px-4 py-2 text-sm rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 transition-colors">⚠️ Suspendeer account</button>}
          {user.status === 'suspended' && <button onClick={() => onStatusChange(user.id, 'active')} className="w-full px-4 py-2 text-sm rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-colors">✓ Herstel account</button>}
          {!showDelete ? (
            <button onClick={() => setShowDelete(true)} className="w-full px-4 py-2 text-sm rounded-lg bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 transition-colors">🗑 Verwijder account (recht op vergetelheid)</button>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-3">
              <p className="text-red-700 text-sm font-medium">Account én alle data permanent verwijderen?</p>
              <p className="text-red-500 text-xs">Conform art. 17 AVG. Kan niet ongedaan worden gemaakt.</p>
              <div className="flex gap-2">
                <button onClick={onClose} className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold">Ja, verwijder definitief</button>
                <button onClick={() => setShowDelete(false)} className="flex-1 py-2 bg-gray-100 text-gray-500 rounded-lg text-xs">Annuleer</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── 1. Dashboard — Eigenaar ──────────────────────────────────────────────────

function DashboardView({ users, waitlist }: { users: AdminUser[]; waitlist: string[] }) {
  const [copied, setCopied] = useState<string | null>(null);
  const premium      = users.filter(u => u.plan === 'premium');
  const active30     = users.filter(u => daysSince(u.lastActiveAt) <= 30 && u.status !== 'suspended').length;
  const newThis30    = users.filter(u => daysSince(u.registeredAt) <= 30).length;
  const churnCount   = users.filter(u => u.status === 'inactive' || u.status === 'suspended').length;
  const convRate     = pct(premium.length, users.length);
  const mrr          = premium.reduce((s, u) => s + (!u.payment ? 0 : u.payment.cycle === 'maandelijks' ? 4.99 : 39 / 12), 0);
  const arr          = mrr * 12;
  const totalRev     = premium.reduce((s, u) => s + (u.payment?.totalPaid ?? 0), 0);

  const featureUsed = {
    meldingen:    users.filter(u => u.features.meldingen).length,
    abonnementen: users.filter(u => u.features.abonnementen).length,
    kosten:       users.filter(u => u.features.kosten).length,
    tijdlijn:     users.filter(u => u.features.tijdlijn).length,
  };

  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(TODAY); d.setMonth(d.getMonth() - (5 - i));
    const label = d.toLocaleDateString('nl-NL', { month: 'short' });
    const count = users.filter(u => { const r = new Date(u.registeredAt); return r.getFullYear() === d.getFullYear() && r.getMonth() === d.getMonth(); }).length;
    return { label, count };
  });
  const maxCount = Math.max(...months.map(m => m.count), 1);

  const doCopy = (key: string, text: string) => { copyToClipboard(text); setCopied(key); setTimeout(() => setCopied(null), 2500); };
  const activeUsers = users.filter(u => u.contractCount > 0);
  const avgCosts = activeUsers.length ? activeUsers.reduce((s, u) => s + u.avgMonthlyCost, 0) / activeUsers.length : 0;

  return (
    <div className="space-y-6">
      <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-3 flex items-center gap-3">
        <span className="text-amber-500 text-lg flex-shrink-0">🔧</span>
        <p className="text-amber-700 text-sm"><strong>Prototype</strong> — Gebruikersdata is gesimuleerd. Live data beschikbaar na backend koppeling.</p>
      </div>

      <div>
        <SectionTitle icon="💶" title="Business health" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard label="MRR" value={euros(mrr)} color="green" sub="monthly recurring revenue" delta={`ARR: ${euros(arr)}`} />
          <KpiCard label="Totaal omzet" value={euros(totalRev)} color="green" sub="cumulatief ontvangen" />
          <KpiCard label="Plus-gebruikers" value={premium.length} sub={`${convRate}% conversie (free → plus)`} />
          <KpiCard label="Actief (30d)" value={active30} sub={`+${newThis30} nieuw · ${churnCount} inactief/gesuspendeerd`} />
        </div>
      </div>

      <div>
        <SectionTitle icon="👥" title="Platform" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard label="Totaal aangemeld" value={users.length} accent />
          <KpiCard label="Wachtlijst" value={waitlist.length + 243} sub="aanmeldingen via website" />
          <KpiCard label="Geactiveerd" value={users.filter(u => u.contractCount > 0).length} sub="≥ 1 contract ingevoerd" />
          <KpiCard label="Gem. maandlasten" value={euros(avgCosts)} sub="getrackt per huishouden" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-100 rounded-xl p-6">
          <h3 className="text-xs text-[#6B6A7A] uppercase tracking-wider font-mono mb-5">Nieuwe registraties — 6 maanden</h3>
          <div className="flex items-end gap-3 h-28">
            {months.map(m => (
              <div key={m.label} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs text-[#6B6A7A] font-mono">{m.count || ''}</span>
                <div className="w-full rounded-t transition-all min-h-[4px]" style={{ height: `${Math.max((m.count / maxCount) * 80, 4)}px`, background: '#4B519E' }} />
                <span className="text-xs text-[#6B6A7A]">{m.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl p-6">
          <h3 className="text-xs text-[#6B6A7A] uppercase tracking-wider font-mono mb-5">Feature adoptie</h3>
          <div className="space-y-4">
            <FeatureBar label="Meldingen"    used={featureUsed.meldingen}    total={users.length} />
            <FeatureBar label="Abonnementen" used={featureUsed.abonnementen} total={users.length} />
            <FeatureBar label="Kosten"       used={featureUsed.kosten}       total={users.length} />
            <FeatureBar label="Tijdlijn"     used={featureUsed.tijdlijn}     total={users.length} color="bg-emerald-500" />
          </div>
        </div>
      </div>

      {/* Quick marketing copy */}
      <div className="bg-white border border-gray-100 rounded-xl p-6">
        <h3 className="text-xs text-[#6B6A7A] uppercase tracking-wider font-mono mb-1">📢 Marketing stats — direct kopieerbaar</h3>
        <p className="text-xs text-gray-400 mb-4">Gebruik deze teksten voor campagnes, socials of de website.</p>
        <div className="space-y-3">
          {[
            { key: 'wl',      label: 'Wachtlijst',  copy: `Meer dan ${243 + waitlist.length} mensen staan al op de Pactly wachtlijst` },
            { key: 'users',   label: 'Gebruikers',  copy: `${users.length} huishoudens gingen je al voor met Pactly` },
            { key: 'avg',     label: 'Maandlasten', copy: `Nederlandse huishoudens besteden gemiddeld ${euros(avgCosts)} per maand aan contracten — Pactly brengt dat in kaart` },
            { key: 'conv',    label: 'Conversie',   copy: `${convRate}% van Pactly-gebruikers kiest voor het Plus-abonnement na het proberen van de gratis versie` },
          ].map(s => (
            <div key={s.key} className="flex items-center justify-between gap-4 bg-gray-50 border border-gray-100 rounded-lg px-4 py-3">
              <div>
                <p className="text-xs text-[#6B6A7A] font-mono mb-0.5">{s.label}</p>
                <p className="text-[#181A2B] text-sm">"{s.copy}"</p>
              </div>
              <button onClick={() => doCopy(s.key, s.copy)} className={`flex-shrink-0 px-3 py-1.5 text-xs rounded-lg font-semibold transition-colors ${copied === s.key ? 'bg-emerald-100 text-emerald-700' : 'bg-violet-50 hover:bg-violet-100 text-[#4B519E]'}`}>
                {copied === s.key ? '✓ Gekopieerd' : 'Kopieer'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── 2. Gebruikers — Support ──────────────────────────────────────────────────

function UsersView({ users, onStatusChange }: { users: AdminUser[]; onStatusChange: (id: string, s: AdminUser['status']) => void }) {
  const [search, setSearch]             = useState('');
  const [planFilter, setPlanFilter]     = useState<'all' | 'free' | 'premium'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | AdminUser['status'] | 'atrisk'>('all');
  const [sort, setSort]                 = useState<'recent' | 'active' | 'contracts'>('recent');
  const [selected, setSelected]         = useState<AdminUser | null>(null);

  const filtered = useMemo(() => {
    let list = users
      .filter(u => planFilter   === 'all' || u.plan === planFilter)
      .filter(u => statusFilter === 'atrisk' ? daysSince(u.lastActiveAt) > 30 && u.status === 'active' : statusFilter === 'all' || u.status === statusFilter)
      .filter(u => u.email.toLowerCase().includes(search.toLowerCase()));
    list.sort((a, b) =>
      sort === 'active'    ? daysSince(a.lastActiveAt) - daysSince(b.lastActiveAt) :
      sort === 'contracts' ? (b.contractCount + b.subscriptionCount) - (a.contractCount + a.subscriptionCount) :
      new Date(b.registeredAt).getTime() - new Date(a.registeredAt).getTime()
    );
    return list;
  }, [users, search, planFilter, statusFilter, sort]);

  const atRiskCount = users.filter(u => daysSince(u.lastActiveAt) > 30 && u.status === 'active').length;

  return (
    <div className="space-y-4">
      {atRiskCount > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-3 flex items-center justify-between">
          <p className="text-amber-700 text-sm">⚠️ <strong>{atRiskCount} actieve gebruiker{atRiskCount !== 1 ? 's' : ''}</strong> niet gezien in meer dan 30 dagen — risico op churn.</p>
          <button onClick={() => setStatusFilter('atrisk')} className="text-xs text-amber-600 underline flex-shrink-0 ml-3">Filter →</button>
        </div>
      )}

      <div className="space-y-3">
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Zoek op e-mailadres…"
          className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg text-[#181A2B] text-sm placeholder-gray-400 focus:outline-none focus:border-[#4B519E] transition-colors" />
        <div className="flex gap-2 flex-wrap items-center">
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
            {(['all', 'free', 'premium'] as const).map(f => (
              <button key={f} onClick={() => setPlanFilter(f)} className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${planFilter === f ? 'bg-[#4B519E] text-white' : 'text-[#6B6A7A] hover:text-[#181A2B]'}`}>
                {f === 'all' ? 'Alle plannen' : f === 'free' ? 'Free' : '⭐ Plus'}
              </button>
            ))}
          </div>
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
            {([['all','Alle'], ['active','Actief'], ['inactive','Inactief'], ['suspended','Gesuspendeerd'], ['atrisk','⚠️ At-risk']] as const).map(([f, label]) => (
              <button key={f} onClick={() => setStatusFilter(f as any)} className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${statusFilter === f ? 'bg-[#4B519E] text-white' : 'text-[#6B6A7A] hover:text-[#181A2B]'}`}>
                {label}
              </button>
            ))}
          </div>
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1 ml-auto">
            <span className="text-xs text-[#6B6A7A] px-2 self-center">Sorteren:</span>
            {([['recent','Nieuwste'], ['active','Actief'], ['contracts','Contracten']] as const).map(([s, l]) => (
              <button key={s} onClick={() => setSort(s)} className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${sort === s ? 'bg-white text-[#181A2B] shadow-sm' : 'text-[#6B6A7A] hover:text-[#181A2B]'}`}>{l}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
        <div className="grid gap-3 px-4 py-2.5 border-b border-gray-100 text-xs text-[#6B6A7A] uppercase tracking-wider font-mono" style={{ gridTemplateColumns: '2fr 110px 110px 60px 60px 90px 150px 80px' }}>
          <span>E-mail</span><span>Geregistreerd</span><span>Actief</span><span>C</span><span>A</span><span>Plan</span><span>Status</span><span/>
        </div>
        {filtered.map(u => {
          const atRisk = daysSince(u.lastActiveAt) > 30 && u.status === 'active';
          return (
            <div key={u.id} className={`grid gap-3 px-4 py-3 border-b border-gray-50 last:border-0 transition-colors items-center text-sm ${atRisk ? 'hover:bg-amber-50' : 'hover:bg-gray-50'}`}
              style={{ gridTemplateColumns: '2fr 110px 110px 60px 60px 90px 150px 80px' }}>
              <div className="min-w-0">
                <span className="text-[#181A2B] font-medium truncate block" title={u.email}>{u.email}</span>
                <span className="text-[#6B6A7A] text-xs font-mono">{emailDomain(u.email)}</span>
              </div>
              <span className="text-[#6B6A7A] font-mono text-xs">{formatDate(u.registeredAt)}</span>
              <span className={`font-mono text-xs ${atRisk ? 'text-amber-600' : 'text-[#6B6A7A]'}`}>{relativeDate(u.lastActiveAt)}</span>
              <span className="text-[#181A2B] font-mono">{u.contractCount}</span>
              <span className="text-[#181A2B] font-mono">{u.subscriptionCount}</span>
              <PlanBadge plan={u.plan} />
              <div className="flex gap-1 flex-wrap"><StatusBadge status={u.status} />{atRisk && <span className="text-[10px] text-amber-500">⚠️</span>}</div>
              <button onClick={() => setSelected(u)} className="px-3 py-1.5 text-xs bg-violet-50 hover:bg-violet-100 text-[#4B519E] rounded-lg transition-colors">Detail →</button>
            </div>
          );
        })}
        {filtered.length === 0 && <div className="px-4 py-10 text-center text-[#6B6A7A] text-sm">Geen gebruikers gevonden.</div>}
      </div>
      <p className="text-xs text-gray-400 font-mono">{filtered.length} van {users.length} accounts · Contractinhoud niet inzichtelijk (art. 5.1.c AVG)</p>

      {selected && <UserDetailModal user={selected} onClose={() => setSelected(null)} onStatusChange={(id, s) => { onStatusChange(id, s); setSelected(u => u ? { ...u, status: s } : null); }} />}
    </div>
  );
}

// ─── 3. Wachtlijst ───────────────────────────────────────────────────────────

function WaitlistView({ emails }: { emails: string[] }) {
  return (
    <div className="space-y-4">
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-5 py-3">
        <p className="text-emerald-700 text-sm"><strong className="text-emerald-800">{emails.length} aanmelding{emails.length !== 1 ? 'en' : ''}</strong> via de landingspagina — live data. <span className="text-emerald-600">Grondslag: art. 6.1.a AVG (toestemming via opt-in checkbox).</span></p>
      </div>
      {emails.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-xl px-5 py-14 text-center">
          <p className="text-[#6B6A7A] text-sm">Nog geen wachtlijst-aanmeldingen.</p>
          <p className="text-gray-400 text-xs mt-1">Aanmeldingen via pactly.nl verschijnen hier automatisch.</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
          <div className="grid grid-cols-[1fr_140px] gap-4 px-4 py-2.5 border-b border-gray-100 text-xs text-[#6B6A7A] uppercase tracking-wider font-mono"><span>E-mail</span><span>Actie</span></div>
          {emails.map((email, i) => (
            <div key={i} className="grid grid-cols-[1fr_140px] gap-4 px-4 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors items-center text-sm">
              <span className="text-[#181A2B]">{email}</span>
              <button className="px-3 py-1.5 text-xs bg-violet-50 hover:bg-violet-100 text-[#4B519E] rounded-lg transition-colors">Uitnodiging sturen</button>
            </div>
          ))}
        </div>
      )}
      <p className="text-xs text-gray-400">Bewaartermijn: max. 1 jaar of tot omzetting naar account.</p>
    </div>
  );
}

// ─── 4. Financieel — Controller ───────────────────────────────────────────────

function FinancieelView({ users }: { users: AdminUser[] }) {
  const premium    = users.filter(u => u.plan === 'premium');
  const monthly_pl = premium.filter(u => u.payment?.cycle === 'maandelijks');
  const annual_pl  = premium.filter(u => u.payment?.cycle === 'jaarlijks');
  const mrr        = monthly_pl.length * 4.99 + annual_pl.length * (39 / 12);
  const arr        = mrr * 12;
  const totalRev   = premium.reduce((s, u) => s + (u.payment?.totalPaid ?? 0), 0);
  const arpu_prem  = premium.length > 0 ? mrr / premium.length : 0;
  const arpu_all   = users.length > 0 ? mrr / users.length : 0;
  const avgLtv     = premium.length > 0 ? totalRev / premium.length : 0;

  const mrrHistory = [
    { month: 'Nov \'25', mrr: 4.99 },
    { month: 'Dec \'25', mrr: 4.99 },
    { month: 'Jan \'26', mrr: 4.99 + 3.25 },
    { month: 'Feb \'26', mrr: 4.99 + 3.25 + 4.99 },
    { month: 'Mar \'26', mrr: 4.99 + 3.25 + 4.99 },
    { month: 'Apr \'26', mrr: 4.99 + 3.25 + 4.99 + 3.25 },
  ];
  const maxMrr = Math.max(...mrrHistory.map(m => m.mrr), 1);

  const forecast = Array.from({ length: 5 }, (_, i) => {
    const months = (i + 1) * 3;
    const projMrr = mrr + months * 2 * arpu_prem;
    return { label: `+${months} mnd`, mrr: projMrr, arr: projMrr * 12 };
  });

  return (
    <div className="space-y-6">
      <div>
        <SectionTitle icon="💶" title="Revenue snapshot" sub="Actuele cijfers op basis van betalende gebruikers" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard label="MRR" value={euros(mrr)} color="green" delta={`ARR: ${euros(arr)}`} sub="monthly recurring revenue" />
          <KpiCard label="ARR" value={euros(arr)} color="green" sub="annualised recurring revenue" />
          <KpiCard label="Totaal ontvangen" value={euros(totalRev)} color="green" sub="cumulatief incl. jaarabonnementen" />
          <KpiCard label="Gem. LTV (tot nu)" value={euros(avgLtv)} sub={`per Plus-gebruiker · ${premium.length} betalend`} />
        </div>
      </div>

      <div>
        <SectionTitle icon="📐" title="ARPU & conversie" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard label="ARPU (Plus)" value={euros(arpu_prem)} sub="gem. MRR per betalende gebruiker" />
          <KpiCard label="ARPU (blended)" value={euros(arpu_all)} sub="MRR over alle gebruikers" />
          <KpiCard label="Conversie free→Plus" value={`${pct(premium.length, users.length)}%`} sub={`${premium.length} van ${users.length} gebruikers`} />
          <KpiCard label="Churn (inactief/gesus.)" value={`${pct(users.filter(u=>u.status!=='active').length, users.length)}%`} color="amber" sub="accountstatus-gebaseerd" />
        </div>
      </div>

      <div>
        <SectionTitle icon="💳" title="Factuurcyclus" />
        <div className="grid grid-cols-3 gap-4">
          <KpiCard label="Maandelijks" value={monthly_pl.length} sub={`${euros(monthly_pl.length * 4.99)}/mnd · ${euros(monthly_pl.length * 4.99 * 12)}/jr`} />
          <KpiCard label="Jaarlijks" value={annual_pl.length} sub={`${euros(annual_pl.length * 39)}/jr betaald vooruit`} />
          <div className="bg-white border border-gray-100 rounded-xl p-5">
            <p className="text-xs text-[#6B6A7A] uppercase tracking-wider font-mono mb-3">Betaalmethoden</p>
            {(['iDEAL', 'Creditcard', 'PayPal'] as const).map(m => {
              const count = premium.filter(u => u.payment?.method === m).length;
              return count > 0 ? (
                <div key={m} className="flex items-center justify-between text-sm py-1.5 border-b border-gray-100 last:border-0">
                  <span className="text-[#6B6A7A]">{m}</span>
                  <span className="text-[#181A2B] font-mono font-semibold">{count}</span>
                </div>
              ) : null;
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-100 rounded-xl p-6">
          <h3 className="text-xs text-[#6B6A7A] uppercase tracking-wider font-mono mb-5">MRR-groei — per maand</h3>
          <div className="flex items-end gap-3 h-28">
            {mrrHistory.map(m => (
              <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs text-emerald-600 font-mono">{euros(m.mrr)}</span>
                <div className="w-full bg-emerald-500 rounded-t" style={{ height: `${Math.max((m.mrr / maxMrr) * 80, 6)}px` }} />
                <span className="text-[10px] text-[#6B6A7A]">{m.month}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-[#6B6A7A] mt-3">Groei: Nov '25 {euros(4.99)} → Apr '26 {euros(mrr)} MRR (+{Math.round((mrr/4.99-1)*100)}%)</p>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl p-6">
          <h3 className="text-xs text-[#6B6A7A] uppercase tracking-wider font-mono mb-1">MRR-prognose (aanname: +2 Plus/mnd)</h3>
          <p className="text-xs text-gray-400 mb-4">Gebaseerd op huidige ARPU van {euros(arpu_prem)}/mnd per Plus-gebruiker</p>
          <div className="space-y-2.5">
            <div className="grid grid-cols-3 text-xs text-[#6B6A7A] uppercase tracking-wider font-mono pb-1 border-b border-gray-100">
              <span>Horizon</span><span className="text-center">Proj. MRR</span><span className="text-right">Proj. ARR</span>
            </div>
            <div className="grid grid-cols-3 text-sm py-1 border-b border-gray-100">
              <span className="text-[#6B6A7A]">Nu</span>
              <span className="text-center text-emerald-600 font-mono font-bold">{euros(mrr)}</span>
              <span className="text-right text-emerald-600 font-mono font-bold">{euros(arr)}</span>
            </div>
            {forecast.map(f => (
              <div key={f.label} className="grid grid-cols-3 text-sm py-1 border-b border-gray-50 last:border-0">
                <span className="text-[#6B6A7A]">{f.label}</span>
                <span className="text-center text-[#181A2B] font-mono">{euros(f.mrr)}</span>
                <span className="text-right text-[#6B6A7A] font-mono">{euros(f.arr)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 text-sm text-blue-700">
        <strong className="text-blue-800">💡 Controller-notities:</strong> Revenue-data is gebaseerd op gesimuleerde betalingen. Na koppeling met Mollie/Stripe worden MRR, ARR en churn automatisch berekend op basis van werkelijke transacties. Belastingwetgeving vereist bewaring betaalhistorie 7 jaar (art. AVG bewaartermijnen).
      </div>
    </div>
  );
}

// ─── 5. Marketing — Marketeer ─────────────────────────────────────────────────

function MarketingView({ users, waitlist }: { users: AdminUser[]; waitlist: string[] }) {
  const [copied, setCopied] = useState<string | null>(null);
  const doCopy = (key: string, text: string) => { copyToClipboard(text); setCopied(key); setTimeout(() => setCopied(null), 2500); };

  const premium  = users.filter(u => u.plan === 'premium');
  const active30 = users.filter(u => daysSince(u.lastActiveAt) <= 30 && u.status !== 'suspended');
  const activated = users.filter(u => u.contractCount > 0);
  const activeUsers = users.filter(u => u.contractCount > 0);
  const avgCosts = activeUsers.length ? activeUsers.reduce((s, u) => s + u.avgMonthlyCost, 0) / activeUsers.length : 0;
  const avgContracts = activeUsers.length ? (activeUsers.reduce((s, u) => s + u.contractCount, 0) / activeUsers.length).toFixed(1) : '0';
  const avgAbos = activeUsers.length ? (activeUsers.reduce((s, u) => s + u.subscriptionCount, 0) / activeUsers.length).toFixed(1) : '0';

  const domains: Record<string, number> = {};
  users.forEach(u => { const d = emailDomain(u.email); domains[d] = (domains[d] || 0) + 1; });
  const domainList = Object.entries(domains).sort((a, b) => b[1] - a[1]);

  const funnel = [
    { label: 'Wachtlijst',               value: 243 + waitlist.length, color: 'bg-gray-300' },
    { label: 'Geregistreerd',            value: users.length,          color: 'bg-[#4B519E]' },
    { label: 'Geactiveerd (≥1 contract)',value: activated.length,      color: 'bg-violet-500' },
    { label: 'Actief (30d)',              value: active30.length,       color: 'bg-violet-400' },
    { label: 'Plus-abonnee',             value: premium.length,        color: 'bg-emerald-500' },
  ];
  const funnelMax = funnel[0].value;

  const copyStats = [
    { key: 'wl',      label: 'Social proof wachtlijst', copy: `Meer dan ${243 + waitlist.length} mensen staan al op de Pactly wachtlijst` },
    { key: 'costs',   label: 'Maandlasten hook',        copy: `Nederlandse huishoudens besteden gemiddeld ${euros(avgCosts)} per maand aan contracten en abonnementen. Pactly houdt het bij.` },
    { key: 'contr',   label: 'Gebruik stat',            copy: `Pactly-gebruikers beheren gemiddeld ${avgContracts} contracten en ${avgAbos} abonnementen in één overzicht` },
    { key: 'conv',    label: 'Conversie proof',         copy: `${pct(premium.length, users.length)}% van Pactly-gebruikers kiest voor Plus — na het zelf ervaren van de waarde` },
    { key: 'save',    label: 'Verloophaak',             copy: `Gemiddeld ${(Number(avgAbos) * 1.8).toFixed(0)}% van abonnementen bij gebruikers dreigde automatisch te verlengen vóór Pactly` },
    { key: 'free',    label: 'Drempelvrij',             copy: `Pactly begint gratis. Geen creditcard nodig. Binnen 2 minuten heb je je eerste contract in beeld.` },
  ];

  return (
    <div className="space-y-6">
      <div>
        <SectionTitle icon="🎯" title="Conversiefunnel" sub="Van wachtlijst tot betalende klant" />
        <div className="bg-white border border-gray-100 rounded-xl p-6 space-y-3">
          {funnel.map((step, i) => {
            const convFromPrev = i > 0 ? pct(step.value, funnel[i-1].value) : 100;
            return (
              <div key={step.label}>
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <span className="text-[#181A2B] font-medium">{step.label}</span>
                  <div className="flex items-center gap-3">
                    {i > 0 && <span className="text-xs text-[#6B6A7A] font-mono">{convFromPrev}% van vorige stap</span>}
                    <span className="text-[#181A2B] font-bold font-mono w-8 text-right">{step.value}</span>
                  </div>
                </div>
                <div className="h-6 bg-gray-100 rounded-lg overflow-hidden">
                  <div className={`h-full ${step.color} rounded-lg flex items-center px-3 transition-all`} style={{ width: `${Math.max(pct(step.value, funnelMax), 4)}%` }}>
                    <span className="text-white text-xs font-bold">{pct(step.value, funnelMax)}%</span>
                  </div>
                </div>
              </div>
            );
          })}
          <div className="pt-2 border-t border-gray-100">
            <p className="text-xs text-[#6B6A7A]">
              Overall conversie wachtlijst → Plus: <span className="text-emerald-600 font-mono font-bold">{pct(premium.length, 243 + waitlist.length)}%</span>
              {' · '}Wachtlijst → actief gebruiker: <span className="text-[#4B519E] font-mono font-bold">{pct(activated.length, 243 + waitlist.length)}%</span>
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <SectionTitle icon="📊" title="Campagnecijfers" />
          <div className="grid grid-cols-2 gap-3">
            <KpiCard label="Wachtlijst" value={243 + waitlist.length} sub="unieke aanmeldingen" />
            <KpiCard label="Gebruikers" value={users.length} sub="geregistreerd" />
            <KpiCard label="Gem. maandlasten" value={euros(avgCosts)} sub="per huishouden getrackt" />
            <KpiCard label="Gem. contracten" value={avgContracts} sub={`+ ${avgAbos} abonnementen gem.`} />
          </div>
        </div>

        <div>
          <SectionTitle icon="📧" title="E-maildomein breakdown" sub="Indicatie van doelgroepbereik" />
          <div className="bg-white border border-gray-100 rounded-xl p-5 space-y-3">
            {domainList.map(([domain, count]) => (
              <div key={domain}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-[#181A2B] font-mono">{domain}</span>
                  <span className="text-[#6B6A7A]">{count} · {pct(count, users.length)}%</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${pct(count, users.length)}%`, background: '#4B519E' }} />
                </div>
              </div>
            ))}
            <p className="text-xs text-gray-400 pt-1">Gmail dominant → doelgroep actief op Google-producten. Kans: Google Ads + YouTube.</p>
          </div>
        </div>
      </div>

      <div>
        <SectionTitle icon="🔑" title="Feature gebruik: Free vs Plus" sub="Welke features drijven conversie?" />
        <div className="bg-white border border-gray-100 rounded-xl p-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-xs text-[#6B6A7A] font-mono uppercase tracking-wider mb-3">Free ({users.filter(u=>u.plan==='free').length} gebruikers)</p>
              <div className="space-y-3">
                {(['meldingen','abonnementen','kosten','tijdlijn'] as const).map(f => {
                  const freeUsers = users.filter(u => u.plan === 'free');
                  const used = freeUsers.filter(u => u.features[f]).length;
                  return <FeatureBar key={f} label={f.charAt(0).toUpperCase()+f.slice(1)} used={used} total={freeUsers.length} />;
                })}
              </div>
            </div>
            <div>
              <p className="text-xs text-emerald-600 font-mono uppercase tracking-wider mb-3">Plus ({premium.length} gebruikers)</p>
              <div className="space-y-3">
                {(['meldingen','abonnementen','kosten','tijdlijn'] as const).map(f => {
                  const used = premium.filter(u => u.features[f]).length;
                  return <FeatureBar key={f} label={f.charAt(0).toUpperCase()+f.slice(1)} used={used} total={premium.length} color="bg-emerald-500" />;
                })}
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-4 border-t border-gray-100 pt-3">💡 Hoge adoptie bij Plus-gebruikers = features die je actief moet promoten in onboarding en campagnes.</p>
        </div>
      </div>

      <div>
        <SectionTitle icon="📢" title="Campagneteksten — direct kopieerbaar" />
        <div className="bg-white border border-gray-100 rounded-xl p-6 space-y-3">
          {copyStats.map(s => (
            <div key={s.key} className="flex items-start justify-between gap-4 bg-gray-50 border border-gray-100 rounded-lg px-4 py-3">
              <div className="flex-1 min-w-0">
                <p className="text-xs text-[#4B519E] font-mono mb-0.5">{s.label}</p>
                <p className="text-[#181A2B] text-sm leading-relaxed">"{s.copy}"</p>
              </div>
              <button onClick={() => doCopy(s.key, s.copy)} className={`flex-shrink-0 px-3 py-1.5 text-xs rounded-lg font-semibold transition-colors ${copied === s.key ? 'bg-emerald-100 text-emerald-700' : 'bg-violet-50 hover:bg-violet-100 text-[#4B519E]'}`}>
                {copied === s.key ? '✓ Gekopieerd' : 'Kopieer'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── 6. Developer ─────────────────────────────────────────────────────────────

function DeveloperView({ users }: { users: AdminUser[] }) {
  const activated    = users.filter(u => u.contractCount > 0);
  const notActivated = users.filter(u => u.contractCount === 0);
  const power        = users.filter(u => u.contractCount >= 8);
  const regular      = users.filter(u => u.contractCount >= 3 && u.contractCount < 8);
  const light        = users.filter(u => u.contractCount >= 1 && u.contractCount < 3);

  const segments = [
    { label: 'Power users',   desc: '≥ 8 contracten', count: power.length,        color: 'bg-[#4B519E]', text: 'text-[#4B519E]',   plus: power.filter(u=>u.plan==='premium').length },
    { label: 'Regular users', desc: '3–7 contracten',  count: regular.length,      color: 'bg-blue-500',  text: 'text-blue-600',    plus: regular.filter(u=>u.plan==='premium').length },
    { label: 'Light users',   desc: '1–2 contracten',  count: light.length,        color: 'bg-teal-500',  text: 'text-teal-600',    plus: light.filter(u=>u.plan==='premium').length },
    { label: 'Niet actief',   desc: '0 contracten',    count: notActivated.length, color: 'bg-gray-300',  text: 'text-[#6B6A7A]',  plus: 0 },
  ];

  const featureUsed = {
    meldingen:    users.filter(u => u.features.meldingen).length,
    abonnementen: users.filter(u => u.features.abonnementen).length,
    kosten:       users.filter(u => u.features.kosten).length,
    tijdlijn:     users.filter(u => u.features.tijdlijn).length,
  };

  const quickWins = [
    { prio: '🔴 Kritiek', title: 'Onboarding-flow optimaliseren', detail: `${notActivated.length} gebruiker${notActivated.length!==1?'s':''} (${pct(notActivated.length, users.length)}%) heeft 0 contracten ingevoerd. Voeg een gefocuste 'voeg je eerste contract toe'-stap toe direct na registratie.`, effort: 'Hoog', impact: 'Hoog' },
    { prio: '🟠 Hoog',   title: 'Tijdlijn-discoverability verhogen', detail: `Tijdlijn heeft de laagste adoptie (${pct(featureUsed.tijdlijn, users.length)}%). Voeg een prominente entry point toe op het Dashboard of in de onboarding-flow.`, effort: 'Laag', impact: 'Midden' },
    { prio: '🟠 Hoog',   title: 'At-risk re-engagement automation', detail: `${users.filter(u=>daysSince(u.lastActiveAt)>30&&u.status==='active').length} actieve gebruikers niet gezien >30 dagen. Automatische e-mail met relevante contractverloopdatum als haak.`, effort: 'Midden', impact: 'Hoog' },
    { prio: '🟡 Midden', title: 'Light users upgraden naar Regular', detail: `${light.length} gebruikers met 1–2 contracten — ${pct(light.length, users.length)}% van de base. In-app prompt: "Je hebt nog ${Math.round(3-1.5)} contracten te tracken — zie je energiecontract staan?"`, effort: 'Laag', impact: 'Midden' },
    { prio: '🟡 Midden', title: 'Kosten-feature adoptie bij Free', detail: `${pct(users.filter(u=>u.plan==='free'&&u.features.kosten).length, users.filter(u=>u.plan==='free').length)}% van free users gebruikt Kosten. Laat een 'preview' van de kostengrafiek zien als upgrade-haak.`, effort: 'Laag', impact: 'Midden' },
    { prio: '🔵 Laag',   title: 'Power users als referral-kanaal activeren', detail: `${power.length} power users (≥8 contracten) — hoog engagement, hoge tevredenheid. Introducer een 'vertel een vriend' programma met kleine incentive.`, effort: 'Midden', impact: 'Laag' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <SectionTitle icon="🗂" title="Gebruikerssegmenten" sub="Verdeling op basis van platformgebruik" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {segments.map(s => (
            <div key={s.label} className="bg-white border border-gray-100 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-2 h-2 rounded-full ${s.color}`} />
                <span className={`text-xs font-semibold ${s.text}`}>{s.label}</span>
              </div>
              <p className="text-3xl font-extrabold text-[#181A2B]">{s.count}</p>
              <p className="text-xs text-[#6B6A7A] mt-1">{s.desc}</p>
              <p className="text-xs text-gray-400 mt-0.5">{pct(s.count, users.length)}% van totaal · {s.plus} Plus</p>
              <div className="mt-3 h-1 bg-gray-100 rounded-full overflow-hidden">
                <div className={`h-full ${s.color} rounded-full`} style={{ width: `${pct(s.count, users.length)}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <SectionTitle icon="📈" title="Platform health" />
          <div className="bg-white border border-gray-100 rounded-xl p-6 space-y-4">
            <FeatureBar label="Activeringsrate (≥1 contract)" used={activated.length} total={users.length} color="bg-emerald-500" />
            <FeatureBar label="DAU/MAU-proxy (30d actief)" used={users.filter(u=>daysSince(u.lastActiveAt)<=30).length} total={users.length} color="bg-blue-500" />
            <FeatureBar label="Plus-conversie" used={users.filter(u=>u.plan==='premium').length} total={users.length} />
            <FeatureBar label="Feature volledigheid (gem.)" used={Math.round(users.reduce((s,u)=>s+Object.values(u.features).filter(Boolean).length,0)/users.length)} total={4} color="bg-teal-500" />
          </div>
        </div>

        <div>
          <SectionTitle icon="🔧" title="Feature adoptie — detail" />
          <div className="bg-white border border-gray-100 rounded-xl p-6 space-y-4">
            {(['meldingen','abonnementen','kosten','tijdlijn'] as const).map(f => {
              const used = featureUsed[f];
              const plusUsed = users.filter(u=>u.plan==='premium'&&u.features[f]).length;
              return (
                <div key={f}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-[#181A2B]">{f.charAt(0).toUpperCase()+f.slice(1)}</span>
                    <span className="text-[#6B6A7A] font-mono">{used}/{users.length} · {pct(used,users.length)}% — Plus: {plusUsed}/{users.filter(u=>u.plan==='premium').length}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden flex">
                    <div className="h-full bg-[#4B519E] rounded-l" style={{ width: `${pct(used-plusUsed, users.length)}%` }} />
                    <div className="h-full bg-emerald-500" style={{ width: `${pct(plusUsed, users.length)}%` }} />
                  </div>
                  <div className="flex gap-3 mt-0.5">
                    <span className="text-[10px] text-[#4B519E]">■ Free: {used-plusUsed}</span>
                    <span className="text-[10px] text-emerald-600">■ Plus: {plusUsed}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div>
        <SectionTitle icon="⚡" title="Quick wins & product insights" sub="Op basis van gebruiksdata — gesorteerd op prioriteit" />
        <div className="space-y-3">
          {quickWins.map((w, i) => (
            <div key={i} className="bg-white border border-gray-100 rounded-xl p-5">
              <div className="flex items-start justify-between gap-4 mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm">{w.prio}</span>
                  <h4 className="text-[#181A2B] font-semibold text-sm">{w.title}</h4>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-mono ${w.effort==='Laag'?'bg-emerald-50 text-emerald-700':w.effort==='Midden'?'bg-amber-50 text-amber-700':'bg-red-50 text-red-600'}`}>Effort: {w.effort}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-mono ${w.impact==='Hoog'?'bg-emerald-50 text-emerald-700':w.impact==='Midden'?'bg-blue-50 text-blue-700':'bg-gray-100 text-gray-500'}`}>Impact: {w.impact}</span>
                </div>
              </div>
              <p className="text-[#6B6A7A] text-sm leading-relaxed">{w.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── 7. AVG & Privacy ────────────────────────────────────────────────────────

function AVGView() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="text-blue-800 font-bold mb-2 flex items-center gap-2">🔵 AVG / GDPR — Inzage als verwerkingsverantwoordelijke</h3>
        <p className="text-blue-700 text-sm leading-relaxed">Als eigenaar van Pactly ben je verwerkingsverantwoordelijke (art. 4 lid 7 AVG). Dit paneel toont alleen wat noodzakelijk is voor accountbeheer — dataminimalisatie conform art. 5.1.c.</p>
      </div>
      <div className="bg-white border border-gray-100 rounded-xl p-6 space-y-4">
        <h3 className="text-[#181A2B] font-bold flex items-center gap-2"><span className="text-emerald-600">✓</span> Wat je als admin wél mag zien</h3>
        {[
          { data: 'E-mailadres', basis: 'Art. 6.1.b — Uitvoering overeenkomst', why: 'Nodig voor inloggen, accountherstel en communicatie.' },
          { data: 'Registratie- en inlogdatum', basis: 'Art. 6.1.b / 6.1.f', why: 'Accountbeheer en veiligheid.' },
          { data: 'Betalingsstatus + methode', basis: 'Art. 6.1.b — Uitvoering overeenkomst', why: 'Nodig voor factuurverwerking. Geen volledige betaalgegevens.' },
          { data: 'Aantal contracten/abonnementen', basis: 'Art. 6.1.f — Gerechtvaardigd belang', why: 'Getal alleen voor productstatistieken. Geen inhoud zichtbaar.' },
          { data: 'Gem. maandlasten (getal)', basis: 'Art. 6.1.f — Gerechtvaardigd belang', why: 'Geaggregeerd voor product- en marktonderzoek.' },
          { data: 'Feature gebruik (ja/nee)', basis: 'Art. 6.1.f — Gerechtvaardigd belang', why: 'Productontwikkeling en support.' },
          { data: 'Wachtlijst e-mails', basis: 'Art. 6.1.a — Toestemming', why: 'Gebruiker heeft expliciet aangemeld (opt-in + checkbox).' },
        ].map(row => (
          <div key={row.data} className="grid gap-4 text-sm border-b border-gray-100 pb-3 last:border-0 last:pb-0" style={{ gridTemplateColumns: '170px 1fr' }}>
            <div><p className="text-[#181A2B] font-medium">{row.data}</p><p className="text-xs text-blue-600 font-mono mt-0.5">{row.basis}</p></div>
            <p className="text-[#6B6A7A] leading-relaxed">{row.why}</p>
          </div>
        ))}
      </div>
      <div className="bg-white border border-gray-100 rounded-xl p-6 space-y-3">
        <h3 className="text-[#181A2B] font-bold flex items-center gap-2"><span className="text-red-500">✗</span> Wat je als admin NIET mag inzien</h3>
        {[
          { data: 'Contractinhoud',      why: 'Namen, bedragen, looptijden — niet noodzakelijk voor beheer.' },
          { data: 'Notities & bijlagen', why: 'Vrije tekst en documenten zijn strikt privé.' },
          { data: 'Exacte navigatie',    why: 'Clickstreams zijn buitenproportioneel. Feature-gebruik (ja/nee) volstaat.' },
          { data: 'Wachtwoorden',        why: 'Altijd gehashed — nooit leesbaar.' },
          { data: 'Volledige betaalgegevens', why: 'Verlopen uitsluitend via de betaalprovider (Mollie/Stripe).' },
        ].map(row => (
          <div key={row.data} className="grid gap-4 text-sm border-b border-gray-100 pb-3 last:border-0 last:pb-0" style={{ gridTemplateColumns: '170px 1fr' }}>
            <p className="text-red-600 font-medium">{row.data}</p>
            <p className="text-[#6B6A7A] leading-relaxed">{row.why}</p>
          </div>
        ))}
      </div>
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
        <h3 className="text-amber-800 font-bold mb-3">📋 Nog te regelen vóór livegang</h3>
        <ul className="space-y-2.5 text-sm text-amber-700">
          {['Privacyverklaring publiceren op pactly.nl/privacy','Algemene voorwaarden publiceren (laten checken door jurist)','Cookiebot implementeren op pactly.nl','Verwerkersovereenkomst met hostingpartij en betaalprovider (Mollie/Stripe)','Data breach procedure inrichten (72 uur meldplicht bij AP)','Admin-authenticatie vervangen door OAuth/SSO','Revenue-tracking koppelen aan echte betaalprovider-data'].map(item => (
            <li key={item} className="flex items-start gap-2"><span className="text-amber-400 mt-0.5 flex-shrink-0">○</span><span>{item}</span></li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// ─── Login screen ─────────────────────────────────────────────────────────────

function LoginScreen({ onAuth }: { onAuth: () => void }) {
  const [pwd, setPwd]       = useState('');
  const [error, setError]   = useState(false);
  const [loading, setLoading] = useState(false);
  const submit = () => {
    if (!pwd) return; setLoading(true);
    setTimeout(() => {
      if (pwd === ADMIN_PASSWORD) { sessionStorage.setItem('pactly_admin', '1'); onAuth(); }
      else { setError(true); setLoading(false); setTimeout(() => setError(false), 2500); }
    }, 400);
  };
  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #181A2B 0%, #2D1B69 60%, #1A0E40 100%)' }}>
      <div className="bg-white rounded-2xl p-8 w-full max-w-sm space-y-6 shadow-2xl">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3">
          <svg width="52" height="60" viewBox="0 0 40 46" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="admin-login-grad" x1="0" y1="0" x2="40" y2="46" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#9098C8" />
                <stop offset="100%" stopColor="#4B519E" />
              </linearGradient>
            </defs>
            <polygon points="20,2 37.3,11.5 37.3,34.5 20,44 2.7,34.5 2.7,11.5" fill="url(#admin-login-grad)" />
            <path d="M 14 35 V 11 Q 27 11 27 18.5 Q 27 26 14 26" stroke="white" strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </svg>
          <div className="text-center">
            <h1 className="font-bold text-xl flex items-baseline justify-center gap-px">
              <span style={{ color: '#181A2B', letterSpacing: '-0.02em' }}>Pactly</span>
              <span style={{ color: '#FF6B7D' }}>.</span>
            </h1>
            <p className="text-[#6B6A7A] text-sm mt-0.5">Alleen voor bevoegde beheerders</p>
          </div>
        </div>
        <div className="space-y-3">
          <input type="password" value={pwd} onChange={e => { setPwd(e.target.value); setError(false); }} onKeyDown={e => e.key === 'Enter' && submit()} placeholder="Beheerderswachtwoord"
            className={`w-full px-4 py-3 bg-gray-50 border rounded-xl text-[#181A2B] placeholder-gray-400 focus:outline-none transition-colors text-sm ${error ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-[#4B519E]'}`} />
          {error && <p className="text-red-500 text-xs px-1">Onjuist wachtwoord — probeer opnieuw.</p>}
          <button onClick={submit} disabled={loading || !pwd} className="w-full py-3 font-bold rounded-xl transition-all text-white disabled:opacity-50" style={{ background: 'linear-gradient(135deg, #6B72B8 0%, #4B519E 100%)' }}>
            {loading ? 'Controleren…' : 'Inloggen'}
          </button>
        </div>
        <p className="text-center text-xs text-gray-400">Pactly Admin v2.0 · AVG-conform</p>
      </div>
    </div>
  );
}

// ─── Main AdminApp ────────────────────────────────────────────────────────────

export function AdminApp() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem('pactly_admin') === '1');
  const [view, setView]     = useState<View>('dashboard');
  const [users, setUsers]   = useState<AdminUser[]>(MOCK_USERS);

  const waitlist = useMemo<string[]>(() => { try { return JSON.parse(localStorage.getItem('pactly_wl') || '[]'); } catch { return []; } }, []);
  const updateStatus = (id: string, status: AdminUser['status']) => setUsers(prev => prev.map(u => u.id === id ? { ...u, status } : u));

  if (!authed) return <LoginScreen onAuth={() => setAuthed(true)} />;

  const premium  = users.filter(u => u.plan === 'premium');
  const mrr      = premium.reduce((s, u) => s + (!u.payment ? 0 : u.payment.cycle === 'maandelijks' ? 4.99 : 39/12), 0);
  const atRisk   = users.filter(u => daysSince(u.lastActiveAt) > 30 && u.status === 'active').length;
  const unreadWl = waitlist.length;

  const nav: { view: View; label: string; icon: string; badge?: string; role: string }[] = [
    { view: 'dashboard',  label: 'Dashboard',    icon: '📊', role: 'Eigenaar'   },
    { view: 'users',      label: 'Gebruikers',   icon: '👥', badge: atRisk > 0 ? `${atRisk}⚠️` : `${users.length}`, role: 'Support'    },
    { view: 'waitlist',   label: 'Wachtlijst',   icon: '📋', badge: unreadWl > 0 ? `${unreadWl}` : undefined,         role: 'Marketing'  },
    { view: 'financieel', label: 'Financieel',   icon: '💶', role: 'Controller' },
    { view: 'marketing',  label: 'Marketing',    icon: '📢', role: 'Marketeer'  },
    { view: 'developer',  label: 'Developer',    icon: '🛠', role: 'Developer'  },
    { view: 'avg',        label: 'AVG & Privacy', icon: '🔵', role: 'Eigenaar'  },
  ];

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: '#FAFAFC' }}>
      {/* Sidebar */}
      <aside className="w-60 bg-white border-r border-gray-200 flex flex-col flex-shrink-0">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <svg width="32" height="37" viewBox="0 0 40 46" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
              <defs>
                <linearGradient id="admin-sidebar-grad" x1="0" y1="0" x2="40" y2="46" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#9098C8" />
                  <stop offset="100%" stopColor="#4B519E" />
                </linearGradient>
              </defs>
              <polygon points="20,2 37.3,11.5 37.3,34.5 20,44 2.7,34.5 2.7,11.5" fill="url(#admin-sidebar-grad)" />
              <path d="M 14 35 V 11 Q 27 11 27 18.5 Q 27 26 14 26" stroke="white" strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </svg>
            <div>
              <p className="font-bold text-sm leading-tight flex items-baseline gap-px">
                <span style={{ color: '#181A2B', letterSpacing: '-0.02em' }}>Pactly</span>
                <span style={{ color: '#FF6B7D' }}>.</span>
              </p>
              <p className="text-[#6B6A7A] text-xs mt-0.5">Beheerpaneel v2.0</p>
            </div>
          </div>
        </div>

        {/* Quick revenue */}
        <div className="px-4 py-3 border-b border-gray-100 space-y-1">
          <p className="text-xs text-[#6B6A7A] font-mono">MRR · ARR</p>
          <p className="text-emerald-600 font-bold text-base">{euros(mrr)} <span className="text-[#6B6A7A] text-xs font-normal">/ {euros(mrr*12)}</span></p>
          <p className="text-xs text-gray-400">{premium.length} Plus-gebruikers · {users.length} totaal</p>
        </div>

        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {nav.map(item => {
            const active = view === item.view;
            return (
              <button key={item.view} onClick={() => setView(item.view)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all text-left ${active ? 'text-[#4B519E]' : 'text-[#6B6A7A] hover:text-[#181A2B] hover:bg-gray-50'}`}
                style={active ? { backgroundColor: 'rgba(75,81,158,0.08)' } : {}}>
                <span className="flex items-center gap-2.5">
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </span>
                <div className="flex items-center gap-1.5">
                  {item.badge && (
                    <span className={`text-xs font-mono px-1.5 py-0.5 rounded-full ${active ? 'bg-[#4B519E] text-white' : 'bg-gray-100 text-[#6B6A7A]'}`}>{item.badge}</span>
                  )}
                  <span className={`text-[9px] font-mono px-1 py-0.5 rounded ${active ? 'text-[#4B519E]/60' : 'text-gray-300'}`}>{item.role}</span>
                </div>
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-gray-100 space-y-1">
          <a href="/app.html" className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[#6B6A7A] hover:text-[#181A2B] transition-colors rounded-xl hover:bg-gray-50">← Terug naar platform</a>
          <button onClick={() => { sessionStorage.removeItem('pactly_admin'); setAuthed(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[#6B6A7A] hover:text-red-500 transition-colors rounded-xl hover:bg-red-50 text-left">⊗ Uitloggen</button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-extrabold text-[#181A2B] flex items-center gap-2">
                <span>{nav.find(n => n.view === view)?.icon}</span>
                <span>{nav.find(n => n.view === view)?.label}</span>
              </h1>
              <p className="text-xs text-[#6B6A7A] mt-0.5 font-mono">Perspectief: {nav.find(n => n.view === view)?.role}</p>
            </div>
            <p className="text-xs text-gray-400 font-mono">{TODAY.toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>

          {view === 'dashboard'  && <DashboardView   users={users} waitlist={waitlist} />}
          {view === 'users'      && <UsersView        users={users} onStatusChange={updateStatus} />}
          {view === 'waitlist'   && <WaitlistView     emails={waitlist} />}
          {view === 'financieel' && <FinancieelView   users={users} />}
          {view === 'marketing'  && <MarketingView    users={users} waitlist={waitlist} />}
          {view === 'developer'  && <DeveloperView    users={users} />}
          {view === 'avg'        && <AVGView />}
        </div>
      </main>
    </div>
  );
}
