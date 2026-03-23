import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function PrivateRoute({ adminOnly = false, requiredPermission = null }) {
  const { user, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Se for admin, sempre tem acesso
  if (isAdmin) return <Outlet />;

  // Se exigir admin e não for admin, bloqueia
  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  // Se exigir permissão específica e não tiver, bloqueia
  if (requiredPermission && !user?.permissoes?.[requiredPermission]) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
