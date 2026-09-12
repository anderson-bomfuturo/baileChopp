import React, { useMemo } from 'react';
import {
  IoPieChartOutline,
  IoEllipseOutline,
  IoTimeOutline,
  IoCheckmarkCircleOutline,
  IoCubeOutline,
  IoHeartOutline,
  IoCashOutline,
  IoWalletOutline,
  IoBeer,
} from 'react-icons/io5';
import { STATUS, STATUS_LIST } from '../data/statusConfig';

const TOTAL_MESAS = 151;

export default function Kpis({ mesas }) {
  const stats = useMemo(() => {
    const counts = STATUS_LIST.reduce((acc, s) => ({ ...acc, [s]: 0 }), {});
    let arrecadado = 0;
    let aReceber = 0;
    let barris = 0;
    let ocupadas = 0;

    Object.values(mesas).forEach((mesa) => {
      const status = mesa.status || STATUS.LIVRE;
      counts[status] = (counts[status] || 0) + 1;
      if (status !== STATUS.LIVRE) ocupadas += 1;
      const valor = Number(mesa.valor) || 0;
      if (status === STATUS.PAGO) arrecadado += valor;
      if (status === STATUS.RESERVADO) aReceber += valor;
      barris += (Number(mesa.barril50) || 0) + (Number(mesa.barril30) || 0);
    });

    const livres = TOTAL_MESAS - ocupadas;
    const ocupacao = Math.round((ocupadas / TOTAL_MESAS) * 100);

    return { counts, livres, arrecadado, aReceber, barris, ocupacao };
  }, [mesas]);

  const money = (n) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <div className="kpis">
      <div className="kpi-card kpi-highlight">
        <IoPieChartOutline className="kpi-icon" />
        <div className="kpi-value">{stats.ocupacao}%</div>
        <div className="kpi-label">Ocupação</div>
      </div>
      <div className="kpi-card">
        <IoEllipseOutline className="kpi-icon" />
        <div className="kpi-value">{stats.livres}</div>
        <div className="kpi-label">Mesas livres</div>
      </div>
      <div className="kpi-card">
        <IoTimeOutline className="kpi-icon" />
        <div className="kpi-value">{stats.counts[STATUS.RESERVADO]}</div>
        <div className="kpi-label">Reservadas</div>
      </div>
      <div className="kpi-card">
        <IoCheckmarkCircleOutline className="kpi-icon" />
        <div className="kpi-value">{stats.counts[STATUS.PAGO]}</div>
        <div className="kpi-label">Pagas</div>
      </div>
      <div className="kpi-card">
        <IoCubeOutline className="kpi-icon" />
        <div className="kpi-value">{stats.counts[STATUS.ENTREGUE]}</div>
        <div className="kpi-label">Entregues</div>
      </div>
      <div className="kpi-card">
        <IoHeartOutline className="kpi-icon" />
        <div className="kpi-value">{stats.counts[STATUS.PATROCINIO]}</div>
        <div className="kpi-label">Patrocínio</div>
      </div>
      <div className="kpi-card kpi-money">
        <IoCashOutline className="kpi-icon" />
        <div className="kpi-value">{money(stats.arrecadado)}</div>
        <div className="kpi-label">Arrecadado</div>
      </div>
      <div className="kpi-card kpi-money-pending">
        <IoWalletOutline className="kpi-icon" />
        <div className="kpi-value">{money(stats.aReceber)}</div>
        <div className="kpi-label">A receber (reservas)</div>
      </div>
      <div className="kpi-card kpi-barris">
        <IoBeer className="kpi-icon" />
        <div className="kpi-value">{stats.barris}</div>
        <div className="kpi-label">Barris de chopp</div>
      </div>
    </div>
  );
}
