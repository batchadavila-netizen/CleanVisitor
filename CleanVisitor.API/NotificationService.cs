// Fichier : CleanVisitor.Api/Services/VisitNotificationService.cs
using CleanVisitor.Application.Features.Visite.Interfaces;
using CleanVisitor.Api.Hubs; // Ton Hub SignalR
using Microsoft.AspNetCore.SignalR;

namespace CleanVisitor.Api.Services;

public class VisitNotificationService : IVisitNotificationService
{
    private readonly IHubContext<VisitHub> _hubContext;

    public VisitNotificationService(IHubContext<VisitHub> hubContext)
    {
        _hubContext = hubContext;
    }

    public async Task SendNotificationAsync(string userEmail, string message, string type)
    {
        // On peut envoyer à tous, mais on ajoute l'email pour que le Front sache à qui s'adresse le toast
        await _hubContext.Clients.All.SendAsync("ReceiveStatusUpdate", new { 
            email = userEmail, 
            message = message, 
            type = type 
        });
    }
}