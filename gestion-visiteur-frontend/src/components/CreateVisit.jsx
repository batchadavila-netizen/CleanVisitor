import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { visitService } from '../services/visitService';
import { visitorService } from '../services/visitorService';
import Sidebar from '../components/Sidebar';
import toast, { Toaster } from 'react-hot-toast';
import { ArrowLeft, Send, User, Clock, Info, Calendar, Building2, AlignLeft, AlertCircle, UserCheck } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useServices } from '../hooks/useServices';
import { fetchWithAuth } from '../services/apiClient'; // 🟢 Utilise ton client API centralisé

const schema = z.object({
  idVisitor: z.any().optional(),
  service: z.string().min(1, "Le service est obligatoire"),
  userId: z.string().optional(),
  date: z.string().min(1, "La date est obligatoire"),
  heureArriver: z.string().min(1, "L'heure est obligatoire"),
  motif: z.string().min(3, "Le motif doit contenir au moins 3 caractères"),
});

const Field = ({ label, icon, error, children }) => (
  <div className="space-y-1.5">
    {label && (
      <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
        {icon} {label}
      </label>
    )}
    {children}
    {error && (
      <p className="text-xs text-rose-500 font-semibold flex items-center gap-1 mt-1">
        <AlertCircle size={13} /> {error}
      </p>
    )}
  </div>
);

const CreateVisit = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const availableServices = useServices();

  const initialData = location.state?.initialData || location.state?.reprogramData || null;
  const selectedFromList = location.state?.selectedVisitor || null;
  const isReprogramMode = !!initialData;

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [visitors, setVisitors] = useState([]);
  const [serviceAgents, setServiceAgents] = useState([]);
  const [loadingAgents, setLoadingAgents] = useState(false);
  const [currentVisitorName, setCurrentVisitorName] = useState('');
  const userRole = localStorage.getItem('userRole');

  const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: {
      idVisitor: '',
      service: availableServices[0]?.id || '1',
      userId: '',
      date: new Date().toISOString().split('T')[0],
      heureArriver: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      motif: ''
    }
  });

  const fetchAgentsByServiceId = useCallback(async (serviceId, targetUserId = null) => {
    if (!serviceId) return;
    setLoadingAgents(true);
    try {
      const encodedService = encodeURIComponent(serviceId);
      // 🟢 Utilisation de fetchWithAuth pour cibler automatiquement Render
      const data = await fetchWithAuth(`/api/User/agents-by-service/${encodedService}`);

      const agents = data?.$values || data || [];
      setServiceAgents(agents);

      if (targetUserId) {
        const targetStr = String(targetUserId);
        setTimeout(() => {
          setValue('userId', targetStr);
        }, 100);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des agents :", error);
      setServiceAgents([]);
    } finally {
      setLoadingAgents(false);
    }
  }, [setValue]);

  useEffect(() => {
    if (userRole !== 'Visiteur') {
      visitorService.getAll().then(setVisitors).catch(console.error);
    }
  }, [userRole]);

  const getFallbackVisitorId = useCallback(() => {
    const storedVisitorId = localStorage.getItem('visitorId');
    const storedUserId = localStorage.getItem('userId');
    const storedUserJson = localStorage.getItem('user');

    if (storedVisitorId && storedVisitorId !== 'undefined') return storedVisitorId;
    if (storedUserId && storedUserId !== 'undefined') return storedUserId;

    if (storedUserJson) {
      try {
        const parsed = JSON.parse(storedUserJson);
        return parsed.id || parsed.Id || parsed.visitorId || parsed.VisitorId || '';
      } catch (e) { console.error(e); }
    }
    return '';
  }, []);

  useEffect(() => {
    const initReprogram = async () => {
      const fallbackId = getFallbackVisitorId();

      if (isReprogramMode && initialData) {
        let visitData = initialData;
        const hasHostId = initialData.userId || initialData.UserId || initialData.idUser || initialData.IdUser || initialData.hostId;
        const visitId = initialData.id || initialData.Id;

        if (!hasHostId && visitId) {
          try {
            // 🟢 Utilisation de fetchWithAuth avec gestion d'un fallback d'URL si besoin
            let fetched = null;
            try {
              fetched = await fetchWithAuth(`/api/Visit/${visitId}`);
            } catch {
              fetched = await fetchWithAuth(`/api/Visits/${visitId}`);
            }
            if (fetched) visitData = fetched;
          } catch (err) {
            console.error("Erreur récupération visite :", err);
          }
        }

        const visitorIdFound = visitData.idVisitor || visitData.IdVisitor || visitData.visitorId || visitData.VisitorId || fallbackId;
        const rawService = String((visitData.service ?? visitData.Service ?? availableServices[0]?.id) || '1');
        const hostIdFound = visitData.userId ?? visitData.UserId ?? visitData.idUser ?? visitData.IdUser ?? '';

        reset({
          motif: visitData.motif || visitData.Motif || '',
          service: rawService,
          userId: String(hostIdFound),
          heureArriver: (visitData.heureArriver || visitData.HeureArriver || '').substring(0, 5),
          date: (visitData.date || visitData.Date || '').split('T')[0],
          idVisitor: String(visitorIdFound || '')
        });

        fetchAgentsByServiceId(rawService, hostIdFound);

        const nomVisitor = visitData.nom_visitor || visitData.Nom_visitor || visitData.nomVisitor;
        const prenomVisitor = visitData.prenom_visitor || visitData.Prenom_visitor || visitData.prenomVisitor || '';
        
        if (nomVisitor) {
          setCurrentVisitorName(`${nomVisitor} ${prenomVisitor}`.trim());
        } else {
          const storedName = localStorage.getItem('userName') || localStorage.getItem('userNom');
          setCurrentVisitorName(storedName || (visitorIdFound ? `Visiteur N° ${visitorIdFound}` : "Visiteur"));
        }
      } else if (selectedFromList) {
        const vId = String(selectedFromList.id || selectedFromList.Id);
        setValue('idVisitor', vId);
        setCurrentVisitorName(`${selectedFromList.prenom || ''} ${selectedFromList.nom || ''}`.trim());
      } else {
        const defaultService = availableServices[0]?.id || '1';
        setValue('service', defaultService);
        setValue('idVisitor', String(fallbackId));
        
        const storedName = localStorage.getItem('userName');
        setCurrentVisitorName(storedName || "Visiteur Connecté");
        
        fetchAgentsByServiceId(defaultService);
      }
    };

    initReprogram();
  }, [isReprogramMode, initialData, selectedFromList, availableServices, reset, setValue, fetchAgentsByServiceId, getFallbackVisitorId]);

  const onSubmit = async (data) => {
    const visitId = initialData?.id || initialData?.Id;
    const serviceId = parseInt(data.service, 10) || 1;
    const resolvedVisitorId = parseInt(data.idVisitor, 10) || parseInt(getFallbackVisitorId(), 10) || 0;

    if (!resolvedVisitorId) {
      toast.error("Profil introuvable. Veuillez vous re-connecter.");
      return;
    }

    const payload = {
      Id: Number(visitId) || 0,
      Motif: data.motif,
      Service: serviceId,
      UserId: data.userId ? parseInt(data.userId, 10) : null,
      Date: data.date,
      HeureArriver: data.heureArriver.length === 5 ? `${data.heureArriver}:00` : data.heureArriver,
      Statut: isReprogramMode ? 2 : 1,
      IdVisitor: resolvedVisitorId,
      UpdatedByRole: userRole || "Admin"
    };

    try {
      if (isReprogramMode) {
        await visitService.updateVisit(visitId, payload);
        toast.success("Visite reprogrammée avec succès !");
      } else {
        await visitService.create(payload);
        toast.success("Visite créée !");
      }
      if (userRole === 'Visiteur') navigate('/mon-espace', { replace: true });
      else if (userRole === 'Agent') navigate('/visitors', { replace: true });
      else navigate('/dashboard', { replace: true });
    } catch (err) {
      console.error("Erreur réservation :", err);

      const serverMessage = 
        err.response?.data?.message || 
        err.response?.data?.Message || 
        (typeof err.response?.data === 'string' ? err.response?.data : null) ||
        err.message || 
        "Opération impossible : Vérifiez la disponibilité du créneau.";

      toast.error(serverMessage, {
        duration: 6000,
        style: {
          border: '1px solid #FECDD3',
          padding: '12px',
          color: '#9F1239',
          background: '#FFF1F2',
          fontSize: '12px',
          fontWeight: 'bold'
        }
      });
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F4F7F9] font-sans">
      <Toaster position="top-right" />
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      
      <main className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarOpen ? 'pl-64' : 'pl-20'}`}>
        
        <div className="bg-slate-900 px-8 pt-8 pb-14 relative overflow-hidden shrink-0">
          <div className="relative z-10 max-w-3xl mx-auto flex justify-between items-center">
            <div>
              <button 
                onClick={() => navigate(-1)} 
                className="flex items-center gap-1.5 text-slate-400 hover:text-white mb-3 text-xs font-bold transition-colors bg-slate-800 px-3 py-1.5 rounded-xl w-fit"
              >
                <ArrowLeft size={14} /> Retour
              </button>
              <h1 className="text-2xl font-black text-white tracking-tight">
                {isReprogramMode ? "Reprogrammation de la Visite" : "Nouvelle Demande de Visite"}
              </h1>
              <p className="text-slate-400 text-xs mt-1">
                Renseignez les informations pour enregistrer le rendez-vous dans le système.
              </p>
            </div>
          </div>
        </div>

        <div className="px-8 -mt-6 relative z-20 pb-12 flex-1">
          <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
            
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
              
              {isReprogramMode && userRole !== 'Visiteur' && (
                <div className="p-4 bg-blue-50/80 border border-blue-100 rounded-2xl flex gap-3 items-center">
                  <Info className="text-blue-600 shrink-0" size={18} />
                  <p className="text-blue-900 text-xs font-medium leading-relaxed">
                    Cette action reprogrammera la visite et la marquera automatiquement comme <span className="font-bold">Validée</span>.
                  </p>
                </div>
              )}

              <Field label="Visiteur concerné" icon={<User size={14} className="text-blue-600" />} error={errors.idVisitor?.message}>
                {isReprogramMode || userRole === 'Visiteur' ? (
                  <div className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 font-bold text-slate-800 text-xs flex justify-between items-center">
                    <span>{currentVisitorName || 'Visiteur Connecté'}</span>
                    <span className="text-[10px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-100">Compte Actif</span>
                  </div>
                ) : (
                  <select 
                    {...register('idVisitor')}
                    className={`w-full bg-slate-50 border rounded-2xl px-4 py-3 text-slate-800 text-xs font-semibold outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer transition-all ${
                      errors.idVisitor ? 'border-rose-400 bg-rose-50' : 'border-slate-200'
                    }`}
                  >
                    <option value="">-- Sélectionnez un visiteur dans la liste --</option>
                    {visitors.map(v => (
                      <option key={v.id || v.Id} value={String(v.id || v.Id)}>{v.nom || v.Nom} {v.prenom || v.Prenom}</option>
                    ))}
                  </select>
                )}
              </Field>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Service à visiter" icon={<Building2 size={14} className="text-blue-600" />} error={errors.service?.message}>
                  <select 
                    {...register('service')} 
                    disabled={isReprogramMode}
                    onChange={(e) => {
                      setValue('service', e.target.value);
                      setValue('userId', '');
                      fetchAgentsByServiceId(e.target.value);
                    }}
                    className={`w-full border rounded-2xl px-4 py-3 text-xs font-semibold outline-none transition-all ${
                      isReprogramMode 
                        ? 'bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed' 
                        : errors.service 
                          ? 'border-rose-400 bg-rose-50 text-slate-800' 
                          : 'bg-slate-50 border-slate-200 text-slate-800 cursor-pointer'
                    }`}
                  >
                    {availableServices.map((srv) => (
                      <option key={srv.id} value={srv.id}>{srv.label}</option>
                    ))}
                  </select>
                </Field>

                <Field label="Personne à visiter (Hôte)" icon={<UserCheck size={14} className="text-blue-600" />} error={errors.userId?.message}>
                  <select 
                    {...register('userId')} 
                    disabled={isReprogramMode}
                    className={`w-full border rounded-2xl px-4 py-3 text-xs font-semibold outline-none transition-all ${
                      isReprogramMode 
                        ? 'bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed' 
                        : 'bg-slate-50 border-slate-200 text-slate-800 cursor-pointer'
                    }`}
                  >
                    <option value="">
                      {loadingAgents ? "Chargement des hôtes..." : "-- Tout le département / Aucun hôte spécifique --"}
                    </option>
                    {serviceAgents.map(agent => {
                      const agentId = String(agent.id ?? agent.Id ?? '');
                      const agentNom = agent.nom ?? agent.Nom ?? '';
                      const agentPrenom = agent.prenom ?? agent.Prenom ?? '';
                      return (
                        <option key={agentId} value={agentId}>
                          {agentPrenom} {agentNom}
                        </option>
                      );
                    })}
                  </select>
                </Field>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Date prévue" icon={<Calendar size={14} className="text-blue-600" />} error={errors.date?.message}>
                  <input 
                    {...register('date')} 
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    className={`w-full bg-slate-50 border rounded-2xl px-4 py-3 text-slate-800 text-xs font-semibold outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer transition-all ${
                      errors.date ? 'border-rose-400 bg-rose-50' : 'border-slate-200'
                    }`} 
                  />
                </Field>

                <Field label="Heure d'arrivée" icon={<Clock size={14} className="text-blue-600" />} error={errors.heureArriver?.message}>
                  <input 
                    {...register('heureArriver')} 
                    type="time"
                    className={`w-full border rounded-2xl px-4 py-3 text-xs font-semibold outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer transition-all ${
                      errors.heureArriver ? 'border-rose-400 bg-rose-50 text-slate-800' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`} 
                  />
                </Field>
              </div>

              <Field label="Motif de la visite" icon={<AlignLeft size={14} className="text-blue-600" />} error={errors.motif?.message}>
                <textarea 
                  {...register('motif')}
                  rows="3"
                  placeholder="Ex: Entretien d'embauche, signature de contrat..."
                  readOnly={isReprogramMode}
                  className={`w-full border rounded-2xl p-4 text-xs font-medium resize-none outline-none focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-slate-400 ${
                    isReprogramMode 
                      ? 'bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed' 
                      : errors.motif 
                        ? 'border-rose-400 bg-rose-50 text-slate-800' 
                        : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`} 
                />
              </Field>

              <div className="pt-2">
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-2xl font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-md bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200 disabled:opacity-60"
                >
                  <Send size={15} />
                  {isSubmitting ? "Traitement en cours..." : isReprogramMode ? "Confirmer la reprogrammation" : "Enregistrer la demande"}
                </button>
              </div>

            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CreateVisit;