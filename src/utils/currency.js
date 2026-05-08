const currencyConfig = {
  USD: { symbol: '$', locale: 'en-US' },
  EUR: { symbol: '€', locale: 'de-DE' },
  GBP: { symbol: '£', locale: 'en-GB' },
  INR: { symbol: '₹', locale: 'en-IN' },
  JPY: { symbol: '¥', locale: 'ja-JP' },
  CAD: { symbol: 'C$', locale: 'en-CA' },
  AUD: { symbol: 'A$', locale: 'en-AU' },
};

export const getCurrencySymbol = (code = 'USD') => {
  return currencyConfig[code]?.symbol || '$';
};

export const formatAmount = (amount, code = 'USD') => {
  const config = currencyConfig[code] || currencyConfig.USD;
  return new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency: code,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatCompact = (amount, code = 'USD') => {
  const config = currencyConfig[code] || currencyConfig.USD;
  return new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency: code,
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(amount);
};
