import { STATUS, STATUS_CONFIG } from '../data/statusConfig';
import { BARRIS } from '../data/pricing';
import { formatMoney } from './money';

function onlyDigits(str) {
  return (str || '').replace(/\D/g, '');
}

export function buildWhatsappMessage({
  numero,
  status,
  comprador,
  valor,
  barril50,
  barril30,
  observacao,
  comprovanteCodigo,
}) {
  const cfg = STATUS_CONFIG[status];
  const linhas = [
    '🍺 *Baile do Chopp*',
    `Mesa: *${numero}*`,
    `Status: ${cfg.emoji} *${cfg.label}*`,
  ];

  if (comprador) linhas.push(`Comprador: ${comprador}`);

  const q50 = Number(barril50) || 0;
  const q30 = Number(barril30) || 0;
  if (q50) linhas.push(`${BARRIS.b50.label}: ${q50}x`);
  if (q30) linhas.push(`${BARRIS.b30.label}: ${q30}x`);

  const valorFormatado = formatMoney(valor);
  if (status === STATUS.RESERVADO && valorFormatado) {
    linhas.push(`Valor a pagar: *${valorFormatado}*`);
    linhas.push('');
    linhas.push('Sua mesa está reservada! Por favor efetue o pagamento para confirmação.');
  }

  if (status === STATUS.PAGO) {
    linhas.push('');
    linhas.push('✅ *Pagamento confirmado!*');
    if (valorFormatado) linhas.push(`Valor pago: ${valorFormatado}`);
    if (comprovanteCodigo) linhas.push(`Comprovante nº: ${comprovanteCodigo}`);
    linhas.push('Segue o comprovante em anexo. Nos vemos no baile! 🎉');
  }

  if (status === STATUS.PATROCINIO) {
    linhas.push('');
    linhas.push('🙏 Muito obrigado pelo patrocínio! Sua mesa está garantida.');
  }

  if (status === STATUS.ENTREGUE) {
    linhas.push('');
    linhas.push('📦 Pedido entregue na mesa. Aproveite!');
  }

  if (observacao) {
    linhas.push('');
    linhas.push(`Obs: ${observacao}`);
  }

  return linhas.join('\n');
}

export function openWhatsapp({ telefone, message }) {
  const digits = onlyDigits(telefone);
  const phonePart = digits ? (digits.length <= 11 ? `55${digits}` : digits) : '';
  const url = `https://wa.me/${phonePart}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}
