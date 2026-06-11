using Microsoft.AspNetCore.Mvc;
using CleanVisitor.Application.Features.Notifications.Interfaces;

[ApiController]
[Route("api/[controller]")]
public class NotificationsController : ControllerBase
{
    private readonly INotificationService _notificationService;

    public NotificationsController(INotificationService notificationService)
    {
        _notificationService = notificationService;
    }

    // 1. Pour le Dashboard ADMIN (Uniquement les notifs destinées à l'admin)
    [HttpGet("admin")] // On change la route ici
    public async Task<IActionResult> GetAdminNotifications()
    {
        // On demande au service de ne filtrer que les notifs Admin
        var notifications = await _notificationService.GetAdminNotificationsAsync(); 
        return Ok(notifications);
    }

    // 2. Pour le Dashboard VISITEUR (Uniquement pour ce visiteur précis)
    [HttpGet("visitor/{id}")]
    public async Task<IActionResult> GetByVisitor(int id)
    {
        var notifications = await _notificationService.GetByVisitorIdAsync(id);
        return Ok(notifications);
    }
}