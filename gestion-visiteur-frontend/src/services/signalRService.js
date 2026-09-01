import * as signalR from "@microsoft/signalr";

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5283/api';
// Extrait le domaine racine pour pointer vers le Hub (/visitHub)
const HUB_URL = `${new URL(API_BASE).origin}/visitHub`;

const connection = new signalR.HubConnectionBuilder()
    .withUrl(HUB_URL, {
      // Optionnel : Transmission du token Clerk au Hub SignalR
      accessTokenFactory: async () => await window.Clerk?.session?.getToken()
    })
    .withAutomaticReconnect()
    .build();

export const startSignalRConnection = async () => {
    if (connection.state === signalR.HubConnectionState.Disconnected) {
        try {
            await connection.start();
            console.log("SignalR: Connecté au Hub !");
        } catch (err) {
            console.error("SignalR: Erreur de connexion", err);
            setTimeout(startSignalRConnection, 5000);
        }
    }
};

export default connection;