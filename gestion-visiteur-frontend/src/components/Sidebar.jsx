import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const role = localStorage.getItem('userRole') || 'Visiteur';

  const menuItems = [
    { name: 'Tableau de bord', path: '/dashboard', icon: '📊', roles: ['Admin'] },
    { name: 'Liste Visiteurs', path: '/visitors', icon: '👥', roles: ['Admin', 'Agent'] },
    // NOUVEAU : Création de visite pour Visiteur et Agent
    { name: 'Nouvelle Visite', path: '/create-visit', icon: '📝', roles: ['Visiteur', 'Agent'] },
    
    // NOUVEAU : Validation pour l'Admin uniquement
    { name: 'Valider Visites', path: '/validate-visits', icon: '⚖️', roles: ['Admin'] },
    { name: 'Mes Visites', path: '/my-visits', icon: '📜', roles: ['Visiteur'] },
    { name: 'Paramètres', path: '/settings', icon: '⚙️', roles: ['Admin', 'Agent', 'Visiteur'] },
  ];

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className={`${isOpen ? 'w-64' : 'w-20'} bg-slate-900 h-screen flex flex-col border-r border-slate-800 fixed left-0 top-0 z-50 transition-all duration-300`}>
      {/* Header avec bouton Toggle */}
      <div className="p-4 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="bg-blue-600 min-w-[40px] h-10 rounded-xl flex items-center justify-center text-white font-black">
            AI
          </div>
          {isOpen && (
            <div className="whitespace-nowrap">
              <h2 className="text-white font-bold leading-tight">AIGLE</h2>
              <p className="text-slate-500 text-[10px] uppercase font-bold">Informatique</p>
            </div>
          )}
        </div>
      </div>

      {/* Bouton pour ouvrir/fermer (Flottant sur le bord) */}
      <button 
        onClick={toggleSidebar}
        className="absolute -right-3 top-20 bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-[10px] shadow-lg border-2 border-slate-900 hover:scale-110 transition-transform"
      >
        {isOpen ? '◀' : '▶'}
      </button>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-2 mt-4 overflow-hidden">
        {menuItems
          .filter(item => item.roles.includes(role))
          .map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group ${
                  isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                {isOpen && <span className="font-medium text-sm whitespace-nowrap">{item.name}</span>}
              </Link>
            );
          })}
      </nav>

      {/* Profil & Déconnexion */}
      <div className="p-4 border-t border-slate-800 bg-slate-900/50 overflow-hidden">
        <div className="flex items-center gap-3 mb-4 px-1">
          <div className="min-w-[32px] h-8 rounded-full bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-300">
            {role[0]}
          </div>
          {isOpen && (
            <div className="overflow-hidden">
              <p className="text-white text-xs font-bold truncate">Utilisateur</p>
              <p className="text-blue-400 text-[10px] font-medium">{role}</p>
            </div>
          )}
        </div>
        
        <button onClick={handleLogout} className="w-full flex items-center gap-3 p-3 text-red-400 hover:bg-red-500/10 rounded-xl text-sm font-bold">
          <span>🚪</span> {isOpen && "Déconnexion"}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;