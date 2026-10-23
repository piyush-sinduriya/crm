export interface CurrencyOption {
  code: string;
  name: string;
  symbol: string;
  locale: string;
}

export const SUPPORTED_CURRENCIES: CurrencyOption[] = [
  { code: 'INR', name: 'Indian Rupee (INR)', symbol: '₹', locale: 'en-IN' },
  { code: 'USD', name: 'US Dollar (USD)', symbol: '$', locale: 'en-US' },
  { code: 'EUR', name: 'Euro (EUR)', symbol: '€', locale: 'de-DE' },
  { code: 'AED', name: 'UAE Dirham (AED)', symbol: 'AED ', locale: 'en-AE' },
  { code: 'GBP', name: 'British Pound (GBP)', symbol: '£', locale: 'en-GB' },
];

/**
 * Format numeric value according to Indian numbering standards (or specified currency)
 */
export function formatCurrencyAmount(
  amount: number | string,
  currencyCode: string = 'INR',
  currencySymbol: string = '₹'
): string {
  if (typeof amount === 'string') {
    // If it already contains currency symbol or non-digits, extract the number
    const num = parseInt(amount.replace(/[^0-9]/g, ''), 10);
    if (isNaN(num)) return `${currencySymbol}0`;
    amount = num;
  }

  const curr = SUPPORTED_CURRENCIES.find((c) => c.code === currencyCode) || SUPPORTED_CURRENCIES[0];

  try {
    const formattedNum = amount.toLocaleString(curr.locale);
    return `${currencySymbol}${formattedNum}`;
  } catch (err) {
    return `${currencySymbol}${amount.toLocaleString('en-IN')}`;
  }
}

/**
 * Indian Lakhs / Crores compact formatting helper
 */
export function formatIndianCompact(amount: number): string {
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(2)} Cr`;
  }
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(2)} Lakh`;
  }
  return `₹${amount.toLocaleString('en-IN')}`;
}
