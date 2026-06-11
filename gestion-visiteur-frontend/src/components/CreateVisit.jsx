import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { visitService } from '../services/visitService';
import { visitorService } from '../services/visitorService';
import Sidebar from '../components/Sidebar';
import toast, { Toaster } from 'react-hot-toast';
import { ArrowLeft, Send, User, Clock, Info } from 'lucide-react';

const SERVICE_NAMES = {
    1: "Direction", 2: "Service RH", 3: "Service Financier",
    4: "Service Informatique", 5: "Secrétariat"
};

const CreateVisit = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const initialData = location.state?.initialData || location.state?.reprogramData || null;
    const selectedFromList = location.state?.selectedVisitor || null;
    const isReprogramMode = !!initialData;

    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [visitors, setVisitors] = useState([]);
    const [loading, setLoading] = useState(false);
    const [creneauxPris, setCreneauxPris] = useState([]);
    const [creneauWarning, setCreneauWarning] = useState('');
    
    const [currentVisitorName, setCurrentVisitorName] = useState('');
    const userRole = localStorage.getItem('userRole');

    const [formData, setFormData] = useState({
        motif: '',
        service: 1,
        heureArriver: '',
        date: '',
        idVisitor: null
    });
    console.log("DEBUG NAVIGATION STATE:", location.state);

    // --- INIT FORMULAIRE ---
    useEffect(() => {
        if (userRole !== 'Visiteur') {
            visitorService.getAll().then(setVisitors).catch(console.error);
        }

        if (isReprogramMode) {
            // 1. On cherche l'ID et les infos du visiteur
            let visitorIdFound = initialData.idVisitor || initialData.IdVisitor || 
                                 initialData.visitorId || initialData.VisitorId;

            if (!visitorIdFound && userRole === 'Visiteur') {
                const user = JSON.parse(localStorage.getItem('user') || '{}');
                visitorIdFound = user.visitorId || user.VisitorId || user.id;
            }

            setFormData({
                motif: initialData.motif || initialData.Motif || '',
                service: initialData.service || initialData.Service || 1,
                heureArriver: (initialData.heureArriver || initialData.HeureArriver || '').substring(0, 5),
                date: (initialData.date || initialData.Date || '').split('T')[0],
                idVisitor: visitorIdFound
            });

            console.log("Reprogrammation - ID Visiteur récupéré:", visitorIdFound);

            // Gérer l'affichage du nom du visiteur concerné pour l'Admin ou le Visiteur lui-même
            if (userRole === 'Visiteur') {
                const user = JSON.parse(localStorage.getItem('user') || '{}');
                setCurrentVisitorName(`${user.nom || ''} ${user.prenom || ''}`);
            } else if (initialData.visitor || initialData.Visitor) {
                const v = initialData.visitor || initialData.Visitor;
                setCurrentVisitorName(`${v.nom || v.Nom || ''} ${v.prenom || v.Prenom || ''}`.trim() || v.email || v.Email || 'Visiteur');
            } else if (initialData.nom_visitor || initialData.Nom_visitor) {
                const nom = initialData.nom_visitor || initialData.Nom_visitor || '';
                const prenom = initialData.prenom_visitor || initialData.Prenom_visitor || '';
                setCurrentVisitorName(`${nom} ${prenom}`.trim());
            } else {
                setCurrentVisitorName(`Visiteur N° ${visitorIdFound}`);
            }
        } else if (selectedFromList) {
            setFormData(prev => ({
                ...prev,
                idVisitor: selectedFromList.id,
                heureArriver: new Date().toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'}),
                date: new Date().toISOString().split('T')[0]
            }));
        } else {
            if (userRole === 'Visiteur') {
                const user = JSON.parse(localStorage.getItem('user') || '{}');
                const email = user.email || user.Email;
                setCurrentVisitorName(`${user.nom || ''} ${user.prenom || ''}`);
                
                if (email) {
                    visitorService.getByEmail(email).then(res => {
                        setFormData(prev => ({
                            ...prev,
                            idVisitor: res.visitorId || res.VisitorId || res.id || null,
                            heureArriver: new Date().toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'}),
                            date: new Date().toISOString().split('T')[0]
                        }));
                    }).catch(() => toast.error("Impossible de récupérer le profil visiteur."));
                }
            } else {
                setFormData(prev => ({
                    ...prev,
                    heureArriver: new Date().toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'}),
                    date: new Date().toISOString().split('T')[0]
                }));
            }
        }
    }, [isReprogramMode, initialData, selectedFromList, userRole]);

    // --- VÉRIFICATION CRÉNEAUX ---
    // --- INIT FORMULAIRE MODIFIÉ ET SÉCURISÉ ---
    useEffect(() => {
        if (userRole !== 'Visiteur') {
            visitorService.getAll().then(setVisitors).catch(console.error);
        }

        if (isReprogramMode) {
            // 1. On cherche l'ID et les infos du visiteur
            let visitorIdFound = initialData.idVisitor || initialData.IdVisitor || 
                                 initialData.visitorId || initialData.VisitorId;

            if (!visitorIdFound && userRole === 'Visiteur') {
                const user = JSON.parse(localStorage.getItem('user') || '{}');
                visitorIdFound = user.visitorId || user.VisitorId || user.id;
            }

            // 2. CORRECTION DU SERVICE : Gérer le format texte (ex: "Service_RH" ou "Service RH")
            let rawService = initialData.service || initialData.Service || 1;
            let resolvedService = 1; // Valeur par défaut (Direction)

            if (typeof rawService === 'string') {
                // Nettoyage de la chaîne venant du backend (enlève les espaces et underscores)
                const cleanService = rawService.toLowerCase().replace(/_/g, '').replace(/\s/g, '');
                
                if (cleanService.includes('rh') || cleanService.includes('ressources')) {
                    resolvedService = 2;
                } else if (cleanService.includes('financier') || cleanService.includes('compta')) {
                    resolvedService = 3;
                } else if (cleanService.includes('informatique') || cleanService.includes('it')) {
                    resolvedService = 4;
                } else if (cleanService.includes('secretariat')) {
                    resolvedService = 5;
                } else if (cleanService.includes('direction')) {
                    resolvedService = 1;
                } else {
                    // Si c'est une chaîne numérique "2", on la convertit simplement
                    resolvedService = parseInt(rawService, 10) || 1;
                }
            } else {
                resolvedService = Number(rawService) || 1;
            }

            setFormData({
                motif: initialData.motif || initialData.Motif || '',
                service: resolvedService, // Utilise la clé numérique nettoyée
                heureArriver: (initialData.heureArriver || initialData.HeureArriver || '').substring(0, 5),
                date: (initialData.date || initialData.Date || '').split('T')[0],
                idVisitor: visitorIdFound
            });

            // Gérer l'affichage du nom du visiteur concerné
            if (userRole === 'Visiteur') {
                const user = JSON.parse(localStorage.getItem('user') || '{}');
                setCurrentVisitorName(`${user.nom || ''} ${user.prenom || ''}`);
            } else if (initialData.visitor || initialData.Visitor) {
                const v = initialData.visitor || initialData.Visitor;
                setCurrentVisitorName(`${v.nom || v.Nom || ''} ${v.prenom || v.Prenom || ''}`.trim() || v.email || v.Email || 'Visiteur');
            } else if (initialData.nom_visitor || initialData.Nom_visitor) {
                const nom = initialData.nom_visitor || initialData.Nom_visitor || '';
                const prenom = initialData.prenom_visitor || initialData.Prenom_visitor || '';
                setCurrentVisitorName(`${nom} ${prenom}`.trim());
            } else {
                setCurrentVisitorName(`Visiteur N° ${visitorIdFound}`);
            }
        } else if (selectedFromList) {
            setFormData(prev => ({
                ...prev,
                idVisitor: selectedFromList.id,
                heureArriver: new Date().toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'}),
                date: new Date().toISOString().split('T')[0]
            }));
        } else {
            if (userRole === 'Visiteur') {
                const user = JSON.parse(localStorage.getItem('user') || '{}');
                const email = user.email || user.Email;
                setCurrentVisitorName(`${user.nom || ''} ${user.prenom || ''}`);
                
                if (email) {
                    visitorService.getByEmail(email).then(res => {
                        setFormData(prev => ({
                            ...prev,
                            idVisitor: res.visitorId || res.VisitorId || res.id || null,
                            heureArriver: new Date().toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'}),
                            date: new Date().toISOString().split('T')[0]
                        }));
                    }).catch(() => toast.error("Impossible de récupérer le profil visiteur."));
                }
            } else {
                setFormData(prev => ({
                    ...prev,
                    heureArriver: new Date().toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'}),
                    date: new Date().toISOString().split('T')[0]
                }));
            }
        }
    }, [isReprogramMode, initialData, selectedFromList, userRole]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.service || formData.service === "") {
            toast.error("Veuillez sélectionner un service.");
            return;
        }

        const visitId = initialData?.id || initialData?.Id;
        const serviceValue = parseInt(formData.service, 10);

        if (isNaN(serviceValue) || serviceValue < 1) {
            toast.error("Veuillez sélectionner un service valide.");
            return;
        }

        const payload = {
            Id: Number(visitId),
            Motif: formData.motif,
            Service: serviceValue, 
            Date: formData.date,
            HeureArriver: formData.heureArriver.length === 5 ? `${formData.heureArriver}:00` : formData.heureArriver,
            Statut: isReprogramMode ? 2 : (parseInt(formData.statut, 10) || 1), // Statut 2 = Accepté en cas de reprogrammation
            IdVisitor: parseInt(formData.idVisitor, 10) || 0
        };

        console.log("Payload prêt pour le backend :", payload);

        try {
            setLoading(true);
            if (isReprogramMode) {
                await visitService.updateVisit(visitId, payload);
                toast.success("Visite reprogrammée avec succès !");
            } else {
                await visitService.create(payload);
                toast.success("Visite créée !");
            }
            navigate('/agent-visits');
        } catch (err) {
            console.error("Erreur serveur :", err.response?.data?.errors);
            toast.error("Vérifiez le champ 'Service'.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-slate-50">
            <Toaster position="top-right" />
            <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

            <main className={`flex-1 p-8 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
                <div className="max-w-2xl mx-auto">
                    <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 hover:text-blue-600 mb-8 font-bold text-xs uppercase">
                        <ArrowLeft size={14} /> Retour
                    </button>

                    <div className="bg-white p-10 rounded-[3rem] shadow-xl">
                        <h1 className="text-3xl font-black text-slate-800 mb-8 italic uppercase">
                            {isReprogramMode ? "Reprogrammation" : "Nouvelle Visite"}
                        </h1>

                        <form onSubmit={handleSubmit} className="space-y-6">

                            {/* Info Bulles pour l'Admin en mode reprogrammation */}
                            {isReprogramMode && userRole !== 'Visiteur' && (
                                <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-xl flex gap-3 items-start">
                                    <Info className="text-blue-500 shrink-0" size={18} />
                                    <p className="text-blue-800 text-xs font-bold leading-relaxed">
                                        Note : Cette action reprogrammera la visite et la marquera comme <span className="underline">ACCEPTÉE</span> automatiquement.
                                    </p>
                                </div>
                            )}

                            {/* SECTION VISITEUR */}
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                    <User size={14} className="text-blue-500" /> Visiteur concerné
                                </label>
                                
                                {isReprogramMode ? (
                                    /* Si on reprogramme (Admin ou autre), on affiche directement le nom sans menu déroulant */
                                    <div className="w-full bg-blue-50/50 border border-blue-100 rounded-2xl p-4 font-bold text-blue-700 flex justify-between items-center">
                                        <span>{currentVisitorName || 'Chargement...'}</span>
                                        <span className="text-[9px] bg-blue-600 text-white px-2 py-1 rounded-full uppercase">
                                            {userRole === 'Visiteur' ? 'Moi' : 'Sélectionné'}
                                        </span>
                                    </div>
                                ) : userRole !== 'Visiteur' ? (
                                    /* Mode création normale pour un agent/admin */
                                    <select 
                                        name="idVisitor" 
                                        value={formData.idVisitor || ""} 
                                        onChange={handleInputChange}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 font-bold text-slate-700 outline-none focus:ring-2 ring-blue-500/20"
                                    >
                                        <option value="">Sélectionnez un visiteur</option>
                                        {visitors.map(v => (
                                            <option key={v.id} value={v.id}>
                                                {v.nom} {v.prenom}
                                            </option>
                                        ))}
                                    </select>
                                ) : (
                                    /* Mode création normale pour un Visiteur connecté */
                                    <div className="w-full bg-blue-50/50 border border-blue-100 rounded-2xl p-4 font-bold text-blue-700 flex justify-between items-center">
                                        <span>{currentVisitorName || 'Chargement...'}</span>
                                        <span className="text-[9px] bg-blue-600 text-white px-2 py-1 rounded-full uppercase">Moi</span>
                                    </div>
                                )}
                            </div>

                            {/* SERVICE */}
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Service à visiter</label>
                                <select
                                    name="service"
                                    value={formData.service}
                                    onChange={handleInputChange}
                                    disabled={isReprogramMode} // BLOQUÉ EN MODE REPROGRAMMATION
                                    className={`w-full border rounded-2xl p-4 font-bold outline-none focus:ring-2 ring-blue-500/20 ${
                                        isReprogramMode ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed' : 'bg-slate-50 border-slate-100 text-slate-700'
                                    }`}
                                >
                                    {Object.entries(SERVICE_NAMES).map(([key, name]) => (
                                        <option key={key} value={key}>{name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* DATE + HEURE */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Date</label>
                                    <input
                                        type="date"
                                        name="date"
                                        required
                                        value={formData.date}
                                        min={new Date().toISOString().split('T')[0]}
                                        onChange={handleInputChange}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 font-bold text-slate-700 focus:ring-2 ring-blue-500/20"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Heure d'arrivée</label>
                                    <input
                                        type="time"
                                        name="heureArriver"
                                        required
                                        value={formData.heureArriver}
                                        onChange={handleInputChange}
                                        className={`w-full bg-slate-50 border rounded-2xl p-4 font-bold outline-none focus:ring-2 ring-blue-500/20 ${
                                            creneauWarning ? 'border-red-300 bg-red-50 text-red-700' : 'border-slate-100 text-slate-700'
                                        }`}
                                    />
                                </div>
                            </div>

                            {/* WARNINGS CRÉNEAUX */}
                            {creneauWarning && (
                                <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-xs font-bold flex items-center gap-2">
                                    ⚠️ {creneauWarning}
                                </div>
                            )}

                            {creneauxPris.length > 0 && (
                                <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl">
                                    <p className="text-[10px] font-black text-amber-600 uppercase tracking-wider mb-2 flex items-center gap-2">
                                        <Clock size={12} /> Déjà réservés pour {SERVICE_NAMES[formData.service]} :
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {creneauxPris.map((h, i) => (
                                            <span key={i} className="bg-red-100 text-red-600 text-xs font-black px-2 py-1 rounded-lg">🚫 {h}</span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* MOTIF */}
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Motif</label>
                                <textarea
                                    name="motif"
                                    required
                                    placeholder="Ex: Entretien..."
                                    value={formData.motif}
                                    readOnly={isReprogramMode} // BLOQUÉ EN MODE REPROGRAMMATION
                                    onChange={handleInputChange}
                                    className={`w-full border rounded-2xl p-4 h-32 font-medium outline-none focus:ring-2 ring-blue-500/20 ${
                                        isReprogramMode ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed' : 'bg-slate-50 border-slate-100 text-slate-700'
                                    }`}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !!creneauWarning}
                                className={`w-full py-5 rounded-2xl font-black text-lg shadow-xl transition-all flex items-center justify-center gap-3 ${
                                    creneauWarning ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95'
                                }`}
                            >
                                <Send size={20} />
                                {loading ? "CHARGEMENT..." : isReprogramMode ? "CONFIRMER LA REPROGRAMMATION" : "VALIDER"}
                            </button>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default CreateVisit;