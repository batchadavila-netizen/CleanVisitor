using CleanVisitor.Core.Entities.Notification;
namespace CleanVisitor.Application.Features.Notifications.Interfaces;
public interface INotificationService
{
    // On définit UNE SEULE méthode capable de tout envoyer
    Task AddAsync(Notification notification);
    Task<IEnumerable<Notification>> GetAllAsync();
    // Task AddToDatabaseAsync(Notification notification);
    Task<IEnumerable<Notification>> GetAdminNotificationsAsync();
    Task<IEnumerable<Notification>> GetByVisitorIdAsync(int visitorId);
    // Task SendAllNotificationsAsync(string visitorEmail, string message, string type, int visitorId);
}