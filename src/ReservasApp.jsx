import React, { useCallback, useState } from 'react';
import TableMap from './components/TableMap';
import MesaModal from './components/MesaModal';
import ConfirmDialog from './components/ConfirmDialog';
import Kpis from './components/Kpis';
import Legend from './components/Legend';
import { useMesasState } from './hooks/useMesasState';
import { STATUS } from './data/statusConfig';
import logoTitulo from './imagens/logotipo_titulo.png';

export default function ReservasApp({ usuario, onLogout }) {
  const { mesas, getMesa, saveMesa, resetMesa, loading, error } = useMesasState();
  const [mesaSelecionada, setMesaSelecionada] = useState(null);
  const [mesaParaConfirmar, setMesaParaConfirmar] = useState(null);

  const handleSelectMesa = useCallback(
    (mesaId) => {
      const status = getMesa(mesaId).status || STATUS.LIVRE;
      if (status === STATUS.LIVRE) {
        setMesaSelecionada(mesaId);
      } else {
        setMesaParaConfirmar(mesaId);
      }
    },
    [getMesa]
  );

  const numeroParaConfirmar = mesaParaConfirmar ? Number(mesaParaConfirmar.match(/(\d+)$/)?.[1]) : null;
  const mesaConfirmarData = mesaParaConfirmar ? getMesa(mesaParaConfirmar) : null;

  return (
    <div className="app">
      <header className="app-header">
        <img src={logoTitulo} alt="Baile do Chopp" className="app-logo-title" />
        <p>Mapa de reservas de mesas</p>
        {usuario && (
          <div className="session-bar">
            <span>Olá, {usuario.username}</span>
            <button type="button" className="session-logout" onClick={onLogout}>
              Sair
            </button>
          </div>
        )}
      </header>

      <main className="app-main">
        {error && (
          <div className="connection-banner">
            Não foi possível conectar ao banco de dados. Verifique a configuração do Supabase. ({error})
          </div>
        )}
        {loading && <div className="syncing-banner">Sincronizando reservas…</div>}
        <TableMap mesas={mesas} onSelectMesa={handleSelectMesa} />
        <Legend />
        <Kpis mesas={mesas} />
      </main>

      {mesaParaConfirmar && (
        <ConfirmDialog
          title={`Mesa ${numeroParaConfirmar}`}
          message="Essa mesa já tem uma reserva. Deseja editar?"
          details={[
            { label: 'Cliente', value: mesaConfirmarData.comprador || '—' },
            { label: 'Barris de chopp', value: mesaConfirmarData.barris || '0' },
          ]}
          confirmLabel="Sim"
          cancelLabel="Não"
          onConfirm={() => {
            setMesaSelecionada(mesaParaConfirmar);
            setMesaParaConfirmar(null);
          }}
          onCancel={() => setMesaParaConfirmar(null)}
        />
      )}

      {mesaSelecionada && (
        <MesaModal
          mesaId={mesaSelecionada}
          mesaData={getMesa(mesaSelecionada)}
          onSave={saveMesa}
          onReset={resetMesa}
          onClose={() => setMesaSelecionada(null)}
        />
      )}
    </div>
  );
}
