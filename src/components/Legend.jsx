import React from 'react';
import { STATUS_CONFIG, STATUS_LIST } from '../data/statusConfig';
import { STATUS_ICONS } from '../data/statusIcons';

export default function Legend() {
  return (
    <div className="legend">
      {STATUS_LIST.map((s) => {
        const { icon: Icon, color } = STATUS_ICONS[s];
        return (
          <div className="legend-item" key={s}>
            <span className="legend-swatch" style={{ background: STATUS_CONFIG[s].color }}>
              <Icon style={{ color }} />
            </span>
            <span>{STATUS_CONFIG[s].label}</span>
          </div>
        );
      })}
    </div>
  );
}
