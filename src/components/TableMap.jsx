import React, { useEffect, useRef, useState } from 'react';
import mesasSvgUrl from '../svg/Mesas.svg';
import { STATUS_CONFIG } from '../data/statusConfig';

const MESA_ID_RE = /^MESA_/;

function getMesaNumero(id) {
  const match = id.match(/(\d+)$/);
  return match ? String(Number(match[1])) : id;
}

const MATRIX_RE = /matrix\(\s*([-\d.]+)[ ,]+([-\d.]+)[ ,]+([-\d.]+)[ ,]+([-\d.]+)[ ,]+([-\d.]+)[ ,]+([-\d.]+)\s*\)/;

// Centro do retângulo em coordenadas do viewBox, calculado direto dos
// atributos (x/y/width/height + transform="matrix(...)"), sem depender de
// getCTM()/getScreenCTM() — que retornam coordenadas de pixel já escaladas
// pelo CSS e não batem com o sistema de coordenadas do próprio SVG.
function getRectCenter(rect) {
  const x = parseFloat(rect.getAttribute('x') || '0');
  const y = parseFloat(rect.getAttribute('y') || '0');
  const width = parseFloat(rect.getAttribute('width') || '0');
  const height = parseFloat(rect.getAttribute('height') || '0');
  const localX = x + width / 2;
  const localY = y + height / 2;

  const transform = rect.getAttribute('transform');
  const match = transform && transform.match(MATRIX_RE);
  if (!match) return { cx: localX, cy: localY };

  const [a, b, c, d, e, f] = match.slice(1, 7).map(Number);
  return {
    cx: a * localX + c * localY + e,
    cy: b * localX + d * localY + f,
  };
}

export default function TableMap({ mesas, onSelectMesa }) {
  const [svgMarkup, setSvgMarkup] = useState(null);
  const containerRef = useRef(null);
  const onSelectMesaRef = useRef(onSelectMesa);
  onSelectMesaRef.current = onSelectMesa;

  useEffect(() => {
    if (typeof fetch !== 'function') return undefined;
    let cancelled = false;
    fetch(mesasSvgUrl)
      .then((res) => res.text())
      .then((text) => {
        if (!cancelled) setSvgMarkup(text);
      })
      .catch((err) => console.error('Erro ao carregar Mesas.svg', err));
    return () => {
      cancelled = true;
    };
  }, []);

  // Injeta o markup do SVG de forma imperativa (fora do controle de diff do
  // React). Usar dangerouslySetInnerHTML no JSX recriaria o objeto a cada
  // render e faria o React resetar o innerHTML (perdendo textos/handlers
  // adicionados abaixo) sempre que qualquer estado do app mudasse — por
  // exemplo ao abrir/fechar o popup de reserva.
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !svgMarkup) return;
    container.innerHTML = svgMarkup;
  }, [svgMarkup]);

  // Injeta as legendas de número + cores de status em cada mesa.
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !svgMarkup) return;

    const svg = container.querySelector('svg');
    if (!svg) return;

    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    svg.style.display = 'block';

    const mesasGroup = svg.querySelector('#Mesas') || svg;

    const rects = mesasGroup.querySelectorAll('rect[id^="MESA_"]');
    rects.forEach((rect) => {
      const id = rect.id;
      if (!MESA_ID_RE.test(id)) return;

      const mesaData = mesas[id];
      const status = mesaData ? mesaData.status : 'LIVRE';
      const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.LIVRE;

      rect.setAttribute('fill', cfg.color);
      rect.style.cursor = 'pointer';
      rect.style.transition = 'fill 0.2s ease, opacity 0.15s ease';

      if (!rect.dataset.boundClick) {
        rect.dataset.boundClick = 'true';
        rect.addEventListener('click', () => onSelectMesaRef.current(id));
        rect.addEventListener('mouseenter', () => {
          rect.style.opacity = '0.85';
        });
        rect.addEventListener('mouseleave', () => {
          rect.style.opacity = '1';
        });
      }

      const { cx, cy } = getRectCenter(rect);

      let text = mesasGroup.querySelector(`text[data-for="${id}"]`);
      if (!text) {
        text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('data-for', id);
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('dominant-baseline', 'central');
        text.style.pointerEvents = 'none';
        text.style.fontFamily = "'Segoe UI', Arial, sans-serif";
        text.style.fontWeight = '700';
        text.setAttribute('font-size', '30');
        mesasGroup.appendChild(text);
      }
      text.setAttribute('x', String(cx));
      text.setAttribute('y', String(cy));
      text.setAttribute('fill', cfg.textColor);
      text.textContent = getMesaNumero(id);
    });
  }, [svgMarkup, mesas]);

  return (
    <div className="table-map-scroll">
      {!svgMarkup && <div className="table-map-loading">Carregando mapa de mesas…</div>}
      <div ref={containerRef} className="table-map-inner" style={{ display: svgMarkup ? 'block' : 'none' }} />
    </div>
  );
}
