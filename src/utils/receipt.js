// Gera um comprovante de pagamento como imagem PNG usando a Canvas API nativa (sem libs externas).

function gerarCodigo(mesaId) {
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `BC-${mesaId.replace('MESA_', '')}-${rand}`;
}

export function gerarComprovante({ numero, comprador, valor, mesaId }) {
  const codigo = gerarCodigo(mesaId);
  const canvas = document.createElement('canvas');
  const width = 640;
  const height = 820;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  // fundo
  ctx.fillStyle = '#101014';
  ctx.fillRect(0, 0, width, height);

  const cardMargin = 32;
  ctx.fillStyle = '#ffffff';
  roundRect(ctx, cardMargin, cardMargin, width - cardMargin * 2, height - cardMargin * 2, 24);
  ctx.fill();

  // faixa superior
  const grad = ctx.createLinearGradient(0, 0, width, 0);
  grad.addColorStop(0, '#F59E0B');
  grad.addColorStop(1, '#22C55E');
  ctx.fillStyle = grad;
  roundRectTop(ctx, cardMargin, cardMargin, width - cardMargin * 2, 110, 24);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.font = '700 30px "Segoe UI", Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('🍺 Baile do Chopp', width / 2, cardMargin + 50);
  ctx.font = '600 16px "Segoe UI", Arial, sans-serif';
  ctx.fillText('COMPROVANTE DE PAGAMENTO', width / 2, cardMargin + 82);

  // corpo
  ctx.textAlign = 'left';
  ctx.fillStyle = '#16A34A';
  ctx.font = '700 20px "Segoe UI", Arial, sans-serif';
  ctx.fillText('✔ Pagamento confirmado', cardMargin + 32, cardMargin + 165);

  const rows = [
    ['Mesa', String(numero)],
    ['Comprador', comprador || '-'],
    ['Valor pago', valor ? Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '-'],
    ['Data', new Date().toLocaleString('pt-BR')],
    ['Código', codigo],
  ];

  let y = cardMargin + 220;
  rows.forEach(([label, value]) => {
    ctx.fillStyle = '#6B7280';
    ctx.font = '500 15px "Segoe UI", Arial, sans-serif';
    ctx.fillText(label.toUpperCase(), cardMargin + 32, y);
    ctx.fillStyle = '#111827';
    ctx.font = '600 22px "Segoe UI", Arial, sans-serif';
    ctx.fillText(value, cardMargin + 32, y + 30);
    y += 78;

    ctx.strokeStyle = '#E5E7EB';
    ctx.beginPath();
    ctx.moveTo(cardMargin + 32, y - 24);
    ctx.lineTo(width - cardMargin - 32, y - 24);
    ctx.stroke();
  });

  ctx.fillStyle = '#9CA3AF';
  ctx.font = '400 13px "Segoe UI", Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Comprovante gerado automaticamente pelo sistema Baile do Chopp', width / 2, height - cardMargin - 20);

  return {
    codigo,
    dataUrl: canvas.toDataURL('image/png'),
  };
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function roundRectTop(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.lineTo(x + w, y + h);
  ctx.lineTo(x, y + h);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export function baixarComprovante(dataUrl, nomeArquivo) {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = nomeArquivo;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
