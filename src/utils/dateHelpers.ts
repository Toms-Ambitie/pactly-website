import { format, formatDistanceToNowStrict, parseISO } from 'date-fns';
import { nl } from 'date-fns/locale';

export const formatDate = (iso: string | null | undefined): string => {
  if (!iso) return 'Doorlopend';
  return format(parseISO(iso), 'd MMM yyyy', { locale: nl });
};

export const formatDateShort = (iso: string | null | undefined): string => {
  if (!iso) return '—';
  return format(parseISO(iso), 'dd-MM-yyyy');
};

export const formatMonthYear = (iso: string): string =>
  format(parseISO(iso), 'MMM yyyy', { locale: nl });

export const distanceToNow = (iso: string): string =>
  formatDistanceToNowStrict(parseISO(iso), { locale: nl, addSuffix: true });

export const toISODate = (date: Date): string =>
  format(date, 'yyyy-MM-dd');

/** Format euro amount */
export const formatEuro = (amount: number): string =>
  new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(amount);
