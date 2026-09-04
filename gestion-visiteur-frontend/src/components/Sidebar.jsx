import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { configService } from '../services/configService';
import { 
  UserButton, 
  useUser, 
  useClerk 
} from '@clerk/clerk-react';
import { 
  LayoutDashboard, 
  Users, 
  CheckSquare, 
  FileText, 
  User as UserIcon, 
  Settings, 
  LogOut, 
  ChevronLeft, 
  ChevronRight,
  LogIn
} from 'lucide-react';

const Sidebar = ({ isOpen, toggleSidebar, pendingVisits = 0 }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const { user, isSignedIn: isClerkSignedIn } = useUser();
  const { signOut } = useClerk();
  
  const localRole = localStorage.getItem('userRole');
  const localName = localStorage.getItem('userName');
  const localToken = localStorage.getItem('token') || localStorage.getItem('userToken');
  const isLocallySignedIn = Boolean(localRole || localToken);

  const isAuthenticated = isClerkSignedIn || isLocallySignedIn;

  // Priorité d'affichage du rôle : Local Storage -> Clerk -> 'Visiteur' par défaut
  const role = localRole || user?.publicMetadata?.role || 'Visiteur';
  const userName = localName || user?.fullName || user?.firstName || 'Utilisateur';

  const [companyName, setCompanyName] = useState(
    localStorage.getItem('companyName') || 'Davila Entreprise'
  );

  useEffect(() => {
    const fetchConfig = async () => {
      const data = await configService.getConfig();
      if (data && data.companyName) {
        setCompanyName(data.companyName);
      }
    };

    fetchConfig();

    const handleConfigUpdate = () => {
      const updatedName = localStorage.getItem('companyName');
      if (updatedName) setCompanyName(updatedName);
    };

    window.addEventListener('configUpdated', handleConfigUpdate);
    window.addEventListener('storage', handleConfigUpdate);

    return () => {
      window.removeEventListener('configUpdated', handleConfigUpdate);
      window.removeEventListener('storage', handleConfigUpdate);
    };
  }, [location.pathname]);

  const getInitials = (name) => {
    if (!name) return 'DE';
    const words = name.trim().split(' ').filter(Boolean);
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const menuItems = [
    { name: 'Tableau de bord', path: '/dashboard', icon: LayoutDashboard, roles: ['Admin', 'Agent'] },
    { name: 'Liste Visiteurs', path: '/visitors', icon: Users, roles: ['Admin', 'Agent'] },
    { 
      name: 'Valider Visites', 
      path: '/validate-visits', 
      icon: CheckSquare, 
      roles: ['Admin'],
      showBadge: true 
    },
    { 
      name: 'Mes Visites', 
      path: '/mon-espace', 
      icon: FileText, 
      roles: ['Visiteur'],
      showBadge: true 
    },
    { name: 'Mon Profil', path: '/profile', icon: UserIcon, roles: ['Admin', 'Agent', 'Visiteur'] },
    { name: 'Paramètres', path: '/settings', icon: Settings, roles: ['Admin'] },
  ];

  const handleLogout = async () => {
    const currentCompany = localStorage.getItem('companyName');
    const currentServices = localStorage.getItem('companyServices');

    if (isClerkSignedIn) {
      await signOut();
    }

    localStorage.clear();

    if (currentCompany) localStorage.setItem('companyName', currentCompany);
    if (currentServices) localStorage.setItem('companyServices', currentServices);

    navigate('/login', { replace: true });
  };

  return (
    <div className={`${isOpen ? 'w-64' : 'w-20'} bg-slate-900 h-screen flex flex-col border-r border-slate-800 fixed left-0 top-0 z-50 transition-all duration-300 font-sans`}>
      
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="bg-blue-600 min-w-[40px] h-10 rounded-xl flex items-center justify-center text-white font-black text-xs tracking-wider">
            {getInitials(companyName)}
          </div>
          
          {isOpen && (
            <div className="whitespace-nowrap overflow-hidden">
              <h2 className="text-white font-bold leading-tight uppercase tracking-wide truncate max-w-[140px]" title={companyName}>
                {companyName}
              </h2>
              <p className="text-slate-500 text-[10px] uppercase font-bold">Entreprise</p>
            </div>
          )}
        </div>
      </div>

      {/* Toggle Button */}
      <button 
        onClick={toggleSidebar}
        className="absolute -right-3 top-20 bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-lg border-2 border-slate-900 hover:scale-110 transition-transform z-10"
      >
        {isOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
      </button>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1.5 mt-4 overflow-y-auto overflow-x-hidden">
        {menuItems
          .filter(item => item.roles.includes(role))
          .map((item) => {
            const isActive = location.pathname === item.path;
            const hasNotification = item.showBadge && pendingVisits > 0;
            const IconComponent = item.icon;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3.5 p-3 rounded-xl transition-all duration-200 group relative ${
                  isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20 font-semibold' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <IconComponent size={20} className="shrink-0" />
                {isOpen && <span className="text-sm whitespace-nowrap flex-1">{item.name}</span>}
                
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

      {/* Footer Profil */}
      <div className="p-4 border-t border-slate-800 bg-slate-900/50">
        {isAuthenticated ? (
          <>
            <div className="flex items-center gap-3 mb-4 px-1">
              {isClerkSignedIn ? (
                <UserButton afterSignOutUrl="/login" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {getInitials(userName)}
                </div>
              )}
              
              {isOpen && (
                <div className="overflow-hidden">
                  <p className="text-white text-xs font-bold truncate">{userName}</p>
                  <p className="text-blue-400 text-[10px] font-medium uppercase tracking-wider">{role}</p>
                </div>
              )}
            </div>
            
            <button 
              onClick={handleLogout} 
              className="w-full flex items-center gap-3 p-3 text-red-400 hover:bg-red-500/10 rounded-xl text-sm font-bold transition-colors"
            >
              <LogOut size={18} className="shrink-0" />
              {isOpen && "Déconnexion"}
            </button>
          </>
        ) : (
          <button 
            onClick={() => navigate('/login')}
            className="w-full flex items-center justify-center gap-2 p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md"
          >
            <LogIn size={16} />
            {isOpen && "Se connecter"}
          </button>
        )}
      </div>

    </div>
  );
};

export default Sidebar;