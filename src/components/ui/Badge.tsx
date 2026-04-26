import React from 'react';
import type { ContractStatus } from '../../types';
import { STATUS_META } from '../../types';

interface BadgeProps {
  status: ContractStatus;
  className?: string;
}

export function StatusBadge({ status, className = '' }: BadgeProps) {
  const meta = STATUS_META[status];
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold font-mono tracking-wide ${className}`}
      style={{ backgroundColor: meta.bg, color: meta.color }}
    >
      {meta.label}
    </span>
  );
}
