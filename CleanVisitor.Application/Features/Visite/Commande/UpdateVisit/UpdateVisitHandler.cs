using MediatR;
using AutoMapper;
using Microsoft.Extensions.Configuration;
using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;
using MimeKit.Text;
using CleanVisitor.Core.Entities.Visits;
using CleanVisitor.Core.Entities.Notification;
using CleanVisitor.Application.Features.Visite.Dtos;
using CleanVisitor.Application.Features.Visite.Interfaces;
using CleanVisitor.Application.Features.Notifications.Interfaces;
using CleanVisitor.Application.Features.Notifications.Interfaces.IRealTimeNotificationService;
using CleanVisitor.Application.Features.Visitors.Interfaces;
using CleanVisitor.Application.Features.Visite.Commande.UpdateVisit.UpdateVisitCommand;
using CleanVisitor.Core.Enum.VisitStatut;

namespace CleanVisitor.Application.Feautures.Visite.Commandes.Handler.VisitHandler;

public class UpdateVisitHandler : IRequestHandler<UpdateVisitCommand, VisitDto?>
{
    private readonly IVisitRepository _repository;
    private readonly IMapper _mapper;
    private readonly INotificationService _notifRepository;
    private readonly IRealTimeNotificationService _signalRService;
    private readonly IConfiguration _configuration;

    public UpdateVisitHandler(
        IVisitRepository repository,
        IMapper mapper,
        INotificationService notifRepository,
        IRealTimeNotificationService signalRService,
        IConfiguration configuration)
    {
        _repository = repository;
        _mapper = mapper;
        _notifRepository = notifRepository;
        _signalRService = signalRService;
        _configuration = configuration;
    }

    public async Task<VisitDto?> Handle(UpdateVisitCommand request, CancellationToken cancellationToken)
    {
        // 1. Récupérer la visite avant modification (lecture avec jointures [User])
        var oldVisitDto = await _repository.GetByIdAsync(request.Id);
        if (oldVisitDto == null) return null;

        // 🟢 2. BLOQUER SI LA VISITE EST TERMINÉE (3)
        if (oldVisitDto.Statut == VisitStatut.Terminee)
        {
            throw new InvalidOperationException("Cette visite est déjà terminée et ne peut plus être modifiée.");
        }

        // 🟢 3. VÉRIFICATION DE CHEVAUCHEMENT (Règle des 2 heures)
        int hostUserId = request.UserId ?? oldVisitDto.UserId ?? 0;
        var existingVisits = await _repository.GetVisitsByHostAndDateAsync(hostUserId, request.Date);

        TimeSpan newStartVal = request.HeureArriver;
        TimeSpan newEndVal = newStartVal.Add(TimeSpan.FromHours(2));

        foreach (var otherVisit in existingVisits)
        {
            if (otherVisit.Id == request.Id) continue;

            TimeSpan existingStartVal = otherVisit.HeureArriver;
            TimeSpan existingEndVal = existingStartVal.Add(TimeSpan.FromHours(2));

            if (newStartVal < existingEndVal && newEndVal > existingStartVal)
            {
                throw new InvalidOperationException($"Le créneau de {existingStartVal:hh\\:mm} à {existingEndVal:hh\\:mm} est déjà occupé. Une visite dure environ 2 heures, veuillez choisir une autre heure.");
            }
        }

        // 4. Déterminer le statut selon qui fait la modification
        bool isAdminOrAgent = request.UpdatedByRole == "Admin" || request.UpdatedByRole == "Agent";
        
        if (!isAdminOrAgent)
        {
            // Visiteur qui modifie → retour en attente
            request = request with { Statut = VisitStatut.En_attente };
        }

        // 5. Détection de reprogrammation (date ou heure changée)
        bool isReprogrammed = oldVisitDto.Date.Date != request.Date.Date ||
                              oldVisitDto.HeureArriver != request.HeureArriver;

        // 6. Mise à jour en base de données
        var visitEntity = _mapper.Map<Visit>(oldVisitDto);
        _mapper.Map(request, visitEntity);
        var result = await _repository.UpdateAsync(visitEntity);
        var resultDto = _mapper.Map<VisitDto>(result);

        // 🟢 7. DONNÉES DU VISITEUR (Injections directes via User)
        int visitorId = resultDto?.IdVisitor ?? oldVisitDto.IdVisitor;
        string visitorEmail = resultDto?.Email_visitor ?? oldVisitDto.Email_visitor ?? "";
        string visitorNom = resultDto?.Nom_visitor ?? oldVisitDto.Nom_visitor ?? "Visiteur";

        // Config email
        var smtpEmail    = _configuration["EmailCommand:Email"];
        var smtpPassword = _configuration["EmailCommand:Password"];
        var smtpHost     = _configuration["EmailCommand:Host"];
        var smtpPort     = int.Parse(_configuration["EmailCommand:Port"] ?? "587");
        var adminEmail   = _configuration["EmailCommand:AdminEmail"] ?? "batchadavila81@gmail.com";

        // 8. Envoi des Notifications & Emails
        if (isAdminOrAgent)
        {
            // ADMIN / AGENT modifie → notifier le VISITEUR
            if (isReprogrammed)
            {
                string messageVisiteur = $"Votre visite a été reprogrammée au {request.Date:dd/MM/yyyy} à {request.HeureArriver}.";

                await _notifRepository.AddAsync(new Notification
                {
                    IdVisitor = visitorId,
                    Message = messageVisiteur,
                    DateEnvoi = DateTime.Now,
                    Type = "REPROGRAMMATION",
                    IsRead = false,
                    ReceiverRole = "Visiteur"
                });

                if (!string.IsNullOrEmpty(visitorEmail))
                {
                    await _signalRService.SendStatusUpdateAsync(visitorEmail, messageVisiteur, "REPROGRAMMATION");

                    await SendEmailSafe(smtpEmail!, smtpPassword!, smtpHost!, smtpPort,
                        to: visitorEmail,
                        subject: "📅 Reprogrammation de votre visite",
                        body: $@"
                            <div style='font-family: sans-serif; padding: 20px; color: #1E293B;'>
                                <h3>Bonjour {visitorNom},</h3>
                                <p>{messageVisiteur}</p>
                                <p><b>Motif :</b> {request.Motif}</p>
                                <br/>
                                <p>Cordialement,<br/>L'administration</p>
                            </div>");
                }
            }
        }
        else
        {
            // VISITEUR modifie → notifier l'ADMIN + Confirmation au VISITEUR
            string messageAdmin = $"Le visiteur {visitorNom} a modifié sa visite du {request.Date:dd/MM/yyyy} à {request.HeureArriver}. La visite est revenue en attente de validation.";

            await _notifRepository.AddAsync(new Notification
            {
                IdVisitor = visitorId,
                Message = messageAdmin,
                DateEnvoi = DateTime.Now,
                Type = "VISIT_UPDATE",
                IsRead = false,
                ReceiverRole = "Admin"
            });

            await _signalRService.SendStatusUpdateAsync(adminEmail, messageAdmin, "VISIT_UPDATE");

            await SendEmailSafe(smtpEmail!, smtpPassword!, smtpHost!, smtpPort,
                to: adminEmail,
                subject: "⚠️ Un visiteur a modifié sa visite",
                body: $@"
                    <div style='font-family: sans-serif; padding: 20px;'>
                        <h3>Modification de visite</h3>
                        <p><b>Visiteur :</b> {visitorNom}</p>
                        <p><b>Nouvelle date :</b> {request.Date:dd/MM/yyyy}</p>
                        <p><b>Nouvelle heure :</b> {request.HeureArriver}</p>
                        <p><b>Motif :</b> {request.Motif}</p>
                        <p style='color:orange;'><b>⚠️ La visite est revenue en attente de validation.</b></p>
                    </div>");

            string messageVisiteur = $"Votre demande de modification a été enregistrée. Elle est en attente de validation par l'administration.";

            await _notifRepository.AddAsync(new Notification
            {
                IdVisitor = visitorId,
                Message = messageVisiteur,
                DateEnvoi = DateTime.Now,
                Type = "VISIT_UPDATE",
                IsRead = false,
                ReceiverRole = "Visiteur"
            });

            if (!string.IsNullOrEmpty(visitorEmail))
            {
                await _signalRService.SendStatusUpdateAsync(visitorEmail, messageVisiteur, "VISIT_UPDATE");

                await SendEmailSafe(smtpEmail!, smtpPassword!, smtpHost!, smtpPort,
                    to: visitorEmail,
                    subject: "Confirmation de votre demande de modification",
                    body: $@"
                        <div style='font-family: sans-serif; padding: 20px;'>
                            <h3>Bonjour {visitorNom},</h3>
                            <p>{messageVisiteur}</p>
                            <p><b>Nouvelle date :</b> {request.Date:dd/MM/yyyy}</p>
                            <p><b>Nouvelle heure :</b> {request.HeureArriver}</p>
                        </div>");
            }
        }

        return resultDto;
    }

    private async Task SendEmailSafe(string smtpEmail, string smtpPassword, string smtpHost, int smtpPort, string to, string subject, string body)
    {
        if (string.IsNullOrEmpty(smtpEmail) || string.IsNullOrEmpty(smtpPassword) || string.IsNullOrEmpty(to))
        {
            Console.WriteLine("[EMAIL] Config manquante, envoi ignoré.");
            return;
        }

        try
        {
            var email = new MimeMessage();
            email.From.Add(MailboxAddress.Parse(smtpEmail));
            email.To.Add(MailboxAddress.Parse(to));
            email.Subject = subject;
            email.Body = new TextPart(TextFormat.Html) { Text = body };

            using var smtp = new SmtpClient();
            await smtp.ConnectAsync(smtpHost, smtpPort, SecureSocketOptions.StartTls);
            await smtp.AuthenticateAsync(smtpEmail, smtpPassword);
            await smtp.SendAsync(email);
            await smtp.DisconnectAsync(true);
            Console.WriteLine($"✅ Email envoyé avec succès à {to}");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[EMAIL ERROR] {ex.Message}");
        }
    }
}