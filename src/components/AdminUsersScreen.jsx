import React, { useCallback, useEffect, useState } from 'react';
import logoTitulo from '../imagens/logotipo_titulo.png';
import { usePixConfig } from '../hooks/usePixConfig';

export default function AdminUsersScreen({ usuario, onLogout, criarUsuario, listarUsuarios }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);
  const [usuarios, setUsuarios] = useState([]);
  const [carregandoLista, setCarregandoLista] = useState(true);

  const { config: pixConfig, loading: carregandoPix, salvarConfig } = usePixConfig();
  const [pixForm, setPixForm] = useState(pixConfig);
  const [pixFeedback, setPixFeedback] = useState(null);
  const [salvandoPix, setSalvandoPix] = useState(false);

  useEffect(() => {
    setPixForm(pixConfig);
  }, [pixConfig]);

  async function handleSalvarPix(e) {
    e.preventDefault();
    setSalvandoPix(true);
    setPixFeedback(null);
    const result = await salvarConfig(pixForm);
    setSalvandoPix(false);
    setPixFeedback(
      result.ok
        ? { type: 'success', message: 'Chave Pix salva com sucesso.' }
        : { type: 'error', message: result.message || 'Erro ao salvar. Tente novamente.' }
    );
  }

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
        <form className="admin-card" onSubmit={handleSalvarPix}>
          <h2 className="admin-card-title">Configuração Pix</h2>
          <p className="modal-subtitle">
            Usada para gerar o QR Code de pagamento no popup de reserva. Sem esses dados o botão de Pix fica
            oculto.
          </p>

          {carregandoPix ? (
            <p className="modal-subtitle">Carregando…</p>
          ) : (
            <>
              <label className="field">
                <span>Chave Pix</span>
                <input
                  type="text"
                  value={pixForm.pixKey}
                  onChange={(e) => setPixForm((f) => ({ ...f, pixKey: e.target.value }))}
                  placeholder="CPF/CNPJ, e-mail, telefone ou chave aleatória"
                />
              </label>

              <label className="field">
                <span>Nome do recebedor</span>
                <input
                  type="text"
                  value={pixForm.pixNome}
                  onChange={(e) => setPixForm((f) => ({ ...f, pixNome: e.target.value }))}
                  placeholder="Ex: Leomar da Silva"
                  maxLength={25}
                />
              </label>

              <label className="field">
                <span>Cidade do recebedor</span>
                <input
                  type="text"
                  value={pixForm.pixCidade}
                  onChange={(e) => setPixForm((f) => ({ ...f, pixCidade: e.target.value }))}
                  placeholder="Ex: Sao Paulo"
                  maxLength={15}
                />
              </label>

              {pixFeedback && (
                <div className={pixFeedback.type === 'success' ? 'login-success' : 'login-error'}>
                  {pixFeedback.message}
                </div>
              )}

              <button type="submit" className="btn btn-confirm" disabled={salvandoPix}>
                {salvandoPix ? 'Salvando…' : 'Salvar chave Pix'}
              </button>
            </>
          )}
        </form>

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
