import React, { useState } from 'react';
import { Download, Trash2, Plus, X, Bell } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import type { AppSettings, Contract } from '../types';
import { Button } from '../components/ui/Button';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { clearAllData } from '../utils/storage';

const MEMBER_COLORS = ['#5B3FE8', '#E8357A', '#FF7A35', '#10B981', '#0EA5E9', '#F59E0B', '#7C3AED'];

interface SettingsProps {
  settings: AppSettings;
  contracts: Contract[];
  onUpdateSettings: (s: Partial<AppSettings>) => void;
}

interface FieldProps {
  label: string;
  children: React.ReactNode;
}
function Field({ label, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-mid uppercase tracking-wide">{label}</label>
      {children}
    </div>
  );
}

const inputClass = 'w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm text-dark focus:outline-none focus:ring-2 focus:ring-violet/30 focus:border-violet transition-colors';

export function Settings({ settings, contracts, onUpdateSettings }: SettingsProps) {
  const [name, setName]             = useState(settings.userName);
  const [newMember, setNewMember]   = useState('');
  const [showClear, setShowClear]   = useState(false);
  const [saved, setSaved]           = useState(false);

  const saveName = () => {
    onUpdateSettings({ userName: name });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const addMember = () => {
    if (!newMember.trim()) return;
    const trimmed = newMember.trim();
    const color   = MEMBER_COLORS[settings.householdMembers.length % MEMBER_COLORS.length];
    const initials = trimmed.slice(0, 2).toUpperCase();
    onUpdateSettings({
      householdMembers: [...settings.householdMembers, {
        id: uuidv4(),
        name: trimmed,
        color,
        initials,
      }],
    });
    setNewMember('');
  };

  const removeMember = (idx: number) => {
    onUpdateSettings({
      householdMembers: settings.householdMembers.filter((_, i) => i !== idx),
    });
  };

  const exportData = () => {
    const blob = new Blob([JSON.stringify({ contracts, settings }, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `pactly-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearData = () => {
    clearAllData();
    window.location.reload();
  };

  const totalMonthly = contracts
    .filter(c => c.status !== 'verlopen')
    .reduce((s, c) => s + c.monthlyAmount, 0);

  return (
    <div className="h-full overflow-y-auto pb-20 sm:pb-6">
      {/* Header */}
      <div className="px-5 pt-8 pb-5 border-b border-gray-100">
        <h1 className="text-2xl font-extrabold text-dark">Instellingen</h1>
        <p className="text-mid text-sm mt-1">Beheer je account en voorkeuren</p>
      </div>

      <div className="px-5 py-5 flex flex-col gap-6 max-w-lg">

        {/* Summary */}
        <div className="bg-violet-light rounded-2xl p-4">
          <div className="text-xs font-semibold text-mid uppercase tracking-wide mb-3">Overzicht</div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-2xl font-extrabold text-violet">{contracts.length}</div>
              <div className="text-xs text-mid mt-0.5">contracten</div>
            </div>
            <div>
              <div className="text-2xl font-extrabold text-violet">
                {new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(totalMonthly)}
              </div>
              <div className="text-xs text-mid mt-0.5">per maand</div>
            </div>
          </div>
        </div>

        {/* Name */}
        <section className="bg-white rounded-2xl p-5 border border-gray-100">
          <h2 className="font-bold text-dark mb-4">Profiel</h2>
          <Field label="Jouw naam">
            <div className="flex gap-2">
              <input
                className={inputClass}
                placeholder="bijv. Tom"
                value={name}
                onChange={e => setName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && saveName()}
              />
              <Button size="sm" onClick={saveName}>
                {saved ? '✓' : 'Opslaan'}
              </Button>
            </div>
          </Field>
        </section>

        {/* Household members */}
        <section className="bg-white rounded-2xl p-5 border border-gray-100">
          <h2 className="font-bold text-dark mb-4">Huishoudleden</h2>
          <div className="flex flex-col gap-2 mb-3">
            {settings.householdMembers.length === 0 && (
              <p className="text-sm text-mid">Nog geen leden toegevoegd.</p>
            )}
            {settings.householdMembers.map((m, i) => (
              <div key={i} className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-2.5">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                  style={{ background: m.color }}
                >
                  {m.name.slice(0, 2).toUpperCase()}
                </div>
                <span className="text-sm font-semibold text-dark flex-1">{m.name}</span>
                <button onClick={() => removeMember(i)} className="text-mid hover:text-coral transition-colors">
                  <X size={15} />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              className={inputClass}
              placeholder="Naam lid toevoegen..."
              value={newMember}
              onChange={e => setNewMember(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addMember()}
            />
            <Button size="sm" variant="secondary" onClick={addMember} disabled={!newMember.trim()}>
              <Plus size={16} />
            </Button>
          </div>
        </section>

        {/* Notifications (disabled UI) */}
        <section className="bg-white rounded-2xl p-5 border border-gray-100 opacity-60">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="font-bold text-dark">Notificaties</h2>
            <span className="text-xs bg-gray-100 text-mid px-2 py-0.5 rounded-full font-mono">Binnenkort</span>
          </div>
          {[
            { label: 'E-mailherinnering 30 dagen van tevoren', checked: true },
            { label: 'Pushmelding bij verlopen opzegtermijn', checked: false },
            { label: 'Wekelijks overzicht per e-mail', checked: false },
          ].map(item => (
            <div key={item.label} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
              <span className="text-sm text-dark">{item.label}</span>
              <div className={`w-10 h-6 rounded-full transition-colors ${item.checked ? 'bg-violet' : 'bg-gray-200'} relative`}>
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${item.checked ? 'translate-x-5' : 'translate-x-1'}`} />
              </div>
            </div>
          ))}
        </section>

        {/* Data */}
        <section className="bg-white rounded-2xl p-5 border border-gray-100">
          <h2 className="font-bold text-dark mb-4">Gegevens</h2>
          <div className="flex flex-col gap-3">
            <Button variant="secondary" onClick={exportData}>
              <Download size={16} /> Exporteren als JSON
            </Button>
            <Button
              variant="ghost"
              className="text-coral hover:bg-coral/10"
              onClick={() => setShowClear(true)}
            >
              <Trash2 size={16} /> Alle data wissen
            </Button>
          </div>
        </section>
      </div>

      {showClear && (
        <ConfirmDialog
          title="Alle data wissen"
          message="Weet je zeker dat je alle contracten en instellingen wilt verwijderen? Dit kan niet ongedaan worden gemaakt."
          confirmLabel="Ja, alles wissen"
          onConfirm={clearData}
          onCancel={() => setShowClear(false)}
        />
      )}
    </div>
  );
}
