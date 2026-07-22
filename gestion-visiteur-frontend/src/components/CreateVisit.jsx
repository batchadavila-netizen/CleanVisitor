import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { visitService } from '../services/visitService';
import { visitorService } from '../services/visitorService';
import Sidebar from '../components/Sidebar';
import toast, { Toaster } from 'react-hot-toast';
import { ArrowLeft, Send, User, Clock, Info, Calendar } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const SERVICE_NAMES = {
    1: "Direction", 2: "Service RH", 3: "Service Financier",
    4: "Service Informatique", 5: "Secrétariat"
};

const schema = z.object({
    idVisitor: z.any().optional(),
    service: z.string().min(1, "Le service est obligatoire"),
    date: z.string().min(1, "La date est obligatoire"),
    heureArriver: z.string().min(1, "L'heure est obligatoire"),
    motif: z.string().min(3, "Le motif doit contenir au moins 6 caractères"),
});

const Field = ({ label, icon, error, children }) => (
    <div className="space-y-1.5">
        {label && (
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {icon} {label}
            </label>
        )}
        {children}
        {error && (
            <p className="text-xs text-red-500 flex items-center gap-1">
                <span>⚠️</span> {error}
            </p>
        )}
    </div>
);

const CreateVisit = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const initialData = location.state?.initialData || location.state?.reprogramData || null;
    const selectedFromList = location.state?.selectedVisitor || null;
    const isReprogramMode = !!initialData;
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [visitors, setVisitors] = useState([]);
    const [creneauxPris, setCreneauxPris] = useState([]);
    const [creneauWarning, setCreneauWarning] = useState('');
    const [currentVisitorName, setCurrentVisitorName] = useState('');
    const userRole = localStorage.getItem('userRole');

    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
        resolver: zodResolver(schema),
        mode: 'onChange',
        defaultValues: {
            idVisitor: '',
            service: '1',
            date: new Date().toISOString().split('T')[0],
            heureArriver: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
            motif: ''
        }
    });

    useEffect(() => {
        if (userRole !== 'Visiteur') {
            visitorService.getAll().then(setVisitors).catch(console.error);
        }

        if (isReprogramMode) {
            let visitorIdFound = initialData.idVisitor || initialData.IdVisitor || initialData.visitorId || initialData.VisitorId;
            if (!visitorIdFound && userRole === 'Visiteur') {
                const user = JSON.parse(localStorage.getItem('user') || '{}');
                visitorIdFound = user.visitorId || user.VisitorId || user.id;
            }

            let rawService = initialData.service || initialData.Service || 1;
            let resolvedService = '1';
            if (typeof rawService === 'string') {
                const cleanService = rawService.toLowerCase().replace(/_/g, '').replace(/\s/g, '');
                if (cleanService.includes('rh')) resolvedService = '2';
                else if (cleanService.includes('financier')) resolvedService = '3';
                else if (cleanService.includes('informatique')) resolvedService = '4';
                else if (cleanService.includes('secretariat')) resolvedService = '5';
                else resolvedService = String(parseInt(rawService, 10) || 1);
            } else {
                resolvedService = String(Number(rawService) || 1);
            }

            reset({
                motif: initialData.motif || initialData.Motif || '',
                service: resolvedService,
                heureArriver: (initialData.heureArriver || initialData.HeureArriver || '').substring(0, 5),
                date: (initialData.date || initialData.Date || '').split('T')[0],
                idVisitor: String(visitorIdFound || '')
            });

            if (userRole === 'Visiteur') {
                const user = JSON.parse(localStorage.getItem('user') || '{}');
                setCurrentVisitorName(`${user.nom || ''} ${user.prenom || ''}`);
            } else if (initialData.nom_visitor || initialData.Nom_visitor) {
                setCurrentVisitorName(`${initialData.nom_visitor || initialData.Nom_visitor || ''} ${initialData.prenom_visitor || initialData.Prenom_visitor || ''}`.trim());
            } else {
                setCurrentVisitorName(`Visiteur N° ${visitorIdFound}`);
            }
        } else if (selectedFromList) {
            reset(prev => ({ ...prev, idVisitor: String(selectedFromList.id) }));
        } else if (userRole === 'Visiteur') {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const email = user.email || user.Email;
            setCurrentVisitorName(`${user.nom || ''} ${user.prenom || ''}`);
            if (email) {
                visitorService.getByEmail(email).then(res => {
                    reset(prev => ({ ...prev, idVisitor: String(res.visitorId || res.VisitorId || res.id || '') }));
                }).catch(() => toast.error("Impossible de récupérer le profil visiteur."));
            }
        }
    }, [isReprogramMode, initialData, selectedFromList, userRole, reset]);

    const onSubmit = async (data) => {
        const visitId = initialData?.id || initialData?.Id;
        const serviceValue = parseInt(data.service, 10);

        const payload = {
            Id: Number(visitId),
            Motif: data.motif,
            Service: serviceValue,
            Date: data.date,
            HeureArriver: data.heureArriver.length === 5 ? `${data.heureArriver}:00` : data.heureArriver,
            Statut: isReprogramMode ? 2 : 1,
            IdVisitor: parseInt(data.idVisitor, 10) || 0,
            UpdatedByRole: userRole || "Visiteur"
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
            console.error("Erreur serveur :", err.response?.data?.errors);
            toast.error("Vérifiez le champ 'Service'.");
        }
    };

    return (
        <div className="flex min-h-screen bg-slate-50">
            <Toaster position="top-right" />
            <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
            <main className={`flex-1 p-8 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
                <div className="max-w-2xl mx-auto">
                    <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-blue-600 mb-8 font-medium text-sm transition-colors">
                        <ArrowLeft size={14} /> Retour
                    </button>
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                        <h1 className="text-xl font-semibold text-slate-800 mb-6">
                            {isReprogramMode ? "Reprogrammation de visite" : "Nouvelle visite"}
                        </h1>

                        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
                            {isReprogramMode && userRole !== 'Visiteur' && (
                                <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-xl flex gap-3 items-start">
                                    <Info className="text-blue-500 shrink-0 mt-0.5" size={15} />
                                    <p className="text-blue-800 text-sm leading-relaxed">
                                        Cette action reprogrammera la visite et la marquera comme <span className="font-semibold underline">acceptée</span> automatiquement.
                                    </p>
                                </div>
                            )}

                            {/* VISITEUR */}
                            <Field label="Visiteur concerné" icon={<User size={13} className="text-blue-500" />} error={errors.idVisitor?.message}>
                                {isReprogramMode ? (
                                    <div className="w-full bg-blue-50 border-2 border-blue-200 rounded-xl px-4 py-3 font-medium text-blue-700 text-sm">
                                        {currentVisitorName || 'Chargement...'}
                                    </div>
                                ) : userRole !== 'Visiteur' ? (
                                    <select {...register('idVisitor')}
                                        className={`w-full bg-white border-2 rounded-xl px-4 py-3 text-slate-800 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 cursor-pointer transition-colors ${errors.idVisitor ? 'border-red-400 bg-red-50' : 'border-slate-300'}`}>
                                        <option value="">Sélectionnez un visiteur</option>
                                        {visitors.map(v => (
                                            <option key={v.id} value={v.id}>{v.nom} {v.prenom}</option>
                                        ))}
                                    </select>
                                ) : (
                                    <div className="w-full bg-blue-50 border-2 border-blue-200 rounded-xl px-4 py-3 font-medium text-blue-700 text-sm">
                                        {currentVisitorName || 'Chargement...'}
                                    </div>
                                )}
                            </Field>

                            {/* SERVICE */}
                            <Field label="Service à visiter" error={errors.service?.message}>
                                <select {...register('service')} disabled={isReprogramMode}
                                    className={`w-full border-2 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors ${isReprogramMode ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed' : errors.service ? 'border-red-400 bg-red-50 text-slate-800' : 'bg-white border-slate-300 text-slate-800 cursor-pointer'}`}>
                                    {Object.entries(SERVICE_NAMES).map(([key, name]) => (
                                        <option key={key} value={key}>{name}</option>
                                    ))}
                                </select>
                            </Field>

                            {/* DATE + HEURE */}
                            <div className="grid grid-cols-2 gap-4">
                                <Field label="Date" icon={<Calendar size={13} className="text-blue-500" />} error={errors.date?.message}>
                                    <input {...register('date')} type="date"
                                        min={new Date().toISOString().split('T')[0]}
                                        className={`w-full bg-white border-2 rounded-xl px-4 py-3 text-slate-800 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 cursor-pointer transition-colors ${errors.date ? 'border-red-400 bg-red-50' : 'border-slate-300'}`} />
                                </Field>

                                <Field label="Heure d'arrivée" icon={<Clock size={13} className="text-blue-500" />} error={errors.heureArriver?.message}>
                                    <input {...register('heureArriver')} type="time"
                                        className={`w-full border-2 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 cursor-pointer transition-colors ${creneauWarning ? 'border-red-400 bg-red-50 text-red-700' : errors.heureArriver ? 'border-red-400 bg-red-50 text-slate-800' : 'bg-white border-slate-300 text-slate-800'}`} />
                                </Field>
                            </div>

                            {creneauWarning && (
                                <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-2">
                                    ⚠️ {creneauWarning}
                                </div>
                            )}

                            {creneauxPris.length > 0 && (
                                <div className="p-4 bg-amber-50 border-2 border-amber-200 rounded-xl">
                                    <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider mb-2 flex items-center gap-2">
                                        <Clock size={12} /> Déjà réservés :
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {creneauxPris.map((h, i) => (
                                            <span key={i} className="bg-red-100 text-red-700 text-xs font-semibold px-2 py-1 rounded-lg border border-red-200">🚫 {h}</span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* MOTIF */}
                            <Field label="Motif" error={errors.motif?.message}>
                                <textarea {...register('motif')}
                                    placeholder="Ex: Entretien, réunion..."
                                    readOnly={isReprogramMode}
                                    className={`w-full border-2 rounded-xl px-4 py-3 h-28 resize-none text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors placeholder:text-slate-400 ${isReprogramMode ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed' : errors.motif ? 'border-red-400 bg-red-50 text-slate-800' : 'bg-white border-slate-300 text-slate-800'}`} />
                            </Field>

                            <button type="submit" disabled={isSubmitting || !!creneauWarning}
                                className={`w-full py-4 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-sm ${creneauWarning ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200 shadow-md disabled:opacity-60'}`}>
                                <Send size={16} />
                                {isSubmitting ? "Chargement..." : isReprogramMode ? "Confirmer la reprogrammation" : "Valider"}
                            </button>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default CreateVisit;