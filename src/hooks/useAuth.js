import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const SESSION_KEY = 'baile-do-chopp:sessao';

function loadSession() {
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    return null;
  }
}

// Autenticação simples via função RPC no Postgres (ver supabase/migration_002).
// A senha nunca fica exposta pela API REST: só a função `login` (security
// definer) consegue comparar o hash. A sessão local só guarda id/username/
// is_admin, nunca a senha.
export function useAuth() {
  const [usuario, setUsuario] = useState(loadSession);

  useEffect(() => {
    try {
      if (usuario) {
        window.localStorage.setItem(SESSION_KEY, JSON.stringify(usuario));
      } else {
        window.localStorage.removeItem(SESSION_KEY);
      }
    } catch (err) {
      console.warn('Não foi possível salvar a sessão', err);
    }
  }, [usuario]);

  const login = useCallback(async (username, password) => {
    const { data, error } = await supabase.rpc('login', {
      p_username: username,
      p_password: password,
    });
    if (error) {
      return { ok: false, message: 'Erro ao conectar. Tente novamente.' };
    }
    if (!data || data.length === 0) {
      return { ok: false, message: 'Usuário ou senha inválidos.' };
    }
    setUsuario(data[0]);
    return { ok: true, usuario: data[0] };
  }, []);

  const logout = useCallback(() => {
    setUsuario(null);
  }, []);

  const criarUsuario = useCallback(async (username, password) => {
    const { data, error } = await supabase.rpc('criar_usuario', {
      p_username: username,
      p_password: password,
    });
    if (error) {
      const message = /duplicate|unique/i.test(error.message)
        ? 'Já existe um usuário com esse nome.'
        : 'Erro ao criar usuário. Tente novamente.';
      return { ok: false, message };
    }
    return { ok: true, usuario: data?.[0] };
  }, []);

  const listarUsuarios = useCallback(async () => {
    const { data, error } = await supabase.rpc('listar_usuarios');
    if (error) {
      return { ok: false, message: error.message };
    }
    return { ok: true, usuarios: data || [] };
  }, []);

  return { usuario, login, logout, criarUsuario, listarUsuarios };
}
