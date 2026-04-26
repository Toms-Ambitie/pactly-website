import React, { useState } from 'react';
import { ArrowLeft, Edit2, Trash2, Bell, RefreshCw, LogOut, Calendar, FileText, TrendingUp, Download, Sparkles } from 'lucide-react';
import type { Contract, HouseholdMember } from '../../types';
import { CATEGORY_META, STATUS_META, CONTRACT_TAGS } from '../../types';
import { StatusBadge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { MemberPill } from '../ui/MemberPill';
import { ContractForm } from './ContractForm';
import { AIChat } from './AIChat';
import { formatDate, formatEuro } from '../../utils/dateHelpers';
import { daysUntilEnd, contractProgress } from '../../utils/contractStatus';
import { fileOpen } from '../../utils/storage';

interface ContractDetailProps {
  contract: Contract;
  members?: HouseholdMember[];
  onBack: () => void;
  onUpdate: (id: string, data: Partial<Contract>) => void;
  onDelete: (id: string) => void;
}

function KVRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between items-start py-3 border-b border-gray-50 last:border-0 gap-3">
      <span className="text-sm text-mid font-medium flex-shrink-0">{label}</span>
      <span className="text-sm font-semibold text-dark text-right">{value}</span>
    </div>
  );
}

export function ContractDetail({ contract, members = [], onBack, onUpdate, onDelete }: ContractDetailProps) {
  const [showEdit, setShowEdit]     = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const catMeta  = CATEGORY_META[contract.category];
  const statMeta = STATUS_META[contract.status];
  const progress = contractProgress(contract.startDate, contract.endDate);
  const daysLeft = daysUntilEnd(contract.endDate);
  const isDoorlopend = contract.endDate === null;

  const betaler   = members.find(m => m.id === contract.betaler);
  const beheerder = members.find(m => m.id === contract.beheerder);

  const noticeDeadlineStr: string | null = (() => {
    if (isDoorlopend || !contract.endDate) return null;
    const d = new Date(contract.endDate);
    d.setDate(d.getDate() - contract.noticePeriodDays);
    return d.toISOString();
  })();

  const handleUpdate = (data: Omit<Contract, 'id' | 'status' | 'createdAt' | 'updatedAt'>) => {
    onUpdate(contract.id, data);
    setShowEdit(false);
  };

  const handleDelete = () => {
    onDelete(contract.id);
  };

  const handleOpenDoc = async (docStr: string) => {
    if (docStr.includes('||')) {
      const [, key] = docStr.split('||');
      await fileOpen(key);
    }
  };

  const barColor = statMeta.barColor === '#F7FF5C' ? '#6B6B8A' : statMeta.barColor;

  return (
    <>
      <div className="flex-1 overflow-y-auto bg-light">

        {/* ── Full-width header ─────────────────────────────────────────── */}
        <div
          className="px-5 sm:px-8 pt-5 pb-6 border-b border-gray-100"
          style={{ background: `linear-gradient(160deg, ${catMeta.color}10 0%, #FAFAFE 100%)` }}
        >
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-mid hover:text-dark text-sm mb-5 transition-colors"
          >
            <ArrowLeft size={16} /> Terug
          </button>

          <div className="flex items-center gap-5">
            {/* Big icon */}
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0 shadow-sm"
              style={{ backgroundColor: catMeta.color + '20', border: `1.5px solid ${catMeta.color}30` }}
            >
              {catMeta.icon}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <StatusBadge status={contract.status} />
                {contract.tags?.slice(0, 2).map(tagId => {
                  const meta = CONTRACT_TAGS.find(t => t.id === tagId);
                  if (!meta) return null;
                  return (
                    <span key={tagId} className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-semibold text-white" style={{ backgroundColor: meta.color }}>
                      {meta.icon} {meta.label}
                    </span>
                  );
                })}
              </div>
              <h1 className="text-2xl font-extrabold text-dark leading-tight">{contract.name}</h1>
              <p className="text-mid text-sm font-mono mt-0.5">{contract.provider}</p>
            </div>

            {/* Cost — right side */}
            <div className="text-right hidden sm:block flex-shrink-0">
              <div className="text-3xl font-extrabold text-dark tracking-tight">{formatEuro(contract.monthlyAmount)}</div>
              <div className="text-mid text-sm mt-0.5">/maand · {formatEuro(contract.monthlyAmount * 12)}/jaar</div>
            </div>
          </div>

          {/* Cost on mobile */}
          <div className="sm:hidden mt-4">
            <span className="text-2xl font-extrabold text-dark">{formatEuro(contract.monthlyAmount)}</span>
            <span className="text-mid text-sm ml-1">/maand</span>
          </div>

          {/* Progress bar */}
          <div className="mt-5">
            <div className="flex justify-between text-xs font-mono text-mid mb-1.5">
              <span>{formatDate(contract.startDate)}</span>
              <span>{isDoorlopend ? 'Doorlopend' : formatDate(contract.endDate)}</span>
            </div>
            <div className="h-2 bg-white/70 rounded-full overflow-hidden border border-gray-100">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: isDoorlopend ? '100%' : `${Math.min(progress * 100, 100)}%`,
                  backgroundColor: statMeta.barColor,
                }}
              />
            </div>
            <div className="flex justify-between items-center mt-1.5">
              <span className="text-xs text-mid">
                {isDoorlopend ? 'Actief — geen einddatum' : `${Math.round(progress * 100)}% van looptijd verstreken`}
              </span>
              <span className="text-xs font-bold font-mono" style={{ color: barColor }}>
                {isDoorlopend ? 'Doorlopend' : contract.status === 'verlopen' ? 'Verlopen' : `Nog ${daysLeft} dag${daysLeft !== 1 ? 'en' : ''}`}
              </span>
            </div>
            {contract.noticePeriodDays > 0 && noticeDeadlineStr && (
              <div className="mt-2.5 flex items-center gap-2 text-xs text-mid bg-white/60 rounded-xl px-3 py-2 border border-gray-100 w-fit">
                <Bell size={12} className="text-coral flex-shrink-0" />
                Opzegtermijn {contract.noticePeriodDays} dagen — uiterlijk vóór{' '}
                <strong className="text-dark">{formatDate(noticeDeadlineStr)}</strong>
              </div>
            )}
          </div>
        </div>

        {/* ── 2-column body ─────────────────────────────────────────────── */}
        <div className="flex flex-col lg:flex-row gap-0 lg:gap-5 lg:px-8 lg:py-6 p-4 sm:p-5">

          {/* ── LEFT COLUMN: key info ──────────────────────────────────── */}
          <div className="flex flex-col gap-4 lg:w-80 xl:w-96 flex-shrink-0">

            {/* Key details card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h2 className="text-xs font-bold text-mid uppercase tracking-wider mb-3">Details</h2>
              <KVRow label="Startdatum" value={formatDate(contract.startDate)} />
              <KVRow label="Einddatum" value={isDoorlopend ? 'Doorlopend' : formatDate(contract.endDate)} />
              <KVRow label="Opzegtermijn" value={`${contract.noticePeriodDays} dagen`} />
              {(betaler || beheerder) && (
                <KVRow
                  label="Betaler / Beheerder"
                  value={
                    <div className="flex flex-wrap gap-1.5 justify-end">
                      {betaler  && <MemberPill member={betaler}  role="betaler"   size="sm" />}
                      {beheerder && beheerder.id !== betaler?.id && (
                        <MemberPill member={beheerder} role="beheerder" size="sm" />
                      )}
                    </div>
                  }
                />
              )}
              {contract.notes && (
                <div className="pt-3 border-t border-gray-50 mt-1">
                  <div className="text-xs text-mid font-semibold uppercase tracking-wide mb-1.5">Notities</div>
                  <p className="text-sm text-dark leading-relaxed whitespace-pre-wrap">{contract.notes}</p>
                </div>
              )}
            </div>

            {/* Documents */}
            {contract.docs && contract.docs.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h2 className="text-xs font-bold text-mid uppercase tracking-wider mb-3">Documenten</h2>
                <div className="flex flex-col gap-2">
                  {contract.docs.map((doc, i) => {
                    const name = doc.includes('||') ? doc.split('||')[0] : doc;
                    const hasFile = doc.includes('||');
                    return (
                      <div
                        key={i}
                        onClick={() => hasFile && handleOpenDoc(doc)}
                        className={`flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100 ${hasFile ? 'cursor-pointer hover:bg-violet/5 hover:border-violet/20 transition-all' : ''}`}
                      >
                        <div className="w-8 h-8 rounded-lg bg-violet-light flex items-center justify-center flex-shrink-0">
                          <FileText size={14} className="text-violet" />
                        </div>
                        <span className="flex-1 text-sm font-medium text-dark truncate">{name}</span>
                        {hasFile && <Download size={14} className="text-violet/60 flex-shrink-0" />}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h2 className="text-xs font-bold text-mid uppercase tracking-wider mb-3">Acties</h2>
              <div className="flex flex-col gap-2">
                <Button variant="secondary" fullWidth onClick={() => setShowEdit(true)}>
                  <Edit2 size={14} /> Bewerken
                </Button>
                <Button variant="ghost" fullWidth>
                  <RefreshCw size={14} /> Verlengen
                </Button>
                <Button variant="ghost" fullWidth className="text-mid">
                  <LogOut size={14} /> Opzeggen
                </Button>
                <Button
                  variant="ghost"
                  fullWidth
                  className="text-coral hover:bg-coral/8"
                  onClick={() => setShowDelete(true)}
                >
                  <Trash2 size={14} /> Verwijderen
                </Button>
              </div>
            </div>
          </div>

          {/* ── RIGHT COLUMN: AI chat + summary ───────────────────────── */}
          <div className="flex-1 min-w-0 flex flex-col gap-4 mt-4 lg:mt-0">

            {/* AI summary banner */}
            <div
              className="rounded-2xl border p-4 sm:p-5"
              style={{
                background: `linear-gradient(135deg, ${catMeta.color}06 0%, rgba(91,63,232,0.04) 100%)`,
                borderColor: `${catMeta.color}20`,
              }}
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-pactly-gradient flex items-center justify-center flex-shrink-0">
                  <Sparkles size={13} className="text-white" />
                </div>
                <span
                  className="text-xs font-extrabold uppercase tracking-wider"
                  style={{ color: catMeta.color }}
                >
                  AI Samenvatting
                </span>
              </div>
              <p className="text-sm text-dark leading-relaxed">
                {contract.notes
                  ? contract.notes
                  : `Dit is een ${catMeta.label.toLowerCase()} bij ${contract.provider}. ${!isDoorlopend ? `Het contract loopt tot ${formatDate(contract.endDate)}` : 'Het contract is doorlopend'} en kost ${formatEuro(contract.monthlyAmount)} per maand (${formatEuro(contract.monthlyAmount * 12)} per jaar). ${contract.noticePeriodDays > 0 ? `De opzegtermijn is ${contract.noticePeriodDays} dagen.` : ''}`
                }
              </p>
            </div>

            {/* AI chat */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex-1 overflow-hidden flex flex-col">
              <div className="flex items-center gap-2.5 px-5 py-4 border-b border-gray-50">
                <div className="w-8 h-8 rounded-lg bg-pactly-gradient flex items-center justify-center">
                  <Sparkles size={14} className="text-white" />
                </div>
                <div>
                  <div className="text-sm font-bold text-dark">AI Assistent</div>
                  <div className="text-xs text-mid">Stel vragen over dit contract</div>
                </div>
              </div>
              <div className="flex-1 overflow-hidden px-4 py-3" style={{ minHeight: 300 }}>
                <AIChat contract={contract} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit modal */}
      {showEdit && (
        <Modal title="Contract bewerken" onClose={() => setShowEdit(false)} size="lg">
          <ContractForm
            initial={contract}
            members={members}
            onSubmit={handleUpdate}
            onCancel={() => setShowEdit(false)}
            submitLabel="Wijzigingen opslaan"
          />
        </Modal>
      )}

      {/* Delete confirm */}
      {showDelete && (
        <ConfirmDialog
          title="Contract verwijderen"
          message={`Weet je zeker dat je "${contract.name}" wilt verwijderen? Dit kan niet ongedaan worden gemaakt.`}
          confirmLabel="Ja, verwijderen"
          onConfirm={handleDelete}
          onCancel={() => setShowDelete(false)}
        />
      )}
    </>
  );
}
