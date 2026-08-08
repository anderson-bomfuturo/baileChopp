import React, { useCallback, useEffect, useState } from 'react';
import logoTitulo from '../imagens/logotipo_titulo.png';

export default function AdminUsersScreen({ usuario, onLogout, criarUsuario, listarUsuarios }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);
  const [usuarios, setUsuarios] = useState([]);
  const [carregandoLista, setCarregandoLista] = useState(true);

  const carregarUsuarios = useCallback(async () => {
    setCarregandoLista(true);
    const result = await listarUsuarios();
    if (result.ok) setUsuarios(result.usuarios);
    setCarregandoLista(false);
  }, [listarUsuarios]);

  useEffect(() => {
    carregarUsuarios();
  }, [carregarUsuarios]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!username || !password) return;
    setLoading(true);
    setFeedback(null);
    const result = await criarUsuario(username, password);
    setLoading(false);
    if (result.ok) {
      setFeedback({ type: 'success', message: `Usuário "${username}" criado com sucesso.` });
      setUsername('');
      setPassword('');
      carregarUsuarios();
    } else {
      setFeedback({ type: 'error', message: result.message });
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <img src={logoTitulo} alt="Baile do Chopp" className="app-logo-title" />
        <p>Administração de usuários</p>
        <div className="session-bar">
          <span>Olá, {usuario.username}</span>
          <button type="button" className="session-logout" onClick={onLogout}>
            Sair
          </button>
        </div>
      </header>

      <main className="app-main">
        <form className="admin-card" onSubmit={handleSubmit}>
          <h2 className="admin-card-title">Cadastrar novo usuário</h2>
          <p className="modal-subtitle">
            Usuários cadastrados aqui acessam direto a tela de reservas ao entrar.
          </p>

          <label className="field">
            <span>Usuário</span>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Ex: joao"
              autoCapitalize="none"
            />
          </label>

          <label className="field">
            <span>Senha</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Defina uma senha"
            />
          </label>

          {feedback && (
            <div className={feedback.type === 'success' ? 'login-success' : 'login-error'}>
              {feedback.message}
            </div>
          )}

          <button type="submit" className="btn btn-confirm" disabled={loading}>
            {loading ? 'Criando…' : '+ Criar usuário'}
          </button>
        </form>

        <div className="admin-card">
          <h2 className="admin-card-title">Usuários cadastrados</h2>
          {carregandoLista ? (
            <p className="modal-subtitle">Carregando…</p>
          ) : (
            <ul className="admin-user-list">
              {usuarios.map((u) => (
                <li key={u.id} className="admin-user-item">
                  <span>{u.username}</span>
                  {u.is_admin && <span className="admin-badge">Administrador</span>}
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}
