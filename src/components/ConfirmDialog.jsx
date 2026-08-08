import React from 'react';

export default function ConfirmDialog({
  title,
  message,
  details,
  confirmLabel = 'Sim',
  cancelLabel = 'Não',
  onConfirm,
  onCancel,
}) {
  return (
    <div className="confirm-overlay" onClick={onCancel}>
      <div className="confirm-card" onClick={(e) => e.stopPropagation()}>
        <div className="confirm-icon">🍺</div>
        {title && <h2 className="confirm-title">{title}</h2>}
        <p className="confirm-message">{message}</p>
        {details && details.length > 0 && (
          <div className="confirm-details">
            {details.map(({ label, value }) => (
              <div className="confirm-detail-row" key={label}>
                <span>{label}</span>
                <strong>{value}</strong>
              </div>
            ))}
          </div>
        )}
        <div className="confirm-actions">
          <button type="button" className="btn btn-outline" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button type="button" className="btn btn-confirm" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
