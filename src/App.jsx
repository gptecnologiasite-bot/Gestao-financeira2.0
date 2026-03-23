import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/Layout/MainLayout';
import Dashboard from './pages/Dashboard';
import Financeiro from './pages/Financeiro';
import Membros from './pages/Membros';
import Ministerios from './pages/Ministerios';
import Patrimonio from './pages/Patrimonio';
import Relatorios from './pages/Relatorios';
import Configuracoes from './pages/Configuracoes';
import Visitantes from './pages/Visitantes';
import Usuarios from './pages/Usuarios';
import Login from './pages/Login';
import Registro from './pages/Registro';
import PortalTransparencia from './pages/PortalTransparencia';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/portal-transparencia" element={<PortalTransparencia />} />

        {/* Protected Routes */}
        <Route element={<PrivateRoute />}>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="financeiro" element={<Financeiro />} />
            <Route path="membros" element={<Membros />} />
            <Route path="visitantes" element={<Visitantes />} />
            <Route path="ministerios" element={<Ministerios />} />
            <Route path="patrimonio" element={<Patrimonio />} />
            <Route path="relatorios" element={<Relatorios />} />
            <Route element={<PrivateRoute requiredPermission="configuracoes" />}>
                <Route path="configuracoes" element={<Configuracoes />} />
            </Route>
            
            {/* Admin or Specific Permission Routes */}
            <Route element={<PrivateRoute requiredPermission="usuarios" />}>
                <Route path="usuarios" element={<Usuarios />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
