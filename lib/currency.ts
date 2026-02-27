import type { Language } from '@/lib/translations';

export const CURRENCY = 'MAD';
export const CURRENCY_SYMBOL_AR = 'د.م.';

export function formatCurrency(amount: number, language?: Language, symbol: boolean = true): string {
  const formatted = amount.toFixed(2);
  const currency = language === 'ar' ? CURRENCY_SYMBOL_AR : CURRENCY;
  return symbol ? `${formatted} ${currency}` : `${formatted} ${currency}`;
}

export function parseCurrency(value: string): number {
  return parseFloat(value.replace(/[^\d.-]/g, ''));
}

export function displayPrice(price: number, language?: Language): string {
  return formatCurrency(price, language);
}
