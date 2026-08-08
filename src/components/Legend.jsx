import React from 'react';
import { STATUS_CONFIG, STATUS_LIST } from '../data/statusConfig';

export default function Legend() {
  return (
    <div className="legend">
      {STATUS_LIST.map((s) => (
        <div className="legend-item" key={s}>
          <span className="legend-swatch" style={{ background: STATUS_CONFIG[s].color }} />
          <span>{STATUS_CONFIG[s].label}</span>
        </div>
      ))}
    </div>
  );
}
