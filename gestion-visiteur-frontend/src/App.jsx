import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage/LandingPage';
import Login from './pages/LoginPage/Login';
import Inscription from './pages/InscriptionPage/Inscription';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import VisitorsList from './pages/VisitorsList';

// AJOUTE CET IMPORT ICI (Vérifie bien le chemin vers ton fichier UserVisits)
import UserVisits from './pages/UserVisits'; 

// Tes composants (Vérifie que le chemin ./components/... est correct)
import AdminValidation from './components/AdminValidation'; 
import CreateVisit from './components/CreateVisit'; 
import AgentVisits from './components/AgentVisits';
import CreateVisitModal from './components/CreateVisitModal';
function App() {
  return (
    <Router>
      <Routes>
        {/* Routes Publiques */}
        <Route path="/" element={<Navigate to="/LandingPage" />} />
        <Route path="/LandingPage" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/Inscription" element={<Inscription />} />

        {/* Routes Admin & Agent */}
        <Route path="/dashboard" element={
          <ProtectedRoute allowedRoles={['Admin']}>
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
        <Route path="/agent-visit" element={
          <ProtectedRoute allowedRoles={['Agent']}>
            <AgentVisits />
          </ProtectedRoute>
        } />

        {/* Routes Visiteur */}
        <Route path="/create-visit" element={
          <ProtectedRoute allowedRoles={['Visiteur']}>
            <CreateVisit />
          </ProtectedRoute>
        } />
         <Route path="/create-visit-modal" element={
          <ProtectedRoute allowedRoles={['Visiteur']}>
            <CreateVisitModal />
          </ProtectedRoute>
        } />

        {/* Route Historique Visiteur */}
        <Route path="/my-visits" element={
          <ProtectedRoute allowedRoles={['Visiteur']}>
            <UserVisits /> 
          </ProtectedRoute>
        } />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/LandingPage" />} />
      </Routes>
    </Router>
  );
}

export default App;