import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

// CORRECTION : On récupère pendingVisits ici
const Sidebar = ({ isOpen, toggleSidebar, pendingVisits = 0 }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Utilisation de userRole pour Admin/Agent et role pour Visiteur selon ton stockage
  const role = localStorage.getItem('userRole') || 'Visiteur';
  const userName = localStorage.getItem('userName') || 'Utilisateur';

  const menuItems = [
    { name: 'Tableau de bord', path: '/dashboard', icon: '📊', roles: ['Admin' , 'Agent'] },
    { name: 'Liste Visiteurs', path: '/visitors', icon: '👥', roles: ['Admin', 'Agent'] },
    { 
      name: 'Valider Visites', 
      path: '/validate-visits', 
      icon: '⚖️', 
      roles: ['Admin'],
      showBadge: true // On active le badge pour ce menu
    },
    { 
      name: 'Mes Visites', 
      path: '/mon-espace', 
      icon: '📜', 
      roles: ['Visiteur'],
      showBadge: true // On active le badge pour ce menu
    },
    { name: 'Mon Profil', path: '/profile', icon: '👤', roles: ['Admin', 'Agent', 'Visiteur'] },
    { name: 'Paramètres', path: '/settings', icon: '⚙️', roles: ['Admin', 'Agent', 'Visiteur'] },
  ];

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className={`${isOpen ? 'w-64' : 'w-20'} bg-slate-900 h-screen flex flex-col border-r border-slate-800 fixed left-0 top-0 z-50 transition-all duration-300`}>
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="bg-blue-600 min-w-[40px] h-10 rounded-xl flex items-center justify-center text-white font-black">
            DE
          </div>
          {isOpen && (
            <div className="whitespace-nowrap">
              <h2 className="text-white font-bold leading-tight">DAVILA</h2>
              <p className="text-slate-500 text-[10px] uppercase font-bold">Entreprise</p>
            </div>
          )}
        </div>
      </div>

      {/* Toggle Button */}
      <button 
        onClick={toggleSidebar}
        className="absolute -right-3 top-20 bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-[10px] shadow-lg border-2 border-slate-900 hover:scale-110 transition-transform z-10"
      >
        {isOpen ? '◀' : '▶'}
      </button>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-2 mt-4 overflow-y-auto overflow-x-hidden custom-scrollbar">
        {menuItems
          .filter(item => item.roles.includes(role))
          .map((item) => {
            const isActive = location.pathname === item.path;
            const hasNotification = item.showBadge && pendingVisits > 0;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group relative ${
                  isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                {isOpen && <span className="font-medium text-sm whitespace-nowrap flex-1">{item.name}</span>}
                
                {/* BADGE DE NOTIFICATION */}
                {hasNotification && (
                  <span className={`
                    ${isOpen ? 'relative' : 'absolute top-2 right-2'} 
                    bg-red-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full border-2 border-slate-900 animate-pulse
                  `}>
                    {pendingVisits}
                  </span>
                )}
              </Link>
            );
          })}
      </nav>

      {/* Profil Footer */}
      <div className="p-4 border-t border-slate-800 bg-slate-900/50">
        <div className="flex items-center gap-3 mb-4 px-1">
          <div className="min-w-[32px] h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-[10px] font-bold text-blue-400 border border-blue-500/30">
            {userName.charAt(0).toUpperCase()}
          </div>
          {isOpen && (
            <div className="overflow-hidden">
              <p className="text-white text-xs font-bold truncate">{userName}</p>
              <p className="text-blue-400 text-[10px] font-medium uppercase tracking-wider">{role}</p>
            </div>
          )}
        </div>
        
        <button onClick={handleLogout} className="w-full flex items-center gap-3 p-3 text-red-400 hover:bg-red-500/10 rounded-xl text-sm font-bold transition-colors">
          <span>🚪</span> {isOpen && "Déconnexion"}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;