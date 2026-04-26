import React, { useState } from 'react';
import type { Contract, ContractCategory, ContractType, HouseholdMember } from '../../types';
import { CATEGORY_META, CONTRACT_TAGS } from '../../types';
import { Button } from '../ui/Button';
import { MemberPill } from '../ui/MemberPill';
import { toISODate } from '../../utils/dateHelpers';

type FormData = Omit<Contract, 'id' | 'status' | 'createdAt' | 'updatedAt'>;

interface ContractFormProps {
  initial?: Partial<FormData>;
  members?: HouseholdMember[];
  onSubmit: (data: FormData) => void;
  onCancel: () => void;
  submitLabel?: string;
}

const CATEGORIES = Object.entries(CATEGORY_META) as [ContractCategory, (typeof CATEGORY_META)[ContractCategory]][];

const defaultForm = (): FormData => ({
  type: 'contract',
  name: '',
  category: 'overig',
  provider: '',
  startDate: toISODate(new Date()),
  endDate: null,
  noticePeriodDays: 30,
  monthlyAmount: 0,
  notes: '',
  betaler: 'samen',
  beheerder: 'tom',
  docs: [],
  tags: [],
});

const inputClass =
  'w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm text-dark placeholder-mid/50 focus:outline-none focus:ring-2 focus:ring-violet/30 focus:border-violet transition-colors';

function Field({ label, required, error, children }: { label: string; required?: boolean; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-mid uppercase tracking-wide mb-1.5">
        {label}{required && <span className="text-coral ml-1">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-coral">{error}</p>}
    </div>
  );
}

export function ContractForm({ initial, members = [], onSubmit, onCancel, submitLabel = 'Opslaan' }: ContractFormProps) {
  const [form, setForm] = useState<FormData>(() => ({ ...defaultForm(), ...initial }));
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [doorlopend, setDoorlopend] = useState(!initial?.endDate);

  const set = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setForm(f => ({ ...f, [key]: value }));
    setErrors(e => ({ ...e, [key]: undefined }));
  };

  const validate = (): boolean => {
    const e: typeof errors = {};
    if (!form.name.trim())     e.name     = 'Naam is verplicht';
    if (!form.provider.trim()) e.provider = 'Aanbieder is verplicht';
    if (!form.startDate)       e.startDate = 'Startdatum is verplicht';
    if (!doorlopend) {
      if (!form.endDate)       e.endDate  = 'Einddatum is verplicht';
      if (form.endDate && form.startDate && form.endDate <= form.startDate) {
        e.endDate = 'Einddatum moet na startdatum liggen';
      }
    }
    if (form.monthlyAmount < 0) e.monthlyAmount = 'Voer een geldig bedrag in';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) onSubmit({ ...form, endDate: doorlopend ? null : form.endDate });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* Type */}
      <Field label="Type">
        <div className="flex gap-2">
          {(['contract', 'abonnement'] as ContractType[]).map(t => (
            <button
              key={t}
              type="button"
              onClick={() => set('type', t)}
              className={`flex-1 py-2 rounded-xl text-sm font-semibold border transition-all ${
                form.type === t ? 'border-violet bg-violet-light text-violet' : 'border-gray-200 text-mid hover:border-violet/40'
              }`}
            >
              {t === 'contract' ? '📄 Contract' : '📦 Abonnement'}
            </button>
          ))}
        </div>
      </Field>

      {/* Name */}
      <Field label="Naam" required error={errors.name}>
        <input className={inputClass} placeholder="bijv. Vattenfall Energie" value={form.name} onChange={e => set('name', e.target.value)} autoFocus />
      </Field>

      {/* Category grid */}
      <Field label="Categorie">
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {CATEGORIES.map(([key, meta]) => (
            <button
              key={key}
              type="button"
              onClick={() => set('category', key)}
              className={`flex flex-col items-center gap-1 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
                form.category === key ? 'border-violet bg-violet-light text-violet' : 'border-gray-200 text-mid hover:border-violet/40'
              }`}
            >
              <span className="text-base">{meta.icon}</span>{meta.label}
            </button>
          ))}
        </div>
      </Field>

      {/* Provider */}
      <Field label="Aanbieder" required error={errors.provider}>
        <input className={inputClass} placeholder="bijv. Vattenfall" value={form.provider} onChange={e => set('provider', e.target.value)} />
      </Field>

      {/* Dates */}
      <div className="grid grid-cols-2 gap-3">
        <Field label="Startdatum" required error={errors.startDate}>
          <input type="date" className={inputClass} value={form.startDate} onChange={e => set('startDate', e.target.value)} />
        </Field>
        <Field label="Einddatum" error={errors.endDate}>
          <div className="flex flex-col gap-1.5">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={doorlopend} onChange={e => setDoorlopend(e.target.checked)} className="accent-violet w-4 h-4" />
              <span className="text-xs text-mid">Doorlopend</span>
            </label>
            {!doorlopend && (
              <input type="date" className={inputClass} value={form.endDate ?? ''} onChange={e => set('endDate', e.target.value)} />
            )}
          </div>
        </Field>
      </div>

      {/* Notice + amount */}
      <div className="grid grid-cols-2 gap-3">
        <Field label="Opzegtermijn (dagen)">
          <input type="number" min={0} className={inputClass} value={form.noticePeriodDays} onChange={e => set('noticePeriodDays', parseInt(e.target.value) || 0)} />
        </Field>
        <Field label="Maandlast (€)" error={errors.monthlyAmount}>
          <input type="number" min={0} step={0.01} className={inputClass} placeholder="0,00" value={form.monthlyAmount || ''} onChange={e => set('monthlyAmount', parseFloat(e.target.value) || 0)} />
        </Field>
      </div>

      {/* Betaler / Beheerder */}
      {members.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          {(['betaler', 'beheerder'] as const).map(field => (
            <Field key={field} label={field === 'betaler' ? '💳 Betaler' : '👤 Beheerder'}>
              <div className="flex flex-wrap gap-1.5">
                {members.map(m => {
                  const sel = form[field] === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => set(field, m.id)}
                      className={`rounded-full transition-all ${sel ? 'opacity-100' : 'opacity-60 hover:opacity-90'}`}
                      style={sel ? { outline: `3px solid ${m.color}`, outlineOffset: '2px' } : {}}
                    >
                      <MemberPill member={m} size="sm" />
                    </button>
                  );
                })}
              </div>
            </Field>
          ))}
        </div>
      )}

      {/* Tags */}
      <Field label="Labels (optioneel)">
        <div className="flex flex-wrap gap-2">
          {CONTRACT_TAGS.map(tag => {
            const active = (form.tags ?? []).includes(tag.id);
            return (
              <button
                key={tag.id}
                type="button"
                onClick={() => {
                  const current = form.tags ?? [];
                  set('tags', active ? current.filter(t => t !== tag.id) : [...current, tag.id]);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                  active
                    ? 'text-white border-transparent'
                    : 'border-gray-200 text-mid hover:border-gray-300'
                }`}
                style={active ? { backgroundColor: tag.color, borderColor: tag.color } : {}}
              >
                <span>{tag.icon}</span>{tag.label}
              </button>
            );
          })}
        </div>
      </Field>

      {/* Notes */}
      <Field label="Notities (optioneel)">
        <textarea rows={3} className={`${inputClass} resize-none`} placeholder="Aantekeningen..." value={form.notes ?? ''} onChange={e => set('notes', e.target.value)} />
      </Field>

      <div className="flex gap-3 pt-2">
        <Button type="submit" fullWidth>{submitLabel}</Button>
        <Button type="button" variant="ghost" fullWidth onClick={onCancel}>Annuleren</Button>
      </div>
    </form>
  );
}
