// ─── Domain types ──────────────────────────────────────────────────────────

export type ContractType = 'contract' | 'abonnement';

export type ContractCategory =
  | 'energie'
  | 'hypotheek'
  | 'huur'
  | 'telefoon'
  | 'verzekering'
  | 'streaming'
  | 'internet'
  | 'zorgverzekering'
  | 'sport'
  | 'software'
  | 'media'
  | 'overig';

export type ContractStatus = 'actief' | 'evalueer' | 'urgent' | 'verlopen';

export interface Contract {
  id: string;
  type: ContractType;          // contract or abonnement
  name: string;
  category: ContractCategory;
  provider: string;
  startDate: string;            // ISO 8601
  endDate: string | null;       // null = doorlopend
  noticePeriodDays: number;
  monthlyAmount: number;
  notes?: string;
  householdMember?: string;     // legacy: free-text owner
  betaler?: string;             // member id
  beheerder?: string;           // member id
  docs?: string[];              // filenames or "name||idb-key"
  tags?: string[];              // user labels e.g. ['verhuizing', 'opzeggen']
  status: ContractStatus;
  createdAt: string;
  updatedAt: string;
}

export interface HouseholdMember {
  id: string;
  name: string;
  color: string;
  initials: string;
}

export interface Notification {
  id: string;
  contractId: string;
  type: 'urgent' | 'warning' | 'info';
  title: string;
  message: string;
  date: string;
  read: boolean;
}

export interface AppSettings {
  userName: string;
  householdMembers: HouseholdMember[];
}

// ─── Category metadata ──────────────────────────────────────────────────────

export interface CategoryMeta {
  label: string;
  icon: string;
  color: string;
}

export const CATEGORY_META: Record<ContractCategory, CategoryMeta> = {
  energie:         { label: 'Energie',         icon: '⚡', color: '#F59E0B' },
  hypotheek:       { label: 'Hypotheek',       icon: '🏠', color: '#4B519E' },
  huur:            { label: 'Huur',            icon: '🏡', color: '#7C3AED' },
  telefoon:        { label: 'Telefoon',        icon: '📱', color: '#0EA5E9' },
  verzekering:     { label: 'Verzekering',     icon: '🛡️', color: '#10B981' },
  streaming:       { label: 'Streaming',       icon: '🎬', color: '#EF4444' },
  internet:        { label: 'Internet',        icon: '📡', color: '#6366F1' },
  zorgverzekering: { label: 'Zorgverzekering', icon: '❤️', color: '#FF6B7D' },
  sport:           { label: 'Sport',           icon: '💪', color: '#FF7A35' },
  software:        { label: 'Software',        icon: '🎨', color: '#DC2626' },
  media:           { label: 'Media',           icon: '📰', color: '#64748B' },
  overig:          { label: 'Overig',          icon: '📄', color: '#6B6A7A' },
};

// ─── Status metadata ────────────────────────────────────────────────────────

export interface StatusMeta {
  label: string;
  color: string;
  bg: string;
  barColor: string;
}

export const STATUS_META: Record<ContractStatus, StatusMeta> = {
  actief:   { label: 'Actief',   color: '#181A2B', bg: '#F7FF5C', barColor: '#F7FF5C' },
  evalueer: { label: 'Evalueer', color: '#FFFFFF', bg: '#FF7A35', barColor: '#FF7A35' },
  urgent:   { label: 'Urgent',   color: '#FFFFFF', bg: '#FF6B7D', barColor: '#FF6B7D' },
  verlopen: { label: 'Verlopen', color: '#FFFFFF', bg: '#6B6A7A', barColor: '#6B6A7A' },
};

// ─── Contract tags ──────────────────────────────────────────────────────────

export const CONTRACT_TAGS = [
  { id: 'verhuizing', label: 'Verhuizing',  icon: '🚚', color: '#7C3AED' },
  { id: 'opzeggen',   label: 'Opzeggen',    icon: '✂️',  color: '#FF6B7D' },
  { id: 'besparen',   label: 'Besparen',    icon: '💡', color: '#10B981' },
  { id: 'evalueren',  label: 'Evalueren',   icon: '🔍', color: '#FF7A35' },
  { id: 'verlengen',  label: 'Verlengen',   icon: '🔄', color: '#4B519E' },
] as const;

// ─── Default household members ──────────────────────────────────────────────

export const DEFAULT_MEMBERS: HouseholdMember[] = [
  { id: 'tom',   name: 'Tom',         color: '#4B519E', initials: 'TM' },
  { id: 'ilze',  name: 'Ilze',        color: '#FF6B7D', initials: 'IL' },
  { id: 'samen', name: 'Gezamenlijk', color: '#10B981', initials: 'GZ' },
];
