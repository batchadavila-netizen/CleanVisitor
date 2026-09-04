import React, { useState, useEffect, useRef } from 'react';
import * as signalR from '@microsoft/signalr';
import { Bell, CheckCircle2, Clock, Calendar, AlertCircle } from 'lucide-react';

const Notification = ({ userRole, userId }) => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Charger l'historique au chargement
    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const url = (userRole === 'Admin' || userRole === '1')
                    ? 'http://localhost:5283/api/Notifications/admin' 
                    : `http://localhost:5283/api/Notifications/visitor/${userId}`;
                
                const response = await fetch(url);
                if (response.ok) {
                    const data = await response.json();
                    setNotifications(data);
                    
                    // Gestion souple de la casse JSON (isRead ou IsRead)
                    const unread = data.filter(n => !(n.isRead ?? n.IsRead)).length;
                    setUnreadCount(unread);
                }
            } catch (err) {
                console.error("Erreur chargement notifications:", err);
            }
        };

        if (userId || userRole === 'Admin' || userRole === '1') {
            fetchHistory();
        }

        // Connexion SignalR (Temps réel)
        const connection = new signalR.HubConnectionBuilder()
            .withUrl("http://localhost:5283/notificationHub")
            .withAutomaticReconnect()
            .build();

        connection.start().then(() => {
            connection.on("ReceiveStatusUpdate", (data) => {
                const isAdmin = userRole === 'Admin' || userRole === '1';
                const notifType = data.type || (isAdmin ? "NEW_VISIT" : "STATUS_UPDATE");
                addNewNotification(data.message, notifType);
            });
        }).catch(err => console.error("SignalR Error:", err));

        return () => connection.stop();
    }, [userId, userRole]);

    // Fermer le menu au clic extérieur
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const addNewNotification = (msg, type) => {
        const messageText = typeof msg === 'string' ? msg : (msg?.message || '');
        const newNotif = {
            id: Date.now(),
            message: messageText,
            dateEnvoi: new Date().toISOString(),
            isRead: false,
            type: type
        };
        setNotifications(prev => [newNotif, ...prev]);
        setUnreadCount(prev => prev + 1);
    };

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true, IsRead: true })));
        setUnreadCount(0);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bouton cloche */}
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-xl transition-all focus:outline-none"
            >
                <Bell size={22} />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Menu déroulant de l'historique */}
            {isOpen && (
                <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 overflow-hidden font-sans animate-in fade-in slide-in-from-top-2 duration-200">
                    
                    {/* En-tête */}
                    <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <h3 className="font-bold text-slate-800 text-sm">Notifications</h3>
                            <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                                {notifications.length}
                            </span>
                        </div>
                        {unreadCount > 0 && (
                            <button 
                                onClick={markAllAsRead}
                                className="text-xs font-semibold text-blue-600 hover:underline"
                            >
                                Tout marquer comme lu
                            </button>
                        )}
                    </div>

                    {/* Liste des notifications */}
                    <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center text-slate-400 text-sm">
                                <Bell size={32} className="mx-auto mb-2 opacity-30" />
                                Aucune notification dans l'historique
                            </div>
                        ) : (
                            notifications.map((notif, idx) => {
                                const isRead = notif.isRead ?? notif.IsRead ?? false;
                                const notifType = notif.type ?? notif.Type;
                                const dateVal = notif.dateEnvoi ?? notif.DateEnvoi ?? new Date();

                                return (
                                    <div 
                                        key={notif.id ?? notif.Id ?? idx}
                                        className={`p-4 transition-colors flex gap-3 ${
                                            !isRead ? 'bg-blue-50/40 hover:bg-blue-50/70' : 'hover:bg-slate-50'
                                        }`}
                                    >
                                        {/* Icône selon le type */}
                                        <div className="mt-0.5 shrink-0">
                                            {notifType === 'NEW_VISIT' && <AlertCircle size={18} className="text-blue-500" />}
                                            {notifType === 'STATUS_UPDATE' && <CheckCircle2 size={18} className="text-green-500" />}
                                            {notifType === 'REPROGRAMMATION' && <Calendar size={18} className="text-orange-500" />}
                                            {(!notifType || notifType === 'VISIT_UPDATE') && <Clock size={18} className="text-indigo-500" />}
                                        </div>

                                        {/* Contenu */}
                                        <div className="flex-1">
                                            <p className="text-xs text-slate-800 font-medium leading-relaxed mb-1">
                                                {notif.message ?? notif.Message}
                                            </p>
                                            <span className="text-[10px] text-slate-400 font-medium">
                                                {new Date(dateVal).toLocaleDateString('fr-FR', {
                                                    day: '2-digit',
                                                    month: 'short',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </span>
                                        </div>

                                        {/* Puce non-lu */}
                                        {!isRead && (
                                            <div className="w-2 h-2 rounded-full bg-blue-600 self-center shrink-0" />
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Notification;