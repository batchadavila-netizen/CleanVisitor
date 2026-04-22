import * as signalR from "@microsoft/signalr";

// L'URL doit correspondre à app.MapHub("/visitHub") dans ton Program.cs
const HUB_URL = "http://localhost:5283/visitHub"; 

const connection = new signalR.HubConnectionBuilder()
    .withUrl(HUB_URL)
    .withAutomaticReconnect() // Reconnexion auto si le serveur redémarre
    .build();

export const startSignalRConnection = async () => {
    if (connection.state === signalR.HubConnectionState.Disconnected) {
        try {
            await connection.start();
            console.log("SignalR: Connecté au Hub !");
        } catch (err) {
            console.error("SignalR: Erreur de connexion", err);
            // Réessayer après 5 secondes si ça échoue
            setTimeout(startSignalRConnection, 5000);
        }
    }
};

export default connection;