import React, { useState } from 'react';
import { visitService } from '../services/visitService';
import Sidebar from './Sidebar';

const RescheduleVisit = ({ visit, onCancel, onSuccess }) => {
    // On initialise avec les données existantes de la visite reçue en props
    const [formData, setFormData] = useState({
        date: visit.date.split('T')[0],
        heureArriver: visit.heureArriver.substring(0, 5) // Format HH:mm
    });

    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // On prépare le payload avec l'ID existant
        const payload = {
            ...visit, // On garde toutes les infos originales
            date: formData.date,
            heureArriver: formData.heureArriver.length === 5 
                          ? `${formData.heureArriver}:00` 
                          : formData.heureArriver,
            statut: 1 // On repasse en attente après modification
        };

        try {
            // APPEL OBLIGATOIRE A UPDATE
            await visitService.update(visit.id, payload);
            alert("Visite reprogrammée avec succès !");
            onSuccess(); // Fermer ou rediriger
        } catch (err) {
            console.error("Erreur update:", err);
            alert("Échec de la reprogrammation");
        }
    };

    return (
        <div className="flex min-h-screen bg-slate-50">
            <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
            
            <main className={`flex-1 p-8 transition-all ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
                <div className="max-w-md mx-auto mt-10">
                    <h1 className="text-2xl font-black text-slate-800 mb-6">Reprogrammer la visite #{visit.id}</h1>
                    
                    <form onSubmit={handleSubmit} className="bg-white p-8 rounded-[2rem] shadow-xl border border-slate-100 space-y-6">
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Nouvelle Date</label>
                            <input 
                                type="date" 
                                value={formData.date}
                                onChange={(e) => setFormData({...formData, date: e.target.value})}
                                className="w-full p-4 bg-slate-50 rounded-2xl border-none outline-none font-bold text-slate-700 focus:ring-2 ring-indigo-500/20"
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Nouvelle Heure</label>
                            <input 
                                type="time" 
                                value={formData.heureArriver}
                                onChange={(e) => setFormData({...formData, heureArriver: e.target.value})}
                                className="w-full p-4 bg-slate-50 rounded-2xl border-none outline-none font-bold text-slate-700 focus:ring-2 ring-indigo-500/20"
                            />
                        </div>

                        <div className="pt-4 space-y-3">
                            <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black shadow-lg hover:bg-indigo-700 transition-all">
                                CONFIRMER LE CHANGEMENT
                            </button>
                            <button type="button" onClick={onCancel} className="w-full py-2 text-slate-400 text-[10px] font-black uppercase">
                                Annuler
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
};

export default RescheduleVisit;