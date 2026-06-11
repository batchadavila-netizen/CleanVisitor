namespace CleanVisitor.Application.Features.Visite.Interfaces;

public interface IEmailService
{
    Task SendEmailAsync(string to, string subject, string body, string? replyToEmail = null);
}