import type { Contract, ContractStatus } from '../types';

export function getContractStatus(contract: Pick<Contract, 'endDate' | 'noticePeriodDays'>): ContractStatus {
  // Doorlopend (no end date) → always actief
  if (!contract.endDate) return 'actief';

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const endDate = new Date(contract.endDate);
  endDate.setHours(0, 0, 0, 0);

  const noticeCutoff = new Date(endDate.getTime() - contract.noticePeriodDays * 86_400_000);
  const daysUntilEnd = Math.ceil((endDate.getTime() - today.getTime()) / 86_400_000);

  if (endDate < today) return 'verlopen';
  if (daysUntilEnd <= 30) return 'urgent';
  if (today >= noticeCutoff || daysUntilEnd <= 60) return 'evalueer';
  return 'actief';
}

export function daysUntilEnd(endDate: string | null): number | null {
  if (!endDate) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(0, 0, 0, 0);
  return Math.ceil((end.getTime() - today.getTime()) / 86_400_000);
}

export function contractProgress(startDate: string, endDate: string | null): number {
  if (!endDate) return 0;
  const start = new Date(startDate).getTime();
  const end   = new Date(endDate).getTime();
  const now   = Date.now();
  if (end <= start) return 1;
  return Math.min(1, Math.max(0, (now - start) / (end - start)));
}

const STATUS_ORDER: Record<ContractStatus, number> = {
  urgent: 0, evalueer: 1, actief: 2, verlopen: 3,
};

export function sortByUrgency(contracts: Contract[]): Contract[] {
  return [...contracts].sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status]);
}
