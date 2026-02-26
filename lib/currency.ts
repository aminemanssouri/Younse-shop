export const CURRENCY = 'MAD';
export const CURRENCY_SYMBOL = 'د.م.';

export function formatCurrency(amount: number, symbol: boolean = true): string {
  const formatted = amount.toFixed(2);
  return symbol ? `${formatted} ${CURRENCY_SYMBOL}` : `${formatted} ${CURRENCY}`;
}

export function parseCurrency(value: string): number {
  return parseFloat(value.replace(/[^\d.-]/g, ''));
}

export function displayPrice(price: number): string {
  return formatCurrency(price);
}
