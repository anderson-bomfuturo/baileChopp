// Valores fixos do evento. Se o preço mudar de ano pra ano, é só editar aqui.
export const VALOR_MESA = 200;

export const BARRIS = {
  b50: { label: 'Barril 50L (com 4 ingressos)', preco: 1100 },
  b30: { label: 'Barril 30L', preco: 750 },
};

// Soma mesa + barris selecionados. Quantidades ausentes/inválidas contam como 0.
export function calcularValorTotal({ barril50, barril30 }) {
  const q50 = Number(barril50) || 0;
  const q30 = Number(barril30) || 0;
  return VALOR_MESA + q50 * BARRIS.b50.preco + q30 * BARRIS.b30.preco;
}
