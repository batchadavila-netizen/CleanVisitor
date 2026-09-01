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
        // 1. Récupérer la visite (qui utilise désormais LEFT JOIN [User] dans le VisitRepository)
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

            string notificationMessage = $"Votre visite du {visit.Date:dd/MM/yyyy} est désormais {statusLabel}.";

            // A. Sauvegarde de la notification en BDD
            try
            {
                await _notificationRepository.AddAsync(new Notification
                {
                    IdVisitor = visit.IdVisitor,
                    Message = notificationMessage,
                    DateEnvoi = DateTime.Now,
                    Type = "STATUS_UPDATE",
                    IsRead = false,
                    ReceiverRole = "Visiteur"
                });
                Console.WriteLine("✅ Notification enregistrée en BDD.");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[NOTIFICATION ERROR] {ex.Message}");
            }

            // B. Envoi temps réel SignalR (Front-end Toast / Live Update)
            try
            {
                string targetEmail = visit.Email_visitor ?? "";
                await _signalRService.SendStatusUpdateAsync(targetEmail, notificationMessage, "STATUS_UPDATE");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[SIGNALR ERROR] {ex.Message}");
            }

            // C. Envoi de l'Email au visiteur
            var smtpEmail    = _configuration["EmailCommand:Email"];
            var smtpPassword = _configuration["EmailCommand:Password"];
            var smtpHost     = _configuration["EmailCommand:Host"];
            var smtpPort     = int.Parse(_configuration["EmailCommand:Port"] ?? "587");

            if (!string.IsNullOrEmpty(visit.Email_visitor) 
                && !string.IsNullOrEmpty(smtpEmail) 
                && !string.IsNullOrEmpty(smtpPassword))
            {
                var email = new MimeMessage();
                email.From.Add(MailboxAddress.Parse(smtpEmail));
                email.To.Add(MailboxAddress.Parse(visit.Email_visitor));
                email.Subject = $"🔔 Mise à jour de votre visite : {statusLabel.ToUpper()}";
                email.Body = new TextPart(TextFormat.Html)
                {
                    Text = $@"
                        <div style='font-family: sans-serif; padding: 20px; color: #1E293B;'>
                            <h2>Bonjour {visit.Nom_visitor ?? "Visiteur"},</h2>
                            <p>Le statut de votre demande de visite a été mis à jour : <b style='color: #2563EB;'>{statusLabel.ToUpper()}</b>.</p>
                            <hr style='border: 0; border-top: 1px solid #E2E8F0; margin: 15px 0;' />
                            <p><b>Motif :</b> {visit.Motif}</p>
                            <p><b>Date :</b> {visit.Date:dd/MM/yyyy}</p>
                            <p><b>Heure :</b> {visit.HeureArriver}</p>
                            <br/>
                            <p>Connectez-vous à votre espace personnel pour consulter votre Pass d'accès.</p>
                        </div>"
                };

                try
                {
                    using var smtp = new SmtpClient();
                    await smtp.ConnectAsync(smtpHost, smtpPort, SecureSocketOptions.StartTls, cancellationToken);
                    await smtp.AuthenticateAsync(smtpEmail, smtpPassword, cancellationToken);
                    await smtp.SendAsync(email, cancellationToken);
                    await smtp.DisconnectAsync(true, cancellationToken);
                    Console.WriteLine($"✅ Email de confirmation envoyé à {visit.Email_visitor}");
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"[EMAIL ERROR] {ex.Message}");
                }
            }
            else
            {
                Console.WriteLine($"[EMAIL IGNORED] Email visiteur: '{visit.Email_visitor}' | Smtp: '{smtpEmail}'");
            }
        }

        return success;
    }
}