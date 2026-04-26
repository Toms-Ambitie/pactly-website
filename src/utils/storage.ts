import type { Contract, AppSettings, Notification } from '../types';
import { DEFAULT_MEMBERS } from '../types';
import { getContractStatus } from './contractStatus';

export const STORAGE_KEY  = 'pactly_contracts';
export const SETTINGS_KEY = 'pactly_settings';
export const NOTIFS_KEY   = 'pactly_notifications';
export const FILE_DB      = 'pactly_files_v1';

// ─── Contracts ─────────────────────────────────────────────────────────────

export function loadContracts(): Contract[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: Contract[] = JSON.parse(raw);
    return parsed.map(c => ({
      docs: [],
      ...c,
      type: (c.type ?? 'contract'),
      status: getContractStatus(c),
    }));
  } catch {
    return null;
  }
}

export function saveContracts(contracts: Contract[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(contracts));
}

// ─── Notifications ──────────────────────────────────────────────────────────

export function loadNotifications(): Notification[] {
  try {
    const raw = localStorage.getItem(NOTIFS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveNotifications(notifs: Notification[]): void {
  localStorage.setItem(NOTIFS_KEY, JSON.stringify(notifs));
}

// ─── Settings ──────────────────────────────────────────────────────────────

const DEFAULT_SETTINGS: AppSettings = {
  userName: '',
  householdMembers: DEFAULT_MEMBERS,
};

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      householdMembers: parsed.householdMembers?.length ? parsed.householdMembers : DEFAULT_MEMBERS,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: AppSettings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function clearAllData(): void {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(SETTINGS_KEY);
  localStorage.removeItem(NOTIFS_KEY);
}

// ─── IndexedDB file storage ─────────────────────────────────────────────────

function openFileDB(): Promise<IDBDatabase> {
  return new Promise((res, rej) => {
    const req = indexedDB.open(FILE_DB, 1);
    req.onupgradeneeded = e => (e.target as IDBOpenDBRequest).result.createObjectStore('files', { keyPath: 'id' });
    req.onsuccess = e => res((e.target as IDBOpenDBRequest).result);
    req.onerror   = () => rej(req.error);
  });
}

export async function fileSave(id: string, file: File): Promise<void> {
  const buf = await file.arrayBuffer();
  const db  = await openFileDB();
  return new Promise((res, rej) => {
    const tx = db.transaction('files', 'readwrite');
    tx.objectStore('files').put({ id, name: file.name, type: file.type, buf });
    tx.oncomplete = () => res();
    tx.onerror    = () => rej(tx.error);
  });
}

export async function fileGet(id: string): Promise<{ name: string; type: string; buf: ArrayBuffer } | null> {
  const db = await openFileDB();
  return new Promise((res, rej) => {
    const req = db.transaction('files').objectStore('files').get(id);
    req.onsuccess = () => res(req.result ?? null);
    req.onerror   = () => rej(req.error);
  });
}

export async function fileOpen(id: string): Promise<void> {
  const rec = await fileGet(id);
  if (!rec) return;
  const blob = new Blob([rec.buf], { type: rec.type || 'application/octet-stream' });
  const url  = URL.createObjectURL(blob);
  window.open(url, '_blank');
}

export async function fileDel(id: string): Promise<void> {
  const db = await openFileDB();
  return new Promise((res, rej) => {
    const tx = db.transaction('files', 'readwrite');
    tx.objectStore('files').delete(id);
    tx.oncomplete = () => res();
    tx.onerror    = () => rej(tx.error);
  });
}
