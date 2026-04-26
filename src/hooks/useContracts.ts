import { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { Contract, Notification } from '../types';
import { getContractStatus } from '../utils/contractStatus';
import { loadContracts, saveContracts, loadNotifications, saveNotifications, fileDel } from '../utils/storage';
import { seedContracts } from '../utils/seedData';

// ─── Smart notification thresholds ───────────────────────────────────────────

const THRESHOLDS: Array<{
  days: number;
  type: Notification['type'];
  title: (name: string) => string;
  message: (name: string, provider: string, days: number) => string;
}> = [
  {
    days: 365,
    type: 'info',
    title: name => `${name} — 1 jaar tot einde looptijd`,
    message: (name, provider, days) =>
      `Uw contract met ${provider} loopt nog circa ${Math.round(days / 30)} maanden. Ideaal moment om rentetarieven of alternatieven te vergelijken en tijdig actie te nemen.`,
  },
  {
    days: 90,
    type: 'info',
    title: name => `${name} verloopt over ~3 maanden`,
    message: (name, provider, days) =>
      `Nog ${days} dagen tot het einde van uw contract met ${provider}. Vergelijk alternatieven en beslis of u wilt verlengen of opzeggen.`,
  },
  {
    days: 60,
    type: 'warning',
    title: name => `${name} — opzegtermijn nadert`,
    message: (name, provider, days) =>
      `Nog ${days} dagen tot het einde van ${name}. Controleer uw opzegtermijn en neem tijdig actie om automatische verlenging te voorkomen.`,
  },
  {
    days: 30,
    type: 'urgent',
    title: name => `${name} — actie vereist!`,
    message: (name, _provider, days) =>
      `Uw ${name} verloopt over ${days} dag${days !== 1 ? 'en' : ''}. Zeg nu op of verleng om automatische verlenging te voorkomen.`,
  },
];

/**
 * For each contract with an end date, generate at most ONE smart notification:
 * the tightest (most urgent) applicable threshold that doesn't yet have a
 * matching notification in `existing`.
 */
function generateSmartNotifications(contracts: Contract[], existing: Notification[]): Notification[] {
  const existingIds = new Set(existing.map(n => n.id));
  const result: Notification[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayIso = today.toISOString().split('T')[0];

  for (const contract of contracts) {
    if (!contract.endDate) continue;
    const end = new Date(contract.endDate);
    end.setHours(0, 0, 0, 0);
    if (end <= today) continue; // already expired

    const daysLeft = Math.ceil((end.getTime() - today.getTime()) / 86_400_000);

    // Collect all applicable thresholds not yet notified
    const applicable = THRESHOLDS.filter(t =>
      daysLeft <= t.days && !existingIds.has(`auto-${contract.id}-${t.days}d`),
    );
    if (applicable.length === 0) continue;

    // Pick the tightest (most urgent) one
    const pick = applicable.reduce((a, b) => (a.days < b.days ? a : b));
    const id = `auto-${contract.id}-${pick.days}d`;

    result.push({
      id,
      contractId: contract.id,
      type: pick.type,
      title: pick.title(contract.name),
      message: pick.message(contract.name, contract.provider, daysLeft),
      date: todayIso,
      read: false,
    });

    // Mark as existing so a second pass doesn't re-create it
    existingIds.add(id);
  }

  return result;
}

// ─── Init (module-level singleton prevents StrictMode double-run) ─────────────

interface InitState { contracts: Contract[]; notifications: Notification[] }
let _init: InitState | null = null;

function getInitState(): InitState {
  if (_init) return _init;

  const storedContracts = loadContracts();
  const contracts: Contract[] = (storedContracts && storedContracts.length > 0)
    ? storedContracts
    : seedContracts;
  if (!storedContracts || storedContracts.length === 0) saveContracts(contracts);

  const storedNotifs = loadNotifications();
  const base: Notification[] = storedNotifs.length > 0 ? storedNotifs : [];
  const smart = generateSmartNotifications(contracts, base);
  const notifications = smart.length > 0 ? [...base, ...smart] : base;
  if (smart.length > 0 || storedNotifs.length === 0) saveNotifications(notifications);

  _init = { contracts, notifications };
  return _init;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useContracts() {
  const [contracts, setContracts] = useState<Contract[]>(() => getInitState().contracts);
  const [notifications, setNotifications] = useState<Notification[]>(() => getInitState().notifications);

  // ── Persistence helpers ──────────────────────────────────────────────────
  const persistContracts = useCallback((list: Contract[]) => {
    setContracts(list);
    saveContracts(list);
  }, []);

  const persistNotifs = useCallback((list: Notification[]) => {
    setNotifications(list);
    saveNotifications(list);
  }, []);

  // ── Smart notification refresh (call after any contract mutation) ─────────
  const refreshSmartNotifs = useCallback((updatedContracts: Contract[], currentNotifs: Notification[]) => {
    const smart = generateSmartNotifications(updatedContracts, currentNotifs);
    if (smart.length > 0) {
      persistNotifs([...currentNotifs, ...smart]);
    }
  }, [persistNotifs]);

  // ── Contract mutations ───────────────────────────────────────────────────
  const addContract = useCallback((data: Omit<Contract, 'id' | 'status' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const c: Contract = { ...data, id: uuidv4(), status: getContractStatus(data), createdAt: now, updatedAt: now };
    const newContracts = [c, ...contracts];
    persistContracts(newContracts);
    refreshSmartNotifs(newContracts, notifications);
    return c;
  }, [contracts, notifications, persistContracts, refreshSmartNotifs]);

  const updateContract = useCallback((id: string, data: Partial<Omit<Contract, 'id' | 'createdAt'>>) => {
    const updated = contracts.map(c => {
      if (c.id !== id) return c;
      const merged = { ...c, ...data, updatedAt: new Date().toISOString() };
      return { ...merged, status: getContractStatus(merged) };
    });
    persistContracts(updated);
    refreshSmartNotifs(updated, notifications);
  }, [contracts, notifications, persistContracts, refreshSmartNotifs]);

  const deleteContract = useCallback((id: string) => {
    const c = contracts.find(x => x.id === id);
    if (c?.docs) {
      c.docs.filter(d => d.includes('||')).forEach(d => fileDel(d.split('||')[1]));
    }
    persistContracts(contracts.filter(c => c.id !== id));
  }, [contracts, persistContracts]);

  // ── Notification mutations ───────────────────────────────────────────────
  const markNotificationRead = useCallback((id: string) => {
    persistNotifs(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  }, [notifications, persistNotifs]);

  const markAllRead = useCallback(() => {
    persistNotifs(notifications.map(n => ({ ...n, read: true })));
  }, [notifications, persistNotifs]);

  const refreshStatuses = useCallback(() => {
    const refreshed = contracts.map(c => ({ ...c, status: getContractStatus(c) }));
    setContracts(refreshed);
    saveContracts(refreshed);
    // Note: smart notifications are generated on init and after explicit contract
    // mutations — NOT on every focus event to avoid premature threshold escalation.
  }, [contracts]);

  return {
    contracts, addContract, updateContract, deleteContract, refreshStatuses,
    notifications, markNotificationRead, markAllRead,
  };
}
