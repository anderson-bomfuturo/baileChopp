import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const TABLE = 'configuracoes';
const ROW_ID = 'geral';

function rowToConfig(row) {
  return {
    pixKey: row?.pix_key || '',
    pixNome: row?.pix_nome || '',
    pixCidade: row?.pix_cidade || '',
  };
}

// Chave Pix cadastrada pelo administrador (tela de Administração), lida aqui
// pela tela de reservas para gerar o QR Code de pagamento. Sincroniza em
// tempo real: se o admin trocar a chave, o popup de reserva já usa a nova.
export function usePixConfig() {
  const [config, setConfig] = useState({ pixKey: '', pixNome: '', pixCidade: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const { data } = await supabase.from(TABLE).select('*').eq('id', ROW_ID).maybeSingle();
      if (cancelled) return;
      if (data) setConfig(rowToConfig(data));
      setLoading(false);
    }
    load();

    const channel = supabase
      .channel('configuracoes-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: TABLE, filter: `id=eq.${ROW_ID}` },
        (payload) => {
          if (payload.new) setConfig(rowToConfig(payload.new));
        }
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, []);

  const salvarConfig = useCallback(async (next) => {
    const { error } = await supabase.from(TABLE).upsert(
      {
        id: ROW_ID,
        pix_key: next.pixKey || null,
        pix_nome: next.pixNome || null,
        pix_cidade: next.pixCidade || null,
      },
      { onConflict: 'id' }
    );
    if (!error) setConfig(next);
    return { ok: !error, message: error?.message };
  }, []);

  return { config, loading, salvarConfig };
}
