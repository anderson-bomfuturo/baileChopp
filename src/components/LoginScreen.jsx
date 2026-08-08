import React, { useState } from 'react';
import logoTitulo from '../imagens/logotipo_titulo.png';

export default function LoginScreen({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!username || !password) return;
    setLoading(true);
    setError('');
    const result = await onLogin(username, password);
    setLoading(false);
    if (!result.ok) {
      setError(result.message);
    }
  }

  return (
    <div className="login-screen">
      <form className="login-card" onSubmit={handleSubmit}>
        <img src={logoTitulo} alt="Baile do Chopp" className="login-logo" />
        <h1 className="login-title">Entrar</h1>
        <p className="login-subtitle">Acesse com seu usuário e senha para gerenciar as reservas.</p>

        <label className="field">
          <span>Usuário</span>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Seu usuário"
            autoFocus
            autoCapitalize="none"
          />
        </label>

        <label className="field">
          <span>Senha</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Sua senha"
          />
        </label>

        {error && <div className="login-error">{error}</div>}

        <button type="submit" className="btn btn-confirm" disabled={loading}>
          {loading ? 'Entrando…' : 'Entrar'}
        </button>
      </form>
    </div>
  );
}
