import React from 'react';
import { AlertCircle, ArrowRight } from 'lucide-react';
import type { Contract } from '../../types';

interface UrgentBannerProps {
  contracts: Contract[];
  onViewUrgent: () => void;
}

export function UrgentBanner({ contracts, onViewUrgent }: UrgentBannerProps) {
  const n = contracts.filter(c => c.status === 'urgent' || c.status === 'evalueer').length;
  if (n === 0) return null;

  return (
    <div
      className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer group"
      style={{
        background: 'rgba(232, 53, 122, 0.08)',
        borderLeft: '3px solid #FF6B7D',
      }}
      onClick={onViewUrgent}
    >
      <AlertCircle size={18} className="text-coral flex-shrink-0" />
      <p className="text-sm text-dark flex-1">
        Je hebt <strong className="text-coral">{n} contract{n !== 1 ? 'en' : ''}</strong> die dringend aandacht nodig{n !== 1 ? ' hebben' : ' heeft'}.
      </p>
      <span className="text-xs font-semibold text-coral flex items-center gap-1 group-hover:gap-2 transition-all">
        Bekijk ze nu <ArrowRight size={13} />
      </span>
    </div>
  );
}
