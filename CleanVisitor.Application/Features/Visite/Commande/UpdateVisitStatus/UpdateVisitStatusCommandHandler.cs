using MediatR;
using Microsoft.Extensions.Configuration;
using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;
using MimeKit.Text;
using CleanVisitor.Application.Features.Visite.Interfaces;
using CleanVisitor.Application.Features.Notifications.Interfaces;
using CleanVisitor.Core.Entities.Notification;
using CleanVisitor.Application.Features.Notifications.Interfaces.IRealTimeNotificationService;

namespace CleanVisitor.Application.Features.Visite.Commande.UpdateVisitStatus;

public class UpdateVisitStatusCommandHandler : IRequestHandler<UpdateVisitStatusCommand, bool>
{
    private readonly IVisitRepository _visitRepository;
    private readonly INotificationService _notificationRepository;
    private readonly IRealTimeNotificationService _signalRService;
    private readonly IConfiguration _configuration;

    public UpdateVisitStatusCommandHandler(
        IVisitRepository visitRepository,
        INotificationService notificationRepository,
        IRealTimeNotificationService signalRService,
        IConfiguration configuration)
    {
        _visitRepository = visitRepository;
        _notificationRepository = notificationRepository;
        _signalRService = signalRService;
        _configuration = configuration;
    }

    public async Task<bool> Handle(UpdateVisitStatusCommand request, CancellationToken cancellationToken)
    {
        // 1. Récupérer la visite
        var visit = await _visitRepository.GetByIdAsync(request.Id);
        if (visit == null) return false;

        // 2. Mettre à jour le statut
        var success = await _visitRepository.UpdateStatusAsync(request.Id, request.NewStatus);

        if (success)
        {
            string statusLabel = request.NewStatus switch
            {
                1 => "en attente",
                2 => "acceptée",
                3 => "terminée",
                4 => "annulée",
                5 => "reprogrammée",
                _ => "mise à jour"
            };

            string notificationMessage = $"Votre visite est désormais {statusLabel}.";

            // A. Notification en base
            await _notificationRepository.AddAsync(new Notification
            {
                IdVisitor = visit.IdVisitor,
                Message = notificationMessage,
                DateEnvoi = DateTime.Now,
                Type = "STATUS_UPDATE",
                IsRead = false
            });

            // B. Email si adresse disponible
            // 🔥 FIX : bons noms de clés
            var smtpEmail    = _configuration["EmailCommand:Email"];
            var smtpPassword = _configuration["EmailCommand:Password"];
            var smtpHost     = _configuration["EmailCommand:Host"];
            var smtpPort     = int.Parse(_configuration["EmailCommand:Port"] ?? "587");

            // 🔥 Sécurité : vérification avant envoi
            if (!string.IsNullOrEmpty(visit.Email_visitor) 
                && !string.IsNullOrEmpty(smtpEmail) 
                && !string.IsNullOrEmpty(smtpPassword))
            {
                // SignalR temps réel
                await _signalRService.SendStatusUpdateAsync(
                    visit.Email_visitor, notificationMessage, "STATUS_UPDATE");

                var email = new MimeMessage();
                email.From.Add(MailboxAddress.Parse(smtpEmail));
                email.To.Add(MailboxAddress.Parse(visit.Email_visitor));
                email.Subject = $"Mise à jour de votre visite - {statusLabel.ToUpper()}";
                email.Body = new TextPart(TextFormat.Html)
                {
                    Text = $@"
                        <div style='font-family: sans-serif; padding: 20px;'>
                            <h3>Bonjour {visit.Nom_visitor},</h3>
                            <p>Le statut de votre demande de visite a été mis à jour : <b>{statusLabel}</b>.</p>
                            <p><b>Motif :</b> {visit.Motif}</p>
                            <br/>
                            <p>Merci d'utiliser notre service de gestion des visiteurs.</p>
                        </div>"
                };

                try
                {
                    using var smtp = new SmtpClient();
                    await smtp.ConnectAsync(smtpHost, smtpPort, SecureSocketOptions.StartTls);
                    await smtp.AuthenticateAsync(smtpEmail, smtpPassword);
                    await smtp.SendAsync(email);
                    await smtp.DisconnectAsync(true);
                    Console.WriteLine($"✅ Email envoyé à {visit.Email_visitor}");
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"[EMAIL ERROR] {ex.Message}");
                }
            }
            else
            {
                Console.WriteLine($"[EMAIL] Ignoré — email visiteur: '{visit.Email_visitor}' | config smtp: '{smtpEmail}'");
            }
        }

        return success;
    }
}