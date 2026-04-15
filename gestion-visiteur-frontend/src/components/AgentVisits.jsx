import React, { useState, useEffect } from 'react';
import { visitService } from '../services/visitService';
import Sidebar from '../components/Sidebar';
import CreateVisitModal from './CreateVisitModal'; // Nouveau composant

const AgentVisits = () => {
  const [visits, setVisits] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const loadVisits = async () => {
    const data = await visitService.getAll();
    setVisits(data);
  };

  useEffect(() => { loadVisits(); }, []);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      
      <main className={`flex-1 p-8 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-2xl font-black text-slate-800">Gestion Visites</h1>
            <p className="text-slate-500 text-sm">Registre des entrées et sorties</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-bold shadow-lg transition-transform active:scale-95"
          >
            + Nouveau Visiteur
          </button>
        </div>

        {/* Tableau des visites */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <table className="w-full text-left">
             {/* ... Structure du tableau avec boutons Modifier / Supprimer / Reprogrammer ... */}
          </table>
        </div>

        {/* La Modale de création */}
        {isModalOpen && (
          <CreateVisitModal 
            onClose={() => setIsModalOpen(false)} 
            onSuccess={() => { setIsModalOpen(false); loadVisits(); }} 
          />
        )}
      </main>
    </div>
  );
};
export default AgentVisits;