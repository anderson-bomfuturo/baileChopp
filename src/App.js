import React from 'react';
import './App.css';
import LoginScreen from './components/LoginScreen';
import AdminUsersScreen from './components/AdminUsersScreen';
import ReservasApp from './ReservasApp';
import { useAuth } from './hooks/useAuth';

function App() {
  const { usuario, login, logout, criarUsuario, listarUsuarios } = useAuth();

  if (!usuario) {
    return <LoginScreen onLogin={login} />;
  }

  if (usuario.is_admin) {
    return (
      <AdminUsersScreen
        usuario={usuario}
        onLogout={logout}
        criarUsuario={criarUsuario}
        listarUsuarios={listarUsuarios}
      />
    );
  }

  return <ReservasApp usuario={usuario} onLogout={logout} />;
}

export default App;
