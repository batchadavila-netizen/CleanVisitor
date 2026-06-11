import React, { useState, useEffect } from 'react';
import { visitService } from '../services/visitService';
import toast, { Toaster } from 'react-hot-toast';
import { Calendar, Clock, Building2, FileText, X, Send, User } from 'lucide-react';

const CreateVisitModal = ({ isOpen, onClose, onSuccess, initialData }) => {
    // 1. RÉCUPÉRATION DES INFOS DEPUIS LE LOGIN
    const storedVisitorId = localStorage.getItem('visitorId');
    const storedVisitorName = localStorage.getItem('userName') || "Visiteur";
    const isEditMode = !!initialData;

    // 2. ÉTAT DU FORMULAIRE
    const [formData, setFormData] = useState({
        motif: '',
        service: 1,
        heureArriver: '',
        date: ''
    });

    // 3. SYNCHRONISATION & RESET
    useEffect(() => {
        if (isOpen) {
            if (isEditMode && initialData) {
                setFormData({
                    motif: initialData.motif || initialData.Motif || '',
                    service: initialData.service || initialData.Service || 1,
                    heureArriver: (initialData.heureArriver || initialData.HeureArriver || '').substring(0, 5),
                    date: (initialData.date || initialData.Date || '').split('T')[0]
                });
            } else {
                setFormData({
                    motif: '',
                    service: 1,
                    heureArriver: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
                    date: new Date().toISOString().split('T')[0]
                });
            }
        }
    }, [isOpen, isEditMode, initialData]);

    // 4. LOGIQUE D'ENVOI
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Sécurité : Vérifier si l'ID visiteur est présent dans le localStorage
        if (!storedVisitorId) {
            toast.error("Profil visiteur non trouvé. Veuillez vous reconnecter.");
            return;
        }

        // Sécurisation avec le chaînage optionnel (?.) pour éviter le crash si initialData est null/undefined
        const fromInitialData = initialData?.idVisitor || initialData?.IdVisitor;
        
        const resolvedVisitorId = (fromInitialData && fromInitialData !== 0)
            ? fromInitialData
            : parseInt(storedVisitorId, 10);

        const payload = {
            motif: formData.motif,
            idVisitor: resolvedVisitorId, 
            service: parseInt(formData.service, 10),
            // Ajout des secondes pour SQL Server (:00)
            heureArriver: formData.heureArriver.length === 5 ? `${formData.heureArriver}:00` : formData.heureArriver,
            date: formData.date,
            statut: 1,
            isDeleted: false
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
            console.error("Erreur API:", err.response?.data || err.message);
            toast.error(err.response?.data?.message || "Échec de l'opération");
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
            <Toaster position="top-right" />
            
            <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
                
                {/* HEADER (Fixe) */}
                <div className="flex justify-between items-center p-8 pb-4 shrink-0">
                    <h2 className="text-2xl font-black text-slate-800 tracking-tighter uppercase italic">
                        {isEditMode ? "Modifier la visite" : "Nouvelle demande"}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-all text-slate-400">
                        <X size={24} />
                    </button>
                </div>

                {/* CORPS DU FORMULAIRE (Défilable) */}
                <form onSubmit={handleSubmit} className="p-8 pt-2 space-y-6 overflow-y-auto custom-scrollbar">
                    
                    {/* SECTION IDENTITÉ */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                            <User size={14} className="text-blue-500" /> Identité du demandeur
                        </label>
                        <div className="w-full bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-4 font-bold text-slate-600 flex justify-between items-center">
                            <span>{storedVisitorName}</span>
                            <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-1 rounded-lg">ID : {storedVisitorId}</span>
                        </div>
                    </div>

                    {/* SECTION DATE & HEURE */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Date</label>
                            <input 
                                type="date" required value={formData.date}
                                onChange={(e) => setFormData({...formData, date: e.target.value})}
                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 font-bold text-slate-700 outline-none focus:ring-2 ring-blue-500/20"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Heure</label>
                            <input 
                                type="time" required value={formData.heureArriver}
                                onChange={(e) => setFormData({...formData, heureArriver: e.target.value})}
                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 font-bold text-slate-700 outline-none focus:ring-2 ring-blue-500/20"
                            />
                        </div>
                    </div>

                    {/* SECTION SERVICE */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Service concerné</label>
                        <select 
                            value={formData.service}
                            onChange={(e) => setFormData({...formData, service: e.target.value})}
                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 font-bold text-slate-700 outline-none focus:ring-2 ring-blue-500/20 appearance-none cursor-pointer"
                        >
                            <option value={1}>Direction</option>
                            <option value={2}>Service RH</option>
                            <option value={3}>Service Financier</option>
                            <option value={4}>Service Informatique</option>
                            <option value={5}>Secrétariat</option>
                        </select>
                    </div>

                    {/* SECTION MOTIF */}
                    <div className="space-y-2 pb-4">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Motif</label>
                        <textarea 
                            required value={formData.motif}
                            onChange={(e) => setFormData({...formData, motif: e.target.value})}
                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 h-24 resize-none font-medium text-slate-600 outline-none focus:ring-2 ring-blue-500/20"
                        />
                    </div>

                    {/* BOUTONS ACTIONS (Toujours en bas du formulaire) */}
                    <div className="flex gap-4 pt-2 sticky bottom-0 bg-white pb-2">
                        <button 
                            type="button" onClick={onClose}
                            className="flex-1 py-4 font-black text-slate-400 hover:text-slate-600 transition-all"
                        >
                            ANNULER
                        </button>
                        <button 
                            type="submit"
                            className="flex-[2] bg-blue-600 text-white py-4 rounded-2xl font-black shadow-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                        >
                            <Send size={18} />
                            {isEditMode ? "MODIFIER" : "VALIDER"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateVisitModal;