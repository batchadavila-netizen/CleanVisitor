using MediatR;
using AutoMapper;
using Microsoft.Extensions.Configuration;
using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;
using MimeKit.Text;
using CleanVisitor.Application.Features.Visite.Dtos;
using CleanVisitor.Core.Entities.Visits;
using CleanVisitor.Core.Entities.Notification;
using CleanVisitor.Application.Features.Visite.Interfaces;
using CleanVisitor.Application.Features.Notifications.Interfaces;
using CleanVisitor.Application.Features.Notifications.Interfaces.IRealTimeNotificationService;
using CleanVisitor.Application.Features.Visite.Commande.CreateVisit;

namespace CleanVisitor.Application.Feautures.Visite.Commandes.Handler.VisitHandler;

public class CreateVisitHandler : IRequestHandler<CreateVisitCommand, VisitDto>
{
    private readonly IVisitRepository _repository;
    private readonly IMapper _mapper;
    private readonly INotificationService _notificationService;
    private readonly IRealTimeNotificationService _signalRService;
    private readonly IConfiguration _configuration;

    public CreateVisitHandler(
        IVisitRepository repository,
        IMapper mapper,
        INotificationService notificationService,
        IRealTimeNotificationService signalRService,
        IConfiguration configuration)
    {
        _repository = repository;
        _mapper = mapper;
        _notificationService = notificationService;
        _signalRService = signalRService;
        _configuration = configuration;
    }

    public async Task<VisitDto> Handle(CreateVisitCommand request, CancellationToken cancellationToken)
{
    // 🟢 1. VÉRIFICATION DE LA RÈGLE DES 2 HEURES (CHEVAUCHEMENT DE CRÉNEAUX)
    var existingVisits = await _repository.GetVisitsByHostAndDateAsync(request.UserId, request.Date);

    // Extraction directe du TimeSpan
    TimeSpan newStartVal = request.HeureArriver; 
    TimeSpan newEndVal = newStartVal.Add(TimeSpan.FromHours(2));

    foreach (var existingVisit in existingVisits)
    {
        TimeSpan existingStartVal = existingVisit.HeureArriver;
        TimeSpan existingEndVal = existingStartVal.Add(TimeSpan.FromHours(2));

        // Formule de chevauchement de créneaux (NewStart < ExistingEnd ET NewEnd > ExistingStart)
        if (newStartVal < existingEndVal && newEndVal > existingStartVal)
        {
            throw new InvalidOperationException($"Le créneau de {existingStartVal:hh\\:mm} à {existingEndVal:hh\\:mm} est déjà occupé. Une visite dure environ 2h, veuillez choisir un autre créneau.");
        }
    }

    // 🟢 2. SAUVEGARDE DE LA VISITE
    var visit = _mapper.Map<Visit>(request);
    visit.AccessCode = "V-" + Guid.NewGuid().ToString().Substring(0, 5).ToUpper();

    var createdVisit = await _repository.AddAsync(visit);
    var resultDto = _mapper.Map<VisitDto>(createdVisit);

    string messageAdmin = $"Nouvelle demande de visite de {resultDto.Nom_visitor} pour le {resultDto.Date:dd/MM/yyyy}.";


    // ... Reste de votre code (Notifications, SignalR, Email)

        await _notificationService.AddAsync(new Notification
        {
            IdVisitor = createdVisit.IdVisitor,
            Message = messageAdmin,
            DateEnvoi = DateTime.Now,
            Type = "NEW_VISIT",
            IsRead = false,
            ReceiverRole = "Admin"
        });

        // 4. Notification SignalR
        var adminEmail = _configuration["EmailCommand:AdminEmail"] ?? "batchadavila81@gmail.com";
        await _signalRService.SendStatusUpdateAsync(adminEmail, messageAdmin, "NEW_VISIT");

        // 5. Envoi Email
        var smtpEmail    = _configuration["EmailCommand:Email"];
        var smtpPassword = _configuration["EmailCommand:Password"];
        var smtpHost     = _configuration["EmailCommand:Host"];
        var smtpPort     = int.Parse(_configuration["EmailCommand:Port"] ?? "587");

        if (!string.IsNullOrEmpty(smtpEmail) && !string.IsNullOrEmpty(smtpPassword))
        {
            var email = new MimeMessage();
            email.From.Add(MailboxAddress.Parse(smtpEmail));
            email.To.Add(MailboxAddress.Parse(adminEmail));
            email.Subject = "🔔 Nouvelle demande de visite enregistrée";
            email.Body = new TextPart(TextFormat.Html)
            {
                Text = $@"
                    <div style='font-family: sans-serif; padding: 20px;'>
                        <h3>Nouvelle demande de visite</h3>
                        <p><b>Visiteur :</b> {resultDto.Nom_visitor}</p>
                        <p><b>Motif :</b> {resultDto.Motif}</p>
                        <p><b>Date :</b> {resultDto.Date:dd/MM/yyyy}</p>
                        <p><b>Heure :</b> {resultDto.HeureArriver}</p>
                        <p><b>Service :</b> {resultDto.Service}</p>
                        <br/>
                        <p>Connectez-vous à l'interface d'administration pour valider cette demande.</p>
                    </div>"
            };

            try
            {
                using var smtp = new SmtpClient();
                await smtp.ConnectAsync(smtpHost, smtpPort, SecureSocketOptions.StartTls);
                await smtp.AuthenticateAsync(smtpEmail, smtpPassword);
                await smtp.SendAsync(email);
                await smtp.DisconnectAsync(true);
                Console.WriteLine("✅ Email envoyé avec succès à l'admin.");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[EMAIL ERROR] {ex.Message}");
            }
        }

        return resultDto;
    }
}