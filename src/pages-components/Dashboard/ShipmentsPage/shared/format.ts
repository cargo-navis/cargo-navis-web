/** Numbers as Croatian text: „1.850”, „13,6”. */
export function formatNumber(value: number, maximumFractionDigits = 1) {
  return value.toLocaleString('hr-HR', { maximumFractionDigits });
}

/** „1.850 €” (cents only when there are any). */
export function formatEuro(value: number) {
  return `${value.toLocaleString('hr-HR', { maximumFractionDigits: 2 })} €`;
}

/** „1.850,00 €” for the detail page's money fields. */
export function formatEuroExact(value: number) {
  return `${value.toLocaleString('hr-HR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;
}

/** „15.500 kg” */
export function formatKg(value: number) {
  return `${value.toLocaleString('hr-HR')} kg`;
}

/** Agency nalog: what we keep (client price − contractor price) and its share of the client price. */
export function getMargin(price: number, contractorPrice: number) {
  const earnings = price - contractorPrice;
  return { earnings, percent: price ? (earnings / price) * 100 : 0, isLoss: earnings < 0 };
}
