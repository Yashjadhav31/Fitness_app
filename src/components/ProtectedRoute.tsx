import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { currentUser } = useAuth();

  const bypassAuth =
    import.meta.env.DEV && import.meta.env.VITE_BYPASS_AUTH !== 'false';

  if (!bypassAuth && !currentUser) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
}
