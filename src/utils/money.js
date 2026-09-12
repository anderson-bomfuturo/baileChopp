export function formatMoney(value) {
  const n = Number(value);
  if (!value || Number.isNaN(n)) return null;
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}
