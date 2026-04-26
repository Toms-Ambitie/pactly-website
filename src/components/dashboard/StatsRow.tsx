import React from 'react';
import { FileText, AlertTriangle, Euro } from 'lucide-react';
import type { Contract } from '../../types';
import { formatEuro } from '../../utils/dateHelpers';

interface StatsRowProps {
  contracts: Contract[];
}

export function StatsRow({ contracts }: StatsRowProps) {
  const active  = contracts.filter(c => c.status !== 'verlopen').length;
  const urgent  = contracts.filter(c => c.status === 'urgent' || c.status === 'evalueer').length;
  const monthly = contracts.filter(c => c.status !== 'verlopen').reduce((s, c) => s + c.monthlyAmount, 0);

  return (
    <div className="grid grid-cols-3 gap-2.5">
      <StatCard
        icon={<FileText size={15} className="text-violet" />}
        value={String(active)}
        label="Actief"
        bg="rgba(91,63,232,0.08)"
      />
      <StatCard
        icon={<AlertTriangle size={15} className={urgent > 0 ? 'text-coral' : 'text-gray-400'} />}
        value={String(urgent)}
        label="Actie vereist"
        accent={urgent > 0}
        bg={urgent > 0 ? 'rgba(232,53,122,0.08)' : 'rgba(0,0,0,0.04)'}
      />
      <StatCard
        icon={<Euro size={15} className="text-violet" />}
        value={formatEuro(monthly)}
        label="/mnd"
        small
        bg="rgba(91,63,232,0.08)"
      />
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  value: string;
  label: string;
  accent?: boolean;
  small?: boolean;
  bg?: string;
}

function StatCard({ icon, value, label, accent, small, bg }: StatCardProps) {
  return (
    <div
      className="rounded-2xl px-3 py-3 border border-white/60"
      style={{ background: bg || 'rgba(91,63,232,0.08)' }}
    >
      <div className="flex items-center gap-1.5 mb-1.5">{icon}</div>
      <div className={`font-extrabold leading-none ${small ? 'text-sm' : 'text-2xl'} ${accent ? 'text-coral' : 'text-dark'}`}>
        {value}
      </div>
      <div className="text-mid/70 text-xs mt-1 font-mono">{label}</div>
    </div>
  );
}
