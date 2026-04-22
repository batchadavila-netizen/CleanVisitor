namespace CleanVisitor.Application.Features.Visite.Interfaces;

public interface IEmailService
{
    // On définit une méthode simple pour envoyer un email
    Task SendEmailAsync(string to, string subject, string body);
}