import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useUser, useAuth } from '@clerk/clerk-react';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const location = useLocation();
  
  // 1. Récupération de l'état d'authentification Clerk
  const { user, isLoaded } = useUser();
  const { isSignedIn } = useAuth();

  // Attendre le chargement de la session Clerk
  if (!isLoaded) {
    return (
      <div className="h-screen bg-slate-900 flex items-center justify-center text-white font-bold">
        Chargement de la session...
      </div>
    );
  }

  // 2. Extraire les rôles (Priorité Clerk -> puis localStorage)
  const tokenLocal = localStorage.getItem('token');
  const roleLocal = localStorage.getItem('userRole');
  
  const isAuthenticated = isSignedIn || !!tokenLocal;
  const role = user?.publicMetadata?.role || roleLocal || 'Visiteur';
  const userService = String(
    user?.publicMetadata?.service || localStorage.getItem('userService') || '5'
  ).toLowerCase();

  // 3. Redirection si l'utilisateur n'est pas authentifié
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 4. Vérification du rôle global (Admin, Agent, Visiteur)
  if (allowedRoles && !allowedRoles.includes(role)) {
    // Si pas autorisé, on redirige vers son espace plutôt que d'expulser vers /login
    return <Navigate to={role === 'Visiteur' ? "/mon-espace" : "/agent-dashboard"} replace />;
  }

  // 5. AIGUILLAGE SPÉCIFIQUE AGENT :
  // Si un Agent tente d'accéder au tableau de bord général (/dashboard)
  if ((role === 'Agent' || role === '2') && location.pathname === '/dashboard') {
    // Seul le Secrétariat (5) a le droit de rester sur /dashboard
    if (userService !== '5' && userService !== 'secretariat') {
      return <Navigate to="/agent-dashboard" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;