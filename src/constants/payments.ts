export const PAYMENT_OPTIONS = [
  { id: 1, key: 'CASH',       label: 'Efectivo',      method_name: 'efectivo' },
  { id: 2, key: 'CREDIT',     label: 'Credito',       method_name: 'credito' },
  { id: 3, key: 'CARD',       label: 'Tarjeta',       method_name: 'tarjeta' },
  { id: 4, key: 'TRANSFER',   label: 'Transferencia', method_name: 'transferencia' },
] as const;

export type PaymentKey = typeof PAYMENT_OPTIONS[number]['key'];

export const IGV_BY_FUEL: Record<string, number> = {
  Diesel: 0.12,
  Regular: 0.16,
  Premium: 0.18,
};

export const getPaymentLabel = (s: any): string => {
  const pmStr = (s?.payment_method ?? '').toString().trim().toLowerCase();
  if (pmStr) {
    const opt = PAYMENT_OPTIONS.find(o => o.method_name.toLowerCase() === pmStr);
    return opt?.label ?? pmStr.charAt(0).toUpperCase() + pmStr.slice(1);
  }
  const id = Number(s?.payment_method_id);
  if (Number.isFinite(id)) {
    return PAYMENT_OPTIONS.find(o => o.id === id)?.label ?? '—';
  }
  return '—';
};
