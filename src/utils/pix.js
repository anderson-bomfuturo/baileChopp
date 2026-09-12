// Gera o payload "Pix Copia e Cola" (BR Code, padrão EMV do Banco Central) para
// pagamento com valor fixo. Não depende de nenhum serviço externo: é só uma
// string estruturada + checksum, decodificada por qualquer app de banco.
// Referência: Manual de Padrões para Iniciação do Pix (BACEN).
//
// A chave/nome/cidade do recebedor vêm da tela de Administração (tabela
// `configuracoes` no Supabase, ver hook usePixConfig), não de variáveis de
// ambiente — assim o organizador troca a chave sem precisar de novo deploy.

function tlv(id, value) {
  const len = String(value.length).padStart(2, '0');
  return `${id}${len}${value}`;
}

// CRC16-CCITT (poly 0x1021, init 0xFFFF) — exigido no final do payload.
function crc16(payload) {
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i += 1) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j += 1) {
      crc = (crc & 0x8000) !== 0 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

// O padrão só aceita ASCII sem acento nesses campos.
function sanitize(str) {
  return (str || '')
    .normalize('NFD')
    .replace(/[^\x20-\x7E]/g, '');
}

export function isPixConfigured(config) {
  return Boolean(config?.pixKey && config?.pixNome && config?.pixCidade);
}

export function buildPixPayload({ pixKey, pixNome, pixCidade, valor, txid }) {
  if (!(pixKey && pixNome && pixCidade)) return null;
  const numero = Number(valor);
  if (!numero || numero <= 0) return null;

  const merchantAccountInfo = tlv('00', 'br.gov.bcb.pix') + tlv('01', pixKey);
  const txidLimpo = (txid || '').replace(/[^A-Za-z0-9]/g, '').slice(0, 25) || 'BAILECHOPP';

  const fields = [
    tlv('00', '01'), // payload format indicator
    tlv('01', '11'), // 11 = QR estático (valor fixo, reutilizável)
    tlv('26', merchantAccountInfo),
    tlv('52', '0000'), // merchant category code (não informado)
    tlv('53', '986'), // moeda: BRL
    tlv('54', numero.toFixed(2)), // valor da transação
    tlv('58', 'BR'),
    tlv('59', sanitize(pixNome).slice(0, 25) || 'BAILE DO CHOPP'),
    tlv('60', sanitize(pixCidade).slice(0, 15) || 'CIDADE'),
    tlv('62', tlv('05', txidLimpo)),
  ];

  const payloadSemCrc = `${fields.join('')}6304`;
  return payloadSemCrc + crc16(payloadSemCrc);
}
