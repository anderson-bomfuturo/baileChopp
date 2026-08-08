import React, { useCallback, useState } from 'react';
import './App.css';
import TableMap from './components/TableMap';
import MesaModal from './components/MesaModal';
import Kpis from './components/Kpis';
import Legend from './components/Legend';
import { useMesasState } from './hooks/useMesasState';
import logoTitulo from './imagens/logotipo_titulo.png';

function App() {
  const { mesas, getMesa, saveMesa, resetMesa, loading, error } = useMesasState();
  const [mesaSelecionada, setMesaSelecionada] = useState(null);

  const handleSelectMesa = useCallback((mesaId) => {
    setMesaSelecionada(mesaId);
  }, []);

  return (
    <div className="app">
      <header className="app-header">
        <img src={logoTitulo} alt="Baile do Chopp" className="app-logo-title" />
        <p>Mapa de reservas de mesas</p>
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

export default App;
