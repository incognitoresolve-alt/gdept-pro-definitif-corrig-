import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, requireSuperAdmin = false }) {
  const { firebaseUser, userDoc, loading, isSuperAdmin } = useAuth();

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--brand-violet)' }}>
        <div style={{ color: 'var(--accent)', fontFamily: 'var(--font-head)', fontSize: 13, letterSpacing: 2 }}>Chargement…</div>
      </div>
    );
  }

  if (!firebaseUser || !userDoc) return <Navigate to="/connexion" replace />;
  if (requireSuperAdmin && !isSuperAdmin) return <Navigate to="/app" replace />;

  return children;
}
