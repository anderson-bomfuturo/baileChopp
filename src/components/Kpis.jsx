import React, { useMemo } from 'react';
import { STATUS, STATUS_LIST } from '../data/statusConfig';

const TOTAL_MESAS = 151;

export default function Kpis({ mesas }) {
  const stats = useMemo(() => {
    const counts = STATUS_LIST.reduce((acc, s) => ({ ...acc, [s]: 0 }), {});
    let arrecadado = 0;
    let aReceber = 0;

    Object.values(mesas).forEach((mesa) => {
      const status = mesa.status || STATUS.LIVRE;
      counts[status] = (counts[status] || 0) + 1;
      const valor = Number(mesa.valor) || 0;
      if (status === STATUS.PAGO) arrecadado += valor;
      if (status === STATUS.RESERVADO) aReceber += valor;
    });

    const usadas = Object.keys(mesas).length;
    const livres = TOTAL_MESAS - usadas;
    const ocupacao = Math.round(((TOTAL_MESAS - livres) / TOTAL_MESAS) * 100);

    return { counts, livres, arrecadado, aReceber, ocupacao };
  }, [mesas]);

  const money = (n) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <div className="kpis">
      <div className="kpi-card kpi-highlight">
        <div className="kpi-value">{stats.ocupacao}%</div>
        <div className="kpi-label">Ocupação</div>
      </div>
      <div className="kpi-card">
        <div className="kpi-value">{stats.livres}</div>
        <div className="kpi-label">Mesas livres</div>
      </div>
      <div className="kpi-card">
        <div className="kpi-value">{stats.counts[STATUS.RESERVADO]}</div>
        <div className="kpi-label">Reservadas</div>
      </div>
      <div className="kpi-card">
        <div className="kpi-value">{stats.counts[STATUS.PAGO]}</div>
        <div className="kpi-label">Pagas</div>
      </div>
      <div className="kpi-card">
        <div className="kpi-value">{stats.counts[STATUS.ENTREGUE]}</div>
        <div className="kpi-label">Entregues</div>
      </div>
      <div className="kpi-card">
        <div className="kpi-value">{stats.counts[STATUS.PATROCINIO]}</div>
        <div className="kpi-label">Patrocínio</div>
      </div>
      <div className="kpi-card kpi-money">
        <div className="kpi-value">{money(stats.arrecadado)}</div>
        <div className="kpi-label">Arrecadado</div>
      </div>
      <div className="kpi-card kpi-money-pending">
        <div className="kpi-value">{money(stats.aReceber)}</div>
        <div className="kpi-label">A receber (reservas)</div>
      </div>
    </div>
  );
}
