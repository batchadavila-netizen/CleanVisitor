namespace CleanVisitor.Application.Features.Notifications.Interfaces.IRealTimeNotificationService;
public interface IRealTimeNotificationService
{
    Task SendStatusUpdateAsync(string email, string message, string type);
}