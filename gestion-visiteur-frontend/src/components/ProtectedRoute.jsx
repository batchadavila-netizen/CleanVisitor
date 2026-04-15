import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const role = localStorage.getItem('userRole');

  if (!role) return <Navigate to="/login" />; // Pas connecté ? -> Login
  if (!allowedRoles.includes(role)) return <Navigate to="/unauthorized" />; // Pas le bon rôle ?

  return children;
};

export default ProtectedRoute;