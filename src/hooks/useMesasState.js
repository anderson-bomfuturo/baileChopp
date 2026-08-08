import { useCallback, useEffect, useRef, useState } from 'react';
import { STATUS } from '../data/statusConfig';
import { supabase } from '../lib/supabaseClient';

const TABLE = 'reservas';

function rowToMesa(row) {
  return {
    status: row.status || STATUS.LIVRE,
    comprador: row.comprador || '',
    telefone: row.telefone || '',
    valor: row.valor != null ? String(row.valor) : '',
    observacao: row.observacao || '',
    comprovanteCodigo: row.comprovante_codigo || '',
    updatedAt: row.updated_at,
  };
}

function getNumero(id) {
  const match = id.match(/(\d+)$/);
  return match ? Number(match[1]) : 0;
}

// O cliente do supabase-js pode ficar pendurado indefinidamente (nunca
// resolve nem rejeita) quando o projeto está incontactável — ex: URL/chave
// erradas ou projeto pausado. Sem um timeout, a tela fica presa em
// "Sincronizando..." para sempre.
function withTimeout(promise, ms, message) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error(message)), ms)),
  ]);
}

// Estado das mesas sincronizado com a tabela `reservas` no Supabase, com
// realtime: várias telas/dispositivos gerenciando o evento ao mesmo tempo
// veem as reservas uns dos outros na hora.
export function useMesasState() {
  const [mesas, setMesas] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const mesasRef = useRef(mesas);
  mesasRef.current = mesas;

  useEffect(() => {
    let cancelled = false;

    async function loadInitial() {
      try {
        const { data, error: fetchError } = await withTimeout(
          supabase.from(TABLE).select('*'),
          10000,
          'Tempo esgotado ao conectar no Supabase. Verifique a URL/chave configuradas.'
        );
        if (cancelled) return;
        if (fetchError) throw fetchError;
        const next = {};
        (data || []).forEach((row) => {
          next[row.mesa_id] = rowToMesa(row);
        });
        setMesas(next);
      } catch (err) {
        if (cancelled) return;
        console.error('Erro ao carregar reservas do Supabase', err);
        setError(err.message || 'Falha de conexão');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadInitial();

    const channel = supabase
      .channel('reservas-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: TABLE }, (payload) => {
        if (payload.eventType === 'DELETE') {
          setMesas((prev) => {
            const next = { ...prev };
            delete next[payload.old.mesa_id];
            return next;
          });
          return;
        }
        const row = payload.new;
        setMesas((prev) => ({ ...prev, [row.mesa_id]: rowToMesa(row) }));
      })
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, []);

  const getMesa = useCallback(
    (id) => mesas[id] || { status: STATUS.LIVRE, comprador: '', telefone: '', valor: '', observacao: '' },
    [mesas]
  );

  const saveMesa = useCallback(async (id, data) => {
    // Atualização otimista: a UI reage na hora, o realtime confirma depois.
    setMesas((prev) => ({ ...prev, [id]: { ...data, updatedAt: new Date().toISOString() } }));

    try {
      const { error: upsertError } = await withTimeout(
        supabase.from(TABLE).upsert(
          {
            mesa_id: id,
            numero: getNumero(id),
            status: data.status,
            comprador: data.comprador || null,
            telefone: data.telefone || null,
            valor: data.valor === '' || data.valor == null ? null : Number(data.valor),
            observacao: data.observacao || null,
            comprovante_codigo: data.comprovanteCodigo || null,
          },
          { onConflict: 'mesa_id' }
        ),
        10000,
        'Tempo esgotado ao salvar no Supabase.'
      );
      if (upsertError) throw upsertError;
    } catch (err) {
      console.error('Erro ao salvar reserva no Supabase', err);
      setError(err.message);
    }
  }, []);

  const resetMesa = useCallback(async (id) => {
    setMesas((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });

    try {
      const { error: deleteError } = await withTimeout(
        supabase.from(TABLE).delete().eq('mesa_id', id),
        10000,
        'Tempo esgotado ao liberar mesa no Supabase.'
      );
      if (deleteError) throw deleteError;
    } catch (err) {
      console.error('Erro ao liberar mesa no Supabase', err);
      setError(err.message);
    }
  }, []);

  return { mesas, getMesa, saveMesa, resetMesa, loading, error };
}
