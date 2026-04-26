import React, { useState } from 'react';
import type { Contract } from '../types';
import { Timeline } from '../components/timeline/Timeline';
import { ContractDetail } from '../components/contracts/ContractDetail';

interface TimelinePageProps {
  contracts: Contract[];
  onUpdate: (id: string, data: Partial<Contract>) => void;
  onDelete: (id: string) => void;
}

export function TimelinePage({ contracts, onUpdate, onDelete }: TimelinePageProps) {
  const [selected, setSelected] = useState<Contract | null>(null);

  if (selected) {
    return (
      <ContractDetail
        contract={selected}
        onBack={() => setSelected(null)}
        onUpdate={(id, data) => {
          onUpdate(id, data);
          setSelected(c => c ? { ...c, ...data } as Contract : null);
        }}
        onDelete={id => { onDelete(id); setSelected(null); }}
      />
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-5 pt-8 pb-5 border-b border-gray-100 flex-shrink-0">
        <h1 className="text-2xl font-extrabold text-dark">Tijdlijn</h1>
        <p className="text-mid text-sm mt-1">Meerjarig inzicht — van 1 tot 10 jaar vooruit plannen</p>
      </div>
      <div className="flex-1 overflow-hidden">
        <Timeline contracts={contracts} onSelect={setSelected} />
      </div>
    </div>
  );
}
