import React, { useState, useEffect } from 'react';
import { visitorService } from '../services/visitorService';
import { visitService } from '../services/visitService';
import Sidebar from './Sidebar';

const CreateVisit = () => {
    const [visitors, setVisitors] = useState([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    
    const [formData, setFormData] = useState({
        motif: '',
        idVisitor: '',
        service: 1, 
        heureArriver: new Date().toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'}),
        date: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
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
        
        const payload = {
            motif: formData.motif,
            idVisitor: Number(formData.idVisitor),
            service: Number(formData.service),
            heureArriver: formData.heureArriver.length === 5 ? `${formData.heureArriver}:00` : formData.heureArriver,
            date: formData.date,
            statut: 1,
            isDeleted: false
        };

        try {
            // APPEL CREATE UNIQUEMENT
            await visitService.create(payload);
            alert("Nouvelle visite créée avec succès !");
            
            // Reset du formulaire après succès
            setFormData({
                ...formData,
                motif: '',
                idVisitor: ''
            });
        } catch (err) {
            console.error("Erreur:", err.response?.data);
            alert("Erreur lors de l'enregistrement");
        }
    };

    return (
        <div className="flex min-h-screen bg-slate-50">
            <Sidebar 
                isOpen={isSidebarOpen} 
                toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
            />

            <main className={`flex-1 p-8 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
                <div className="max-w-2xl mx-auto">
                    <div className="mb-8">
                        <h1 className="text-3xl font-black text-slate-800">Enregistrer une visite</h1>
                        <p className="text-slate-400 text-sm font-medium">Nouveau passage de visiteur</p>
                    </div>

                    <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl shadow-slate-200/60 border border-slate-100">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            
                            {/* Sélection du Visiteur */}
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                                    Visiteur concerné
                                </label>
                                <select 
                                    required
                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 outline-none font-bold text-slate-700 appearance-none cursor-pointer focus:ring-2 ring-blue-500/20 transition-all"
                                    value={formData.idVisitor}
                                    onChange={(e) => setFormData({...formData, idVisitor: e.target.value})}
                                >
                                    <option value="">-- Sélectionnez un visiteur --</option>
                                    {visitors.map(v => (
                                        <option key={v.id} value={v.id}>{v.nom} {v.prenom}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Date et Heure */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                                        Date
                                    </label>
                                    <input 
                                        type="date"
                                        value={formData.date}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 outline-none font-bold text-slate-600 focus:ring-2 ring-blue-500/20"
                                        onChange={(e) => setFormData({...formData, date: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                                        Heure d'arrivée
                                    </label>
                                    <input 
                                        type="time"
                                        value={formData.heureArriver}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 outline-none font-bold text-slate-600 focus:ring-2 ring-blue-500/20"
                                        onChange={(e) => setFormData({...formData, heureArriver: e.target.value})}
                                    />
                                </div>
                            </div>

                            {/* Sélection du Service */}
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                                    Service à visiter
                                </label>
                                <select 
                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 outline-none font-bold text-slate-700 appearance-none cursor-pointer focus:ring-2 ring-blue-500/20"
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
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                                    Motif de la visite
                                </label>
                                <textarea 
                                    required
                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 outline-none h-32 resize-none font-medium text-slate-600 focus:ring-2 ring-blue-500/20 transition-all"
                                    placeholder="Précisez l'objet du rendez-vous..."
                                    value={formData.motif}
                                    onChange={(e) => setFormData({...formData, motif: e.target.value})}
                                />
                            </div>

                            <button 
                                type="submit" 
                                className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-blue-100 hover:bg-blue-700 hover:-translate-y-1 active:scale-95 transition-all"
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