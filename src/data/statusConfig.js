// Configuração central dos status de mesa: cor, rótulo e comportamento.
export const STATUS = {
  LIVRE: 'LIVRE',
  RESERVADO: 'RESERVADO',
  PAGO: 'PAGO',
  ENTREGUE: 'ENTREGUE',
  PATROCINIO: 'PATROCINIO',
};

export const STATUS_LIST = [
  STATUS.LIVRE,
  STATUS.RESERVADO,
  STATUS.PAGO,
  STATUS.ENTREGUE,
  STATUS.PATROCINIO,
];

// Cor "padrão" (#C6CDCE) é a cor original vinda do Mesas.svg para LIVRE.
export const STATUS_CONFIG = {
  LIVRE: { label: 'Livre', color: '#C6CDCE', textColor: '#2B2B2B', emoji: '⚪' },
  RESERVADO: { label: 'Reservado', color: '#FFC53D', textColor: '#4A2E00', emoji: '🟡' },
  PAGO: { label: 'Pago', color: '#22C55E', textColor: '#0B3B1E', emoji: '🟢' },
  ENTREGUE: { label: 'Entregue', color: '#3B82F6', textColor: '#0B2450', emoji: '🔵' },
  PATROCINIO: { label: 'Patrocínio', color: '#A855F7', textColor: '#2E0B4D', emoji: '🟣' },
};
