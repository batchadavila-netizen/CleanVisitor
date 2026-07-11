using MailKit.Net.Smtp;
using MimeKit;
using CleanVisitor.Application.Features.Visite.Interfaces;
using CleanVisitor.Application.Features.Visite.Commande.EmailSetting;
using Microsoft.Extensions.Options;
using System.Threading.Tasks;

namespace CleanVisitor.Infrastructure.Services;

public class EmailService : IEmailService
{
    private readonly EmailCommande _settings;

    public EmailService(IOptions<EmailCommande> settings)
    {
        _settings = settings.Value;
    }
    public async Task SendEmailAsync(string to, string subject, string body, string? replyToEmail = null)
    {
        var email = new MimeMessage();
        
        // 1. L'expéditeur officiel est TOUJOURS ton compte d'application pour éviter le blocage Google
        email.From.Add(new MailboxAddress("Gestion Visiteur", _settings.Email));
        
        email.To.Add(MailboxAddress.Parse(to));
        email.Subject = subject;
        email.Body = new TextPart(MimeKit.Text.TextFormat.Html) { Text = body };

        // 2. LA MAGIE DU REPLY-TO : Si un e-mail de visiteur est fourni, on l'injecte ici
        if (!string.IsNullOrEmpty(replyToEmail))
        {
            email.ReplyTo.Add(MailboxAddress.Parse(replyToEmail));
        }

        using var smtp = new SmtpClient();
        try 
        {
            await smtp.ConnectAsync(_settings.Host, _settings.Port, MailKit.Security.SecureSocketOptions.StartTls);
            await smtp.AuthenticateAsync(_settings.Email, _settings.Password);
            await smtp.SendAsync(email);
        }
        finally 
        {
            await smtp.DisconnectAsync(true);
        }
    }
}