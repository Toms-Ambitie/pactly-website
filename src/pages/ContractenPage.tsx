import React, { useState } from 'react';
import { Plus, Search, Upload, LayoutGrid, List } from 'lucide-react';
import type { Contract, ContractType, HouseholdMember } from '../types';
import { CATEGORY_META } from '../types';
import { ContractCard } from '../components/contracts/ContractCard';
import { ContractForm } from '../components/contracts/ContractForm';
import { ContractDetail } from '../components/contracts/ContractDetail';
import { Modal } from '../components/ui/Modal';
import { UploadModal } from '../components/ui/UploadModal';
import { MemberPill } from '../components/ui/MemberPill';
import { formatEuro } from '../utils/dateHelpers';
import { sortByUrgency } from '../utils/contractStatus';

interface ContractenPageProps {
  typeFilter: ContractType;
  contracts: Contract[];
  members: HouseholdMember[];
  onAdd: (data: Omit<Contract, 'id' | 'status' | 'createdAt' | 'updatedAt'>) => void;
  onUpdate: (id: string, data: Partial<Contract>) => void;
  onDelete: (id: string) => void;
  /** When this number increments, automatically open the upload modal */
  uploadTrigger?: number;
  /** When this number increments, automatically open the add form */
  addTrigger?: number;
}

export function ContractenPage({ typeFilter, contracts, members, onAdd, onUpdate, onDelete, uploadTrigger, addTrigger }: ContractenPageProps) {
  const [query, setQuery]           = useState('');
  const [catFilter, setCatFilter]   = useState('alle');
  const [memberFilter, setMemberFilter] = useState('alle');
  const [selected, setSelected]     = useState<Contract | null>(null);
  const [showAdd, setShowAdd]       = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [viewMode, setViewMode]     = useState<'grid' | 'list'>('grid');

  // Open modals when triggered from outside (e.g. sidebar buttons)
  React.useEffect(() => { if (uploadTrigger) setShowUpload(true); }, [uploadTrigger]);
  React.useEffect(() => { if (addTrigger) setShowAdd(true); }, [addTrigger]);

  const isAbo = typeFilter === 'abonnement';

  // Filter by type first
  const typed = contracts.filter(c => c.type === typeFilter);

  // Build category list from actual contracts
  const categories = ['alle', ...Array.from(new Set(typed.map(c => c.category)))];

  // Apply filters
  const filtered = typed.filter(c => {
    const matchCat    = catFilter === 'alle' || c.category === catFilter;
    const matchMember = memberFilter === 'alle' || c.betaler === memberFilter || c.beheerder === memberFilter;
    const matchQuery  = !query.trim() ||
      c.name.toLowerCase().includes(query.toLowerCase()) ||
      c.provider.toLowerCase().includes(query.toLowerCase());
    return matchCat && matchMember && matchQuery;
  });

  const sorted = sortByUrgency(filtered);
  const totalMonthly = filtered.reduce((s, c) => s + c.monthlyAmount, 0);

  // Detail view
  if (selected) {
    return (
      <ContractDetail
        contract={selected}
        members={members}
        onBack={() => setSelected(null)}
        onUpdate={(id, data) => {
          onUpdate(id, data);
          setSelected(c => c ? { ...c, ...data } as Contract : null);
        }}
        onDelete={id => {
          onDelete(id);
          setSelected(null);
        }}
      />
    );
  }

  return (
    <div className="h-full overflow-y-auto pb-20 sm:pb-6">
      {/* Header */}
      <div
        className="px-4 sm:px-5 pt-6 sm:pt-8 pb-5 sm:pb-6 relative overflow-hidden border-b border-gray-100"
        style={{ background: isAbo ? 'linear-gradient(160deg, #FFF0F6 0%, #FDF9FF 100%)' : 'linear-gradient(160deg, #F4F0FF 0%, #FBF9FF 100%)' }}
      >
        <div
          className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-25 -translate-y-1/4 translate-x-1/4"
          style={{ background: isAbo ? 'radial-gradient(circle, #E8357A, transparent)' : 'radial-gradient(circle, #5B3FE8, transparent)' }}
        />
        <div className="relative z-10 flex items-end justify-between mb-4">
          <div>
            <h1 className="text-2xl font-extrabold text-dark mb-1">
              {isAbo ? '📦 Abonnementen' : '📄 Contracten'}
            </h1>
            <p className="text-mid text-sm">
              {isAbo ? 'Doorlopende diensten & lidmaatschappen' : 'Formele overeenkomsten & langlopende contracten'}
              {typed.length > 0 && <> · <span className="text-dark font-semibold">{formatEuro(typed.reduce((s, c) => s + c.monthlyAmount, 0))}/mnd</span></>}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-mid font-mono text-sm font-bold mr-1">{typed.length}</span>
            {/* View toggle */}
            <div className="flex bg-white border border-gray-200 rounded-xl p-0.5 shadow-sm">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-violet text-white shadow-sm' : 'text-mid hover:text-dark'}`}
                title="Tegelweergave"
              >
                <LayoutGrid size={15} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-violet text-white shadow-sm' : 'text-mid hover:text-dark'}`}
                title="Lijstweergave"
              >
                <List size={15} />
              </button>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative z-10">
          <div className="relative">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-mid/50" />
            <input
              type="text"
              placeholder="Zoeken op naam of aanbieder..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white border border-gray-200 text-dark placeholder-mid/50 text-sm focus:outline-none focus:ring-2 focus:ring-violet/20 focus:border-violet transition-all shadow-sm"
            />
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-5 pt-4 flex flex-col gap-3 sm:gap-4">
        {/* Category chips */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {categories.map(cat => {
            const meta = cat !== 'alle' ? CATEGORY_META[cat as keyof typeof CATEGORY_META] : null;
            return (
              <button
                key={cat}
                onClick={() => setCatFilter(cat)}
                className={[
                  'px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap flex-shrink-0 flex items-center gap-1.5 transition-all',
                  catFilter === cat
                    ? 'bg-violet text-white shadow-sm'
                    : 'bg-white text-mid border border-gray-200 hover:border-violet/40',
                ].join(' ')}
              >
                {meta && <span>{meta.icon}</span>}
                {cat === 'alle' ? 'Alle categorieën' : meta?.label ?? cat}
              </button>
            );
          })}
        </div>

        {/* Member filter chips */}
        {members.length > 0 && (
          <div className="flex gap-2 overflow-x-auto">
            <button
              onClick={() => setMemberFilter('alle')}
              className={[
                'px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap flex-shrink-0 transition-all',
                memberFilter === 'alle'
                  ? 'bg-dark/90 text-white'
                  : 'bg-white text-mid border border-gray-200 hover:border-gray-400',
              ].join(' ')}
            >
              Iedereen
            </button>
            {members.map(m => (
              <button
                key={m.id}
                onClick={() => setMemberFilter(m.id)}
                className={`flex-shrink-0 transition-all rounded-full ${memberFilter === m.id ? 'opacity-100' : 'opacity-60 hover:opacity-90'}`}
                style={memberFilter === m.id ? { outline: `2px solid ${m.color}`, outlineOffset: '2px' } : {}}
              >
                <MemberPill member={m} size="sm" />
              </button>
            ))}
          </div>
        )}

        {/* Totals bar */}
        {filtered.length > 0 && (
          <div className="flex items-center justify-between text-xs text-mid font-mono">
            <span>{filtered.length} van {typed.length}</span>
            <span className="font-bold text-dark">{formatEuro(totalMonthly)}/mnd</span>
          </div>
        )}

        {/* Cards */}
        {sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="text-5xl">{isAbo ? '📦' : '📄'}</div>
            <p className="text-dark font-bold">
              {typed.length === 0
                ? `Nog geen ${isAbo ? 'abonnementen' : 'contracten'}`
                : 'Geen resultaten gevonden'}
            </p>
            <p className="text-mid text-sm text-center max-w-xs">
              {typed.length === 0
                ? `Voeg je eerste ${isAbo ? 'abonnement' : 'contract'} toe om te beginnen.`
                : 'Pas je zoekopdracht of filter aan.'}
            </p>
            {typed.length === 0 && (
              <button
                onClick={() => setShowAdd(true)}
                className="mt-2 px-5 py-2.5 rounded-xl bg-pactly-gradient text-white text-sm font-semibold hover:opacity-90 transition-all"
              >
                {isAbo ? 'Abonnement toevoegen' : 'Contract toevoegen'}
              </button>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sorted.map(c => (
              <ContractCard
                key={c.id}
                contract={c}
                members={members}
                onClick={() => setSelected(c)}
                view="grid"
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            {sorted.map(c => (
              <ContractCard
                key={c.id}
                contract={c}
                members={members}
                onClick={() => setSelected(c)}
                view="list"
              />
            ))}
          </div>
        )}
      </div>

      {/* FABs */}
      <button
        onClick={() => setShowUpload(true)}
        className="fixed bottom-36 right-5 sm:bottom-20 sm:right-6 w-12 h-12 rounded-full bg-white border border-gray-200 text-mid shadow-md flex items-center justify-center hover:border-violet/40 hover:text-violet active:scale-95 transition-all z-30"
        title="Document uploaden"
      >
        <Upload size={20} />
      </button>
      <button
        onClick={() => setShowAdd(true)}
        className="fixed bottom-20 right-5 sm:bottom-6 sm:right-6 w-14 h-14 rounded-full bg-pactly-gradient text-white shadow-lg flex items-center justify-center hover:opacity-90 active:scale-95 transition-all z-30"
        title={isAbo ? 'Abonnement toevoegen' : 'Contract toevoegen'}
      >
        <Plus size={24} />
      </button>

      {/* Add modal */}
      {showAdd && (
        <Modal
          title={isAbo ? 'Abonnement toevoegen' : 'Contract toevoegen'}
          onClose={() => setShowAdd(false)}
          size="lg"
        >
          <ContractForm
            initial={{ type: typeFilter }}
            members={members}
            onSubmit={data => { onAdd(data); setShowAdd(false); }}
            onCancel={() => setShowAdd(false)}
            submitLabel={isAbo ? 'Abonnement toevoegen' : 'Contract toevoegen'}
          />
        </Modal>
      )}

      {/* Upload modal */}
      {showUpload && (
        <UploadModal
          onAdd={data => { onAdd(data); }}
          onClose={() => setShowUpload(false)}
        />
      )}
    </div>
  );
}
