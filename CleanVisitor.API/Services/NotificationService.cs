// Fichier : CleanVisitor.Api/Services/VisitNotificationService.cs
using CleanVisitor.Application.Features.Visite.Interfaces;
using CleanVisitor.Api.Hubs; // Ton Hub SignalR
using Microsoft.AspNetCore.SignalR;
using CleanVisitor.Application.Features.Notifications.Interfaces.IRealTimeNotificationService;

namespace CleanVisitor.Api.Services;

public class NotificationService : IRealTimeNotificationService
{
    private readonly IHubContext<VisitHub> _hubContext;

    public NotificationService(IHubContext<VisitHub> hubContext)
    {
        _hubContext = hubContext;
    }

    public async Task SendStatusUpdateAsync(string email, string message, string type)
    {
        await _hubContext.Clients.All.SendAsync("ReceiveStatusUpdate", new { email, message, type });
    }
}