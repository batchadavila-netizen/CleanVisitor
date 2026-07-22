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
    private readonly IVisitorRepository _visitorRepository;
    private readonly IMapper _mapper;
    private readonly IEmailService _emailService;
    private readonly INotificationService _notifRepository;
    private readonly IRealTimeNotificationService _signalRService;
    private readonly IConfiguration _configuration;

    public UpdateVisitHandler(
        IVisitRepository repository,
        IVisitorRepository visitorRepository,
        IMapper mapper,
        IEmailService emailService,
        INotificationService notifRepository,
        IRealTimeNotificationService signalRService,
        IConfiguration configuration)
    {
        _repository = repository;
        _visitorRepository = visitorRepository;
        _mapper = mapper;
        _emailService = emailService;
        _notifRepository = notifRepository;
        _signalRService = signalRService;
        _configuration = configuration;
    }

    public async Task<VisitDto?> Handle(UpdateVisitCommand request, CancellationToken cancellationToken)
    {
        // 1. Récupérer la visite avant modification
        var oldVisitDto = await _repository.GetByIdAsync(request.Id);
        if (oldVisitDto == null) return null;

        // 2. Déterminer le statut selon qui fait la modification
        // Si c'est un visiteur → retour en attente (statut 1)
        // Si c'est un admin/agent → on garde le statut envoyé (accepté = 2)
        bool isAdminOrAgent = request.UpdatedByRole == "Admin" || request.UpdatedByRole == "Agent";
        
        if (!isAdminOrAgent)
        {
            // Visiteur qui modifie → retour en attente
            request = request with { Statut = VisitStatut.En_attente };
        }

        // 3. Détection de reprogrammation (date ou heure changée)
        bool isReprogrammed = oldVisitDto.Date.Date != request.Date.Date ||
                              oldVisitDto.HeureArriver != request.HeureArriver;

        // 4. Mise à jour en base
        var visitEntity = _mapper.Map<Visit>(oldVisitDto);
        _mapper.Map(request, visitEntity);
        var result = await _repository.UpdateAsync(visitEntity);

        // 5. Récupérer les infos du visiteur
        var visitor = await _visitorRepository.GetByIdAsync(visitEntity.IdVisitor);
        if (visitor == null) return _mapper.Map<VisitDto>(result);

        // Config email
        var smtpEmail    = _configuration["EmailCommand:Email"];
        var smtpPassword = _configuration["EmailCommand:Password"];
        var smtpHost     = _configuration["EmailCommand:Host"];
        var smtpPort     = int.Parse(_configuration["EmailCommand:Port"] ?? "587");
        var adminEmail   = _configuration["EmailCommand:AdminEmail"] ?? "batchadavila81@gmail.com";

        // 6. Notifications selon qui a modifié
        if (isAdminOrAgent)
        {
            // ADMIN modifie → notifier le VISITEUR
            if (isReprogrammed)
            {
                string messageVisiteur = $"Votre visite a été reprogrammée au {request.Date:dd/MM/yyyy} à {request.HeureArriver}.";

                // Notification en base pour le visiteur
                await _notifRepository.AddAsync(new Notification
                {
                    IdVisitor = visitor.Id,
                    Message = messageVisiteur,
                    DateEnvoi = DateTime.Now,
                    Type = "REPROGRAMMATION",
                    IsRead = false,
                    ReceiverRole = "Visiteur"
                });

                // SignalR au visiteur
                await _signalRService.SendStatusUpdateAsync(visitor.Email, messageVisiteur, "REPROGRAMMATION");

                // Email au visiteur
                await SendEmailSafe(smtpEmail!, smtpPassword!, smtpHost!, smtpPort,
                    to: visitor.Email,
                    subject: "Reprogrammation de votre visite",
                    body: $@"
                        <div style='font-family: sans-serif; padding: 20px;'>
                            <h3>Bonjour {visitor.Nom},</h3>
                            <p>{messageVisiteur}</p>
                            <p><b>Motif :</b> {request.Motif}</p>
                            <br/>
                            <p>Cordialement,<br/>L'administration</p>
                        </div>");
            }
        }
        else
        {
            // VISITEUR modifie → notifier l'ADMIN
            string messageAdmin = $"Le visiteur {visitor.Nom} a modifié sa visite du {request.Date:dd/MM/yyyy} à {request.HeureArriver}. La visite est revenue en attente de validation.";

            // Notification en base pour l'admin
            await _notifRepository.AddAsync(new Notification
            {
                IdVisitor = visitor.Id,
                Message = messageAdmin,
                DateEnvoi = DateTime.Now,
                Type = "VISIT_UPDATE",
                IsRead = false,
                ReceiverRole = "Admin"
            });

            // SignalR à l'admin
            await _signalRService.SendStatusUpdateAsync(adminEmail, messageAdmin, "VISIT_UPDATE");

            // Email à l'admin
            await SendEmailSafe(smtpEmail!, smtpPassword!, smtpHost!, smtpPort,
                to: adminEmail,
                subject: "⚠️ Un visiteur a modifié sa visite",
                body: $@"
                    <div style='font-family: sans-serif; padding: 20px;'>
                        <h3>Modification de visite</h3>
                        <p><b>Visiteur :</b> {visitor.Nom}</p>
                        <p><b>Nouvelle date :</b> {request.Date:dd/MM/yyyy}</p>
                        <p><b>Nouvelle heure :</b> {request.HeureArriver}</p>
                        <p><b>Motif :</b> {request.Motif}</p>
                        <p style='color:orange;'><b>⚠️ La visite est revenue en attente de validation.</b></p>
                        <br/>
                        <p>Connectez-vous à l'interface admin pour valider cette demande.</p>
                    </div>");

            // Notifier aussi le visiteur que sa modif est en attente
            string messageVisiteur = $"Votre demande de modification a été enregistrée. Elle est en attente de validation par l'administration.";

            await _notifRepository.AddAsync(new Notification
            {
                IdVisitor = visitor.Id,
                Message = messageVisiteur,
                DateEnvoi = DateTime.Now,
                Type = "VISIT_UPDATE",
                IsRead = false,
                ReceiverRole = "Visiteur"
            });

            await _signalRService.SendStatusUpdateAsync(visitor.Email, messageVisiteur, "VISIT_UPDATE");
        }

        return _mapper.Map<VisitDto>(result);
    }

    // Méthode utilitaire pour envoyer un email sans bloquer le process
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
            Console.WriteLine($"✅ Email envoyé à {to}");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[EMAIL ERROR] {ex.Message}");
        }
    }
}