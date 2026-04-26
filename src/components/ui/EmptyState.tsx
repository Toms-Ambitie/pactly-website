import React from 'react';
import { Button } from './Button';

interface EmptyStateProps {
  onAdd: () => void;
}

export function EmptyState({ onAdd }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      {/* Simple SVG illustration */}
      <svg width="120" height="100" viewBox="0 0 120 100" fill="none" className="mb-6 opacity-60">
        <rect x="20" y="20" width="80" height="60" rx="8" fill="#F4F0FF" stroke="#5B3FE8" strokeWidth="2"/>
        <rect x="32" y="34" width="40" height="4" rx="2" fill="#5B3FE8" opacity="0.4"/>
        <rect x="32" y="44" width="56" height="4" rx="2" fill="#5B3FE8" opacity="0.25"/>
        <rect x="32" y="54" width="48" height="4" rx="2" fill="#5B3FE8" opacity="0.2"/>
        <circle cx="90" cy="72" r="18" fill="#5B3FE8"/>
        <line x1="90" y1="65" x2="90" y2="79" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
        <line x1="83" y1="72" x2="97" y2="72" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
      </svg>

      <h3 className="text-xl font-bold text-dark mb-2">
        Je hebt nog geen contracten toegevoegd.
      </h3>
      <p className="text-mid text-sm mb-8 max-w-xs">
        Voeg je eerste contract toe en behoud altijd het overzicht. Nooit meer een opzegtermijn missen.
      </p>
      <Button onClick={onAdd} size="lg">
        Contract toevoegen →
      </Button>
    </div>
  );
}
