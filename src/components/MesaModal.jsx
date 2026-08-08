import React, { useEffect, useState } from 'react';
import { STATUS, STATUS_CONFIG, STATUS_LIST } from '../data/statusConfig';
import { buildWhatsappMessage, openWhatsapp } from '../utils/whatsapp';
import { gerarComprovante, baixarComprovante } from '../utils/receipt';

export default function MesaModal({ mesaId, mesaData, onSave, onReset, onClose }) {
  const numero = mesaId.match(/(\d+)$/)?.[1] ? String(Number(mesaId.match(/(\d+)$/)[1])) : mesaId;

  const [status, setStatus] = useState(mesaData.status || STATUS.LIVRE);
  const [comprador, setComprador] = useState(mesaData.comprador || '');
  const [telefone, setTelefone] = useState(mesaData.telefone || '');
  const [valor, setValor] = useState(mesaData.valor || '');
  const [observacao, setObservacao] = useState(mesaData.observacao || '');
  const [comprovante, setComprovante] = useState(null);

  useEffect(() => {
    setComprovante(null);
  }, [status]);

  const isNovaReserva = (mesaData.status || STATUS.LIVRE) === STATUS.LIVRE;
  const precisaValor = status === STATUS.RESERVADO || status === STATUS.PAGO;

  function handleClose(e) {
    if (e) e.stopPropagation();
    onClose();
  }

  function handleSalvar() {
    onSave(mesaId, { status, comprador, telefone, valor, observacao, comprovanteCodigo: comprovante?.codigo });
  }

  function handleGerarComprovante() {
    const result = gerarComprovante({ numero, comprador, valor, mesaId });
    setComprovante(result);
    return result;
  }

  function handleEnviarWhatsapp() {
    let comprovanteCodigo = comprovante?.codigo;
    if (status === STATUS.PAGO && !comprovante) {
      const result = handleGerarComprovante();
      comprovanteCodigo = result.codigo;
    }

    onSave(mesaId, { status, comprador, telefone, valor, observacao, comprovanteCodigo });

    const message = buildWhatsappMessage({
      numero,
      status,
      comprador,
      valor,
      observacao,
      comprovanteCodigo,
    });
    openWhatsapp({ telefone, message });
  }

  function handleBaixarComprovante() {
    const c = comprovante || handleGerarComprovante();
    baixarComprovante(c.dataUrl, `comprovante-mesa-${numero}.png`);
  }

  function handleLiberarMesa() {
    onReset(mesaId);
    onClose();
  }

  const cfg = STATUS_CONFIG[status];

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header" style={{ background: cfg.color, color: cfg.textColor }}>
          <div>
            <div className="modal-header-eyebrow">Mesa</div>
            <div className="modal-header-title">Nº {numero}</div>
          </div>
          <button className="modal-close" onClick={handleClose} aria-label="Fechar">
            ×
          </button>
        </div>

        <div className="modal-body">
          <p className="modal-subtitle">
            {isNovaReserva ? 'Esta mesa está livre. Cadastre a reserva abaixo.' : 'Edite os dados desta mesa.'}
          </p>

          <label className="field">
            <span>Status</span>
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              {STATUS_LIST.map((s) => (
                <option key={s} value={s}>
                  {STATUS_CONFIG[s].emoji} {STATUS_CONFIG[s].label}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Nome do comprador</span>
            <input
              type="text"
              value={comprador}
              onChange={(e) => setComprador(e.target.value)}
              placeholder="Ex: João da Silva"
            />
          </label>

          <label className="field">
            <span>WhatsApp do cliente</span>
            <input
              type="tel"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              placeholder="(11) 91234-5678"
            />
          </label>

          {precisaValor && (
            <label className="field">
              <span>Valor {status === STATUS.PAGO ? 'pago' : 'a pagar'} (R$)</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                placeholder="0,00"
              />
            </label>
          )}

          <label className="field">
            <span>Observações</span>
            <textarea
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              placeholder="Opcional"
              rows={2}
            />
          </label>

          {status === STATUS.PAGO && (
            <div className="receipt-box">
              <button type="button" className="btn btn-ghost" onClick={handleGerarComprovante}>
                🧾 Gerar comprovante
              </button>
              {comprovante && (
                <div className="receipt-preview">
                  <img src={comprovante.dataUrl} alt="Comprovante de pagamento" />
                  <button type="button" className="btn btn-ghost" onClick={handleBaixarComprovante}>
                    ⬇️ Baixar comprovante
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="modal-footer">
          {!isNovaReserva && (
            <button type="button" className="btn btn-outline" onClick={handleLiberarMesa}>
              Liberar mesa
            </button>
          )}
          <button type="button" className="btn btn-outline" onClick={handleSalvar}>
            Salvar
          </button>
          <button type="button" className="btn btn-whatsapp" onClick={handleEnviarWhatsapp}>
            📲 Enviar WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
}
