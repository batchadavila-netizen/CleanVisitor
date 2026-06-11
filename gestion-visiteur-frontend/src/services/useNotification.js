import { useState, useEffect, useCallback } from 'react';
import { notificationService } from './notificationService';

export const useNotification = (userId, role) => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = useCallback(async () => {
        try {
            setLoading(true);
            let data;

            if (role === 'Admin') {
                // Appel la route /api/Notifications/admin
                data = await notificationService.getAll(); 
            } else if (role === 'Visiteur' && userId) {
                // Appel la route /api/Notifications/visitor/{id}
                data = await notificationService.getByVisitor(userId);
            }

            // Extraction robuste du tableau JSON
            const finalData = Array.isArray(data) ? data : (data?.$values || []);
            setNotifications(finalData);

        } catch (error) {
            console.error("Erreur useNotification:", error);
        } finally {
            setLoading(false);
        }
    }, [userId, role]);
    
    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    return { notifications, loading, refresh: fetchNotifications };
};