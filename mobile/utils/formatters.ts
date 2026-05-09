import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns';

export const formatCurrency = (
  amount: number,
  currency: string = 'USD',
  compact: boolean = false
): string => {
  if (compact && Math.abs(amount) >= 1000) {
    const suffixes = ['', 'K', 'M', 'B'];
    const tier = Math.floor(Math.log10(Math.abs(amount)) / 3);
    const scaled = amount / Math.pow(1000, tier);
    return `$${scaled.toFixed(1)}${suffixes[tier]}`;
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatDate = (date: string | Date): string => {
  const d = new Date(date);
  if (isToday(d)) return 'Today';
  if (isYesterday(d)) return 'Yesterday';
  return format(d, 'MMM dd, yyyy');
};

export const formatTime = (date: string | Date): string => {
  return format(new Date(date), 'h:mm a');
};

export const formatRelative = (date: string | Date): string => {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
};

export const formatPercentage = (value: number, decimals: number = 1): string => {
  return `${value >= 0 ? '+' : ''}${value.toFixed(decimals)}%`;
};

export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('en-US').format(value);
};

export const abbreviateNumber = (num: number): string => {
  if (num >= 1e9) return `${(num / 1e9).toFixed(1)}B`;
  if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
  if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
  return num.toString();
};
