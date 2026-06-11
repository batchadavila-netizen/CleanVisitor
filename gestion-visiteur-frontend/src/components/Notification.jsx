import React, { useState, useEffect } from 'react';
import * as signalR from '@microsoft/signalr';
import { notificationService } from '../services/notificationService';

const Notification = ({ userRole, userId }) => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        // 1. Charger l'historique existant depuis la base de données
        const fetchHistory = async () => {
            const url = userRole === 'Admin' 
                ? '/api/Notifications' 
                : `/api/Notifications/visitor/${userId}`;
            const response = await fetch(url);
            const data = await response.json();
            setNotifications(data);
            setUnreadCount(data.filter(n => !n.isRead).length);
        };

        fetchHistory();

        // 2. Configurer SignalR pour les futures modifications (Temps Réel)
        const connection = new signalR.HubConnectionBuilder()
            .withUrl("http://localhost:5283/notificationHub")
            .withAutomaticReconnect()
            .build();

        connection.start().then(() => {
            // Si c'est l'admin, il écoute les nouvelles visites
            if (userRole === 'Admin') {
                connection.on("ReceiveNotification", (message) => {
                    addNewNotification(message);
                });
            } 
            // Si c'est le visiteur, il écoute les changements de statut
            else {
                connection.on("StatusUpdated", (message) => {
                    addNewNotification(message);
                });
            }
        });

        return () => connection.stop();
    }, [userId, userRole]);

    const addNewNotification = (msg) => {
        setNotifications(prev => [msg, ...prev]);
        setUnreadCount(prev => prev + 1);
    };

    return (
        <div className="relative">
            <span className="icon">🔔</span>
            {unreadCount > 0 && (
                <span className="badge bg-red-500 text-white rounded-full px-2">
                    {unreadCount}
                </span>
            )}
            {/* Ici tu peux ajouter un menu déroulant pour afficher la liste 'notifications' */}
        </div>
    );
};
export default Notification;