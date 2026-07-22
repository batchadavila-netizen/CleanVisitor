import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import React, { useEffect } from 'react';

// Pages
import LandingPage from './pages/LandingPage/LandingPage';
import Login from './pages/LoginPage/Login';
import Inscription from './pages/InscriptionPage/Inscription';
import Dashboard from './pages/Dashboard';
import VisitorsList from './pages/VisitorsList';
import VisiteurDashboard from './pages/VisiteurDashboard';

// Composants
import ProtectedRoute from './components/ProtectedRoute';
import AdminValidation from './components/AdminValidation'; 
import CreateVisit from './components/CreateVisit'; 
// import AgentVisits from './components/AgentVisits';
import Profile from './components/Profile';
import CreateVisitModal from './components/CreateVisitModal';
import ResetPasswordPage from './components/MotDePasseOublier/ResetPasswordPage';
import ForgotPasswordForm from './components/MotDePasseOublier/ForgotPasswordForm';

// Services
import { startSignalRConnection } from './services/signalRService';

function App() {
  useEffect(() => {
    startSignalRConnection();
  }, []);

  return (
    <Router>
      <Routes>
        {/* --- ROUTES PUBLIQUES --- */}
        <Route path="/" element={<Navigate to="/LandingPage" />} />
        <Route path="/LandingPage" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/Inscription" element={<Inscription />} />

        {/* --- ROUTES ADMIN & AGENT --- */}
        <Route path="/dashboard" element={
          <ProtectedRoute allowedRoles={['Admin', 'Agent']}>
            <Dashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/visitors" element={
          <ProtectedRoute allowedRoles={['Admin', 'Agent']}>
            <VisitorsList />
          </ProtectedRoute>
        } />

        <Route path="/validate-visits" element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <AdminValidation />
          </ProtectedRoute>
        } />

        {/* --- ROUTES VISITEUR (ESPACE PERSONNEL) --- */}
        <Route path="/mon-espace" element={
          <ProtectedRoute allowedRoles={['Visiteur']}>
            <VisiteurDashboard />
          </ProtectedRoute>
        } />

        {/* --- ROUTES PARTAGÉES (MODIFICATION / CRÉATION) --- */}
        
        {/* Cette route doit être accessible aux deux pour permettre la reprogrammation */}
        <Route path="/create-visit" element={
          <ProtectedRoute allowedRoles={['Admin','Agent', 'Visiteur']}>
            <CreateVisit />
          </ProtectedRoute>
        } />

        <Route path="/visit-modal" element={
          <ProtectedRoute allowedRoles={['Visiteur']}>
            <CreateVisitModal/>
          </ProtectedRoute>
        } />

        {/* Route Profil Unique pour tous les rôles */}
        <Route path="/profile" element={
          <ProtectedRoute allowedRoles={['Admin', 'Agent', 'Visiteur']}>
            <Profile />
          </ProtectedRoute>
        } />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordForm />} />

        {/* --- FALLBACK (Redirection si route inconnue) --- */}
        <Route path="*" element={<Navigate to="/LandingPage" />} />
      </Routes>
    </Router>
  );
}

export default App;