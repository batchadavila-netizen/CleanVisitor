import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const location = useLocation();
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('userRole');
  const userService = String(localStorage.getItem('userService') || '5').toLowerCase();

  // 1. Redirection si l'utilisateur n'est pas authentifié
  if (!token || !role) {
    return <Navigate to="/login" replace />;
  }

  // 2. Vérification du rôle global (Admin, Agent, Visiteur)
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/login" replace />;
  }

  // 3. AIGUILLAGE SPÉCIFIQUE AGENT :
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