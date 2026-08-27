import React, { useState, useEffect } from 'react';
import { visitService } from '../services/visitService';
import toast, { Toaster } from 'react-hot-toast';
import { X, Send, User, Calendar, Clock, Building2, AlignLeft, UserCheck } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const DEFAULT_SERVICES = ['Direction', 'Service RH', 'Service Financier', 'Service Informatique', 'Secrétariat'];

const schema = z.object({
  date: z.string().min(1, "La date est obligatoire"),
  heureArriver: z.string().min(1, "L'heure est obligatoire"),
  service: z.string().min(1, "Le service est obligatoire"),
  userId: z.string().optional(),
  motif: z.string().min(3, "Le motif doit contenir au moins 3 caractères"),
});

const CreateVisitModal = ({ isOpen, onClose, onSuccess, initialData }) => {
  const storedVisitorId = localStorage.getItem('visitorId');
  const storedVisitorName = localStorage.getItem('userName') || "Visiteur";
  const isEditMode = !!initialData;

  const [serviceAgents, setServiceAgents] = useState([]);
  const [loadingAgents, setLoadingAgents] = useState(false);

  const [dynamicServices, setDynamicServices] = useState(() => {
    const saved = localStorage.getItem('companyServices');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return DEFAULT_SERVICES;
  });

  useEffect(() => {
    const handleConfigChange = () => {
      const saved = localStorage.getItem('companyServices');
      if (saved) {
        try { setDynamicServices(JSON.parse(saved)); } catch (e) { console.error(e); }
      }
    };
    window.addEventListener('configUpdated', handleConfigChange);
    return () => window.removeEventListener('configUpdated', handleConfigChange);
  }, []);

  const { register, handleSubmit, reset, watch, setValue, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      heureArriver: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      service: dynamicServices[0] || '',
      userId: '',
      motif: ''
    }
  });

  const selectedService = watch('service');

  // 🟢 RECUPERATION DYNAMIQUE DES AGENTS
  useEffect(() => {
    if (!isOpen || !selectedService) {
      setServiceAgents([]);
      return;
    }

    const fetchAgentsForService = async () => {
      setLoadingAgents(true);
      try {
        const token = localStorage.getItem('token');
        const encodedService = encodeURIComponent(selectedService);

        const response = await fetch(`http://localhost:5283/api/User/agents-by-service/${encodedService}`, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          setServiceAgents(data?.$values || data || []);
        } else {
          setServiceAgents([]);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des agents du service :", error);
        setServiceAgents([]);
      } finally {
        setLoadingAgents(false);
      }
    };

    fetchAgentsForService();
  }, [selectedService, isOpen]);

  useEffect(() => {
    if (isOpen) {
      if (isEditMode && initialData) {
        reset({
          motif: initialData.motif || initialData.Motif || '',
          service: String(initialData.service || initialData.Service || dynamicServices[0]),
          userId: String(initialData.userId || initialData.UserId || ''),
          heureArriver: (initialData.heureArriver || initialData.HeureArriver || '').substring(0, 5),
          date: (initialData.date || initialData.Date || '').split('T')[0]
        });
      } else {
        reset({
          motif: '',
          service: dynamicServices[0] || '',
          userId: '',
          heureArriver: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
          date: new Date().toISOString().split('T')[0]
        });
      }
    }
  }, [isOpen, isEditMode, initialData, reset, dynamicServices]);

  // Mapping des libellés de service vers leurs ID numériques BDD
  const SERVICE_ID_MAP = {
    'Direction': 1,
    'Service RH': 2,
    'Service Financier': 3,
    'Service Informatique': 4,
    'Secrétariat': 5
  };

  const onSubmit = async (data) => {
    if (!storedVisitorId) {
      toast.error("Profil visiteur non trouvé. Veuillez vous reconnecter.");
      return;
    }
    const fromInitialData = initialData?.idVisitor || initialData?.IdVisitor;
    const resolvedVisitorId = (fromInitialData && fromInitialData !== 0) ? fromInitialData : parseInt(storedVisitorId, 10);

    const serviceId = SERVICE_ID_MAP[data.service] || parseInt(data.service, 10) || 1;

    const payload = {
      motif: data.motif,
      idVisitor: resolvedVisitorId,
      service: serviceId,
      userId: data.userId ? parseInt(data.userId, 10) : null,
      heureArriver: data.heureArriver.length === 5 ? `${data.heureArriver}:00` : data.heureArriver,
      date: data.date,
      statut: 1,
      isDeleted: false,
      updatedByRole: localStorage.getItem('userRole') || "Visiteur"
    };

    try {
      if (isEditMode) {
        const visitId = initialData?.id || initialData?.Id;
        await visitService.updateVisit(visitId, payload);
        toast.success("Visite mise à jour !");
      } else {
        await visitService.create(payload);
        toast.success("Demande envoyée avec succès !");
      }
      onSuccess();
      onClose();
    } catch (err) {
      console.error("Erreur API:", err);

      // 🟢 ATTRAPAGE EXPLICITE DU MESSAGE D'ERREUR BACKEND (CRÉNEAU OCCUPÉ)
      const serverMessage = 
        err.response?.data?.message || 
        err.response?.data?.Message || 
        (typeof err.response?.data === 'string' ? err.response?.data : null) ||
        err.message || 
        "Échec de l'opération : Le créneau est peut-être déjà occupé.";

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 font-sans">
      <Toaster position="top-right" />
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-xl border border-slate-100 flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* EN-TÊTE MODALE */}
        <div className="flex justify-between items-center px-6 py-5 bg-slate-900 text-white shrink-0">
          <div>
            <h2 className="text-base font-bold tracking-tight">
              {isEditMode ? "Modifier la visite" : "Nouvelle demande de visite"}
            </h2>
            <p className="text-slate-400 text-xs mt-0.5">Renseignez les détails de votre rendez-vous</p>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* FORMULAIRE COMPACT */}
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="p-6 space-y-4">
          
          {/* IDENTITÉ */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <User size={13} className="text-blue-600" /> Identité du demandeur
            </label>
            <div className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-slate-800 font-bold text-xs">
              {storedVisitorName}
            </div>
          </div>

          {/* DATE & HEURE */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Calendar size={13} className="text-blue-600" /> Date
              </label>
              <input
                {...register('date')}
                type="date"
                min={new Date().toISOString().split('T')[0]}
                className={`w-full bg-slate-50 border rounded-2xl px-3.5 py-2.5 text-slate-800 font-semibold text-xs outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${
                  errors.date ? 'border-rose-400 bg-rose-50' : 'border-slate-200'
                }`}
              />
              {errors.date && <p className="text-[10px] text-rose-500 mt-1 font-semibold">⚠️ {errors.date.message}</p>}
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Clock size={13} className="text-blue-600" /> Heure
              </label>
              <input
                {...register('heureArriver')}
                type="time"
                className={`w-full bg-slate-50 border rounded-2xl px-3.5 py-2.5 text-slate-800 font-semibold text-xs outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${
                  errors.heureArriver ? 'border-rose-400 bg-rose-50' : 'border-slate-200'
                }`}
              />
              {errors.heureArriver && <p className="text-[10px] text-rose-500 mt-1 font-semibold">⚠️ {errors.heureArriver.message}</p>}
            </div>
          </div>

          {/* SERVICE DYNAMIQUE */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Building2 size={13} className="text-blue-600" /> Service concerné
            </label>
            <select
              {...register('service')}
              onChange={(e) => {
                setValue('service', e.target.value);
                setValue('userId', '');
              }}
              className={`w-full bg-slate-50 border rounded-2xl px-3.5 py-2.5 text-slate-800 font-semibold text-xs outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer transition-all ${
                errors.service ? 'border-rose-400 bg-rose-50' : 'border-slate-200'
              }`}
            >
              {dynamicServices.map((srv, idx) => (
                <option key={idx} value={srv}>{srv}</option>
              ))}
            </select>
            {errors.service && <p className="text-[10px] text-rose-500 mt-1 font-semibold">⚠️ {errors.service.message}</p>}
          </div>

          {/* PERSONNE À VISITER */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <UserCheck size={13} className="text-blue-600" /> Personne à visiter (Hôte)
            </label>
            <select
              {...register('userId')}
              disabled={loadingAgents}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-slate-800 font-semibold text-xs outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer transition-all disabled:opacity-50"
            >
              <option value="">
                {loadingAgents ? "Chargement des hôtes..." : "-- Tout le département / Aucun hôte spécifique --"}
              </option>
              {serviceAgents.map(agent => (
                <option key={agent.id} value={agent.id}>
                  {agent.prenom} {agent.nom}
                </option>
              ))}
            </select>
          </div>

          {/* MOTIF */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <AlignLeft size={13} className="text-blue-600" /> Motif de la visite
            </label>
            <textarea
              {...register('motif')}
              rows="3"
              placeholder="Ex: Entretien professionnel, livraison, réunion d'affaires..."
              className={`w-full bg-slate-50 border rounded-2xl p-3.5 text-slate-800 font-medium text-xs resize-none outline-none focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-slate-400 ${
                errors.motif ? 'border-rose-400 bg-rose-50' : 'border-slate-200'
              }`}
            />
            {errors.motif && <p className="text-[10px] text-rose-500 mt-1 font-semibold">⚠️ {errors.motif.message}</p>}
          </div>

          {/* BOUTONS D'ACTION */}
          <div className="flex gap-2.5 pt-2 border-t border-slate-100">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 py-3 font-bold text-slate-600 bg-slate-100 rounded-2xl hover:bg-slate-200 transition-colors text-xs"
            >
              Annuler
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-2xl transition-all flex items-center justify-center gap-2 text-xs shadow-md shadow-blue-200 disabled:opacity-60"
            >
              <Send size={14} />
              {isSubmitting ? "Envoi en cours..." : isEditMode ? "Enregistrer les modifications" : "Confirmer la demande"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default CreateVisitModal;