import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { configService } from '../services/configService';
import { Shield, Building, Bell, Sliders, Save, Plus, Trash2 } from 'lucide-react';

const Settings = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Verification de sécurité Admin
  useEffect(() => {
    const role = localStorage.getItem('userRole') || '';
    const isAdmin = role === 'Admin' || role === 'admin' || role === '1';
    if (!isAdmin) {
      navigate('/dashboard');
    }
  }, [navigate]);

  // État local unifié
  const [config, setConfig] = useState({
    companyName: 'Davila Entreprise',
    contactEmail: 'contact@davila.com',
    passValidityHours: 2,
    maxConcurrentVisitors: 50,
    autoExpireHours: 24,
    enableEmailNotifs: true,
    companyServices: ['Direction', 'Service_RH', 'Secretariat', 'Informatique', 'Comptabilite']
  });

  const [newService, setNewService] = useState('');

  // Chargement des données réelles depuis le Backend C#
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        setLoading(true);
        const data = await configService.getConfig();
        if (data) {
          setConfig(data);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des configurations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setConfig(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (type === 'number' ? parseInt(value) || 0 : value)
    }));
  };

  const handleAddService = (e) => {
    e.preventDefault();
    const trimmed = newService.trim();
    if (trimmed && !config.companyServices.includes(trimmed)) {
      setConfig(prev => ({
        ...prev,
        companyServices: [...prev.companyServices, trimmed]
      }));
      setNewService('');
    }
  };

  const handleRemoveService = (serviceToRemove) => {
    setConfig(prev => ({
      ...prev,
      companyServices: prev.companyServices.filter(s => s !== serviceToRemove)
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await configService.saveConfig(config);
      alert("Paramètres enregistrés avec succès dans la base de données SQL Server !");
    } catch (error) {
      console.error(error);
      alert("Erreur lors de la sauvegarde sur le serveur.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#F4F7F9] items-center justify-center font-bold text-slate-600">
        Chargement de la configuration système depuis SQL Server...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#F4F7F9] font-sans">
      <Sidebar
        isOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarOpen ? 'pl-64' : 'pl-20'}`}>
        
        {/* BANNIÈRE HEADER */}
        <div className="bg-slate-900 px-8 pt-8 pb-16 relative overflow-hidden shrink-0">
          <div className="relative z-10">
            <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-2">
              <Sliders className="text-blue-400" size={26} /> Configuration du Système
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Gérez la sécurité, les services disponibles et le nom de l'établissement.
            </p>
          </div>
        </div>

        {/* CONTENU EN PLEINE LARGEUR */}
        <main className="px-8 -mt-8 relative z-20 pb-12 flex-1">
          <div className="w-full bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            
            {/* ONGLETS DE NAVIGATION */}
            <div className="flex border-b border-slate-100 bg-slate-50/50 p-2 gap-2 overflow-x-auto">
              <TabButton id="general" label="Général & Branding" icon={<Sliders size={16} />} active={activeTab} onClick={setActiveTab} />
              <TabButton id="services" label="Organisation & Services" icon={<Building size={16} />} active={activeTab} onClick={setActiveTab} />
              <TabButton id="security" label="Sécurité & Accès" icon={<Shield size={16} />} active={activeTab} onClick={setActiveTab} />
              <TabButton id="notifs" label="Notifications" icon={<Bell size={16} />} active={activeTab} onClick={setActiveTab} />
            </div>

            {/* FORMULAIRE PRINCIPAL */}
            <form onSubmit={handleSave} className="p-8 space-y-8">

              {/* ONGLET GÉNÉRAL & BRANDING */}
              {activeTab === 'general' && (
                <div className="space-y-6">
                  <h3 className="font-bold text-slate-800 text-base border-b pb-3 border-slate-100 flex items-center gap-2">
                    <Sliders className="text-blue-600" size={18} /> Informations Générales
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase mb-2">
                        Nom de l'Établissement / Entreprise
                      </label>
                      <input 
                        type="text" 
                        name="companyName" 
                        value={config.companyName || ''} 
                        onChange={handleChange} 
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-500/20" 
                      />
                      <p className="text-[11px] text-slate-400 mt-1">
                        Ce nom sera affiché en haut de la barre latérale pour tous les comptes.
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase mb-2">
                        Email Support Client
                      </label>
                      <input 
                        type="email" 
                        name="contactEmail" 
                        value={config.contactEmail || ''} 
                        onChange={handleChange} 
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-500/20" 
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ONGLET ORGANISATION & SERVICES */}
              {activeTab === 'services' && (
                <div className="space-y-6">
                  <h3 className="font-bold text-slate-800 text-base border-b pb-3 border-slate-100 flex items-center gap-2">
                    <Building className="text-blue-600" size={18} /> Gestion des Services & Départements
                  </h3>

                  <div className="flex gap-3">
                    <input
                      type="text"
                      placeholder="Nouveau service (ex: Logistique)..."
                      value={newService}
                      onChange={(e) => setNewService(e.target.value)}
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                    <button
                      type="button"
                      onClick={handleAddService}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-3 rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-blue-200"
                    >
                      <Plus size={16} /> Ajouter
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                    {config.companyServices && config.companyServices.map((service, index) => (
                      <div key={index} className="flex justify-between items-center bg-slate-50 border border-slate-100 p-3.5 rounded-2xl">
                        <span className="font-bold text-slate-700 text-xs">{service}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveService(service)}
                          className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ONGLET SÉCURITÉ */}
              {activeTab === 'security' && (
                <div className="space-y-6">
                  <h3 className="font-bold text-slate-800 text-base border-b pb-3 border-slate-100 flex items-center gap-2">
                    <Shield className="text-blue-600" size={18} /> Politiques de Contrôle d'Accès
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Durée de validité Pass (Heures)</label>
                      <input type="number" name="passValidityHours" value={config.passValidityHours || 2} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-sm font-semibold" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Capacité Maximale Bâtiment</label>
                      <input type="number" name="maxConcurrentVisitors" value={config.maxConcurrentVisitors || 50} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-sm font-semibold" />
                    </div>
                  </div>
                </div>
              )}

              {/* ONGLET NOTIFICATIONS */}
              {activeTab === 'notifs' && (
                <div className="space-y-6">
                  <h3 className="font-bold text-slate-800 text-base border-b pb-3 border-slate-100 flex items-center gap-2">
                    <Bell className="text-blue-600" size={18} /> Canal de Communication
                  </h3>
                  <label className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 cursor-pointer">
                    <input type="checkbox" name="enableEmailNotifs" checked={!!config.enableEmailNotifs} onChange={handleChange} className="w-5 h-5 accent-blue-600 rounded" />
                    <div>
                      <p className="font-bold text-slate-800 text-sm">Notifications Email Automatiques</p>
                      <p className="text-xs text-slate-400">Informer les visiteurs lors du changement de statut de leur pass.</p>
                    </div>
                  </label>
                </div>
              )}

              {/* BOUTON ENREGISTRER */}
              <div className="flex justify-end pt-4 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold px-6 py-3 rounded-2xl text-xs transition-all shadow-lg shadow-blue-200 flex items-center gap-2"
                >
                  <Save size={16} /> {saving ? "Enregistrement..." : "Enregistrer les Modifications"}
                </button>
              </div>

            </form>
          </div>
        </main>

      </div>
    </div>
  );
};

const TabButton = ({ id, label, icon, active, onClick }) => (
  <button
    type="button"
    onClick={() => onClick(id)}
    className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-xs transition-all ${
      active === id
        ? 'bg-white text-blue-600 shadow-sm border border-slate-100'
        : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'
    }`}
  >
    {icon}
    {label}
  </button>
);

export default Settings;