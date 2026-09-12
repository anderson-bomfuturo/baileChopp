import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import {
  IoBeer,
  IoCloseOutline,
  IoLogoWhatsapp,
  IoReceiptOutline,
  IoDownloadOutline,
  IoCardOutline,
  IoCopyOutline,
} from 'react-icons/io5';
import { STATUS, STATUS_CONFIG, STATUS_LIST } from '../data/statusConfig';
import { BARRIS, calcularValorTotal, VALOR_MESA } from '../data/pricing';
import { buildWhatsappMessage, openWhatsapp } from '../utils/whatsapp';
import { gerarComprovante, baixarComprovante } from '../utils/receipt';
import { formatMoney } from '../utils/money';
import { buildPixPayload, isPixConfigured } from '../utils/pix';

export default function MesaModal({ mesaId, mesaData, pixConfig, onSave, onReset, onClose }) {
  const numero = mesaId.match(/(\d+)$/)?.[1] ? String(Number(mesaId.match(/(\d+)$/)[1])) : mesaId;

  const [status, setStatus] = useState(mesaData.status || STATUS.LIVRE);
  const [comprador, setComprador] = useState(mesaData.comprador || '');
  const [telefone, setTelefone] = useState(mesaData.telefone || '');
  const [valor, setValor] = useState(mesaData.valor || '');
  const [barril50, setBarril50] = useState(mesaData.barril50 || '');
  const [barril30, setBarril30] = useState(mesaData.barril30 || '');
  const [observacao, setObservacao] = useState(mesaData.observacao || '');
  const [comprovante, setComprovante] = useState(null);
  const [pix, setPix] = useState(null);
  const [gerandoPix, setGerandoPix] = useState(false);

  useEffect(() => {
    setComprovante(null);
    setPix(null);
  }, [status]);

  const isNovaReserva = (mesaData.status || STATUS.LIVRE) === STATUS.LIVRE;
  const precisaValor = status === STATUS.RESERVADO || status === STATUS.PAGO;

  // Enquanto a reserva não foi paga, o valor a pagar acompanha a mesa (R$200)
  // + os barris escolhidos. Depois de PAGO, o valor fica travado (o que foi
  // efetivamente recebido pode ter sido ajustado manualmente).
  useEffect(() => {
    if (status === STATUS.RESERVADO) {
      setValor(String(calcularValorTotal({ barril50, barril30 })));
    }
  }, [status, barril50, barril30]);

  useEffect(() => {
    setPix(null);
  }, [valor]);

  function handleClose(e) {
    if (e) e.stopPropagation();
    onClose();
  }

  function handleSalvar() {
    onSave(mesaId, {
      status,
      comprador,
      telefone,
      valor,
      barril50,
      barril30,
      observacao,
      comprovanteCodigo: comprovante?.codigo,
    });
    onClose();
  }

  function handleGerarComprovante() {
    const result = gerarComprovante({ numero, comprador, valor, barril50, barril30, mesaId });
    setComprovante(result);
    return result;
  }

  function handleEnviarWhatsapp() {
    let comprovanteCodigo = comprovante?.codigo;
    if (status === STATUS.PAGO && !comprovante) {
      const result = handleGerarComprovante();
      comprovanteCodigo = result.codigo;
    }

    onSave(mesaId, {
      status,
      comprador,
      telefone,
      valor,
      barril50,
      barril30,
      observacao,
      comprovanteCodigo,
    });

    const message = buildWhatsappMessage({
      numero,
      status,
      comprador,
      valor,
      barril50,
      barril30,
      observacao,
      comprovanteCodigo,
    });
    openWhatsapp({ telefone, message });
    onClose();
  }

  function handleBaixarComprovante() {
    const c = comprovante || handleGerarComprovante();
    baixarComprovante(c.dataUrl, `comprovante-mesa-${numero}.png`);
  }

  function handleLiberarMesa() {
    onReset(mesaId);
    onClose();
  }

  async function handleGerarPix() {
    const payload = buildPixPayload({ ...pixConfig, valor, txid: comprovante?.codigo || `MESA${numero}` });
    if (!payload) return;
    setGerandoPix(true);
    try {
      const qrDataUrl = await QRCode.toDataURL(payload, { width: 260, margin: 1 });
      setPix({ payload, qrDataUrl });
    } finally {
      setGerandoPix(false);
    }
  }

  async function handleCopiarPix() {
    if (!pix?.payload) return;
    try {
      await navigator.clipboard.writeText(pix.payload);
    } catch (err) {
      // Alguns navegadores/contextos bloqueiam a Clipboard API; o código
      // continua selecionável/copiável manualmente na tela.
    }
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
            <IoCloseOutline />
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

          <div className="field-group">
            <span className="field-group-label">
              <IoBeer /> Barril de chopp (opcional)
            </span>
            <label className="field field-barril">
              <span>{BARRIS.b50.label} — {formatMoney(BARRIS.b50.preco)}</span>
              <input
                type="number"
                min="0"
                step="1"
                value={barril50}
                onChange={(e) => setBarril50(e.target.value)}
                placeholder="0"
              />
            </label>
            <label className="field field-barril">
              <span>{BARRIS.b30.label} — {formatMoney(BARRIS.b30.preco)}</span>
              <input
                type="number"
                min="0"
                step="1"
                value={barril30}
                onChange={(e) => setBarril30(e.target.value)}
                placeholder="0"
              />
            </label>
          </div>

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
              <small className="field-hint">
                Mesa {formatMoney(VALOR_MESA)}
                {Number(barril50) > 0 && ` + ${Number(barril50)}x ${BARRIS.b50.label} (${formatMoney(BARRIS.b50.preco)})`}
                {Number(barril30) > 0 && ` + ${Number(barril30)}x ${BARRIS.b30.label} (${formatMoney(BARRIS.b30.preco)})`}
                {status === STATUS.RESERVADO && ' — calculado automaticamente, pode ajustar se precisar.'}
              </small>
            </label>
          )}

          {precisaValor && Number(valor) > 0 && (
            <div className="pix-box">
              {isPixConfigured(pixConfig) ? (
                <>
                  <button type="button" className="btn btn-ghost" onClick={handleGerarPix} disabled={gerandoPix}>
                    <IoCardOutline /> {gerandoPix ? 'Gerando...' : `Gerar QR Code Pix (${formatMoney(valor)})`}
                  </button>
                  {pix && (
                    <div className="pix-preview">
                      <img src={pix.qrDataUrl} alt="QR Code Pix" />
                      <button type="button" className="btn btn-ghost" onClick={handleCopiarPix}>
                        <IoCopyOutline /> Copiar código Pix
                      </button>
                      <textarea className="pix-copia-cola" readOnly rows={3} value={pix.payload} />
                    </div>
                  )}
                </>
              ) : (
                <p className="field-hint">
                  Chave Pix não configurada. Peça pro Administrador cadastrar em "Configuração Pix" na tela de
                  administração para habilitar o QR Code de pagamento.
                </p>
              )}
            </div>
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
                <IoReceiptOutline /> Gerar comprovante
              </button>
              {comprovante && (
                <div className="receipt-preview">
                  <img src={comprovante.dataUrl} alt="Comprovante de pagamento" />
                  <button type="button" className="btn btn-ghost" onClick={handleBaixarComprovante}>
                    <IoDownloadOutline /> Baixar comprovante
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
            <IoLogoWhatsapp /> Enviar WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
}
