import React, { useState, useEffect } from 'react';
import { visitorService } from '../services/visitorService';
import { visitService } from '../services/visitService';
import Sidebar from './Sidebar'; // Assure-toi que le chemin est correct

const CreateVisit = () => {
    const [visitors, setVisitors] = useState([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [formData, setFormData] = useState({
        motif: '',
        idVisitor: '',
        service: 1, // Direction par défaut
        heureArriver: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        date: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        // Chargement des visiteurs pour la liste déroulante
        const fetchVisitors = async () => {
            try {
                const data = await visitorService.getAll();
                setVisitors(data);
            } catch (err) {
                console.error("Erreur lors de la récupération des visiteurs:", err);
            }
        };
        fetchVisitors();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                idVisitor: parseInt(formData.idVisitor),
                service: parseInt(formData.service),
                statut: 1 // 1 = En attente (selon ton Enum C#)
            };
            await visitService.create(payload);
            alert("✅ Visite enregistrée ! En attente de validation par l'administration.");
            
            // Optionnel : Réinitialiser le motif après succès
            setFormData({ ...formData, motif: '' });
        } catch (err) {
            console.error(err);
            alert("❌ Erreur lors de la création de la visite. Vérifiez votre connexion au serveur.");
        }
    };

    return (
        <div className="flex min-h-screen bg-slate-50">
            {/* Barre latérale de navigation */}
            <Sidebar 
                isOpen={isSidebarOpen} 
                toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
            />

            {/* Contenu principal décalé selon la Sidebar */}
            <main className={`flex-1 p-8 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
                
                <div className="max-w-2xl mx-auto">
                    {/* En-tête de la page */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-black text-slate-800">Enregistrer une visite</h1>
                        <p className="text-slate-500">Remplissez les informations ci-dessous pour planifier une nouvelle rencontre.</p>
                    </div>

                    {/* Carte du Formulaire */}
                    <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100">
                        <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                            <span className="bg-blue-100 text-blue-600 w-8 h-8 rounded-lg flex items-center justify-center text-sm">📝</span>
                            Détails de la visite
                        </h2>
                        
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Sélection du Visiteur */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Visiteur concerné</label>
                                <select 
                                    required
                                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none"
                                    value={formData.idVisitor}
                                    onChange={(e) => setFormData({...formData, idVisitor: e.target.value})}
                                >
                                    <option value="">-- Sélectionnez un visiteur dans la liste --</option>
                                    {visitors.map(v => (
                                        <option key={v.id} value={v.id}>{v.nom} {v.prenom}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Sélection du Service */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Service à visiter</label>
                                <select 
                                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none"
                                    value={formData.service}
                                    onChange={(e) => setFormData({...formData, service: e.target.value})}
                                >
                                    <option value="1">Direction</option>
                                    <option value="2">Service RH</option>
                                    <option value="3">Service Financier</option>
                                    <option value="4">Service Informatique</option>
                                    <option value="5">Secrétariat</option>
                                </select>
                            </div>

                            {/* Motif */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Motif de la visite</label>
                                <textarea 
                                    required
                                    rows="4"
                                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
                                    placeholder="Précisez l'objet du rendez-vous..."
                                    value={formData.motif}
                                    onChange={(e) => setFormData({...formData, motif: e.target.value})}
                                />
                            </div>

                            {/* Bouton de soumission */}
                            <button 
                                type="submit" 
                                className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-lg shadow-lg shadow-blue-200 hover:bg-blue-700 hover:-translate-y-1 active:scale-95 transition-all"
                            >
                                CONFIRMER L'ENREGISTREMENT
                            </button>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default CreateVisit;