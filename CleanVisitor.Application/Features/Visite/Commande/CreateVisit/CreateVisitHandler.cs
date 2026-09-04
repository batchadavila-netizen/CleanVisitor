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
    // 🟢 1. Appel propre avec conversion int -> int?
    int? targetUserId = request.UserId > 0 ? request.UserId : null;
    var existingVisits = await _repository.GetVisitsByHostAndDateAsync(targetUserId, request.Date);

    if (existingVisits != null && existingVisits.Any())
    {
        TimeSpan newStartVal = request.HeureArriver; 
        TimeSpan newEndVal = newStartVal.Add(TimeSpan.FromHours(2));

        foreach (var existingVisit in existingVisits)
        {
            TimeSpan existingStartVal = existingVisit.HeureArriver;
            TimeSpan existingEndVal = existingStartVal.Add(TimeSpan.FromHours(2));

            if (newStartVal < existingEndVal && newEndVal > existingStartVal)
            {
                throw new InvalidOperationException($"Le créneau de {existingStartVal:hh\\:mm} à {existingEndVal:hh\\:mm} est déjà occupé pour cette date.");
            }
        }
    }


    var visit = _mapper.Map<Visit>(request);
    visit.AccessCode = "V-" + Guid.NewGuid().ToString().Substring(0, 5).ToUpper();
    // ❌ visit.CreatedAt = DateTime.Now; <- SUPPRIMÉ CAR INEXISTANT SUR VISIT

    var createdVisit = await _repository.AddAsync(visit);
    var resultDto = _mapper.Map<VisitDto>(createdVisit);

    // 🟢 3. NOTIFICATION SYSTEM (ADMIN & SIGNALR)
    string visitorName = resultDto.Nom_visitor ?? "Un visiteur";
    string messageAdmin = $"Nouvelle demande de visite de {visitorName} pour le {resultDto.Date:dd/MM/yyyy}.";

    await _notificationService.AddAsync(new Notification
    {
        IdVisitor = createdVisit.IdVisitor,
        Message = messageAdmin,
        DateEnvoi = DateTime.Now,
        Type = "NEW_VISIT",
        IsRead = false,
        ReceiverRole = "Admin"
    });

    var adminEmail = _configuration["EmailCommand:AdminEmail"] ?? "batchadavila81@gmail.com";
    await _signalRService.SendStatusUpdateAsync(adminEmail, messageAdmin, "NEW_VISIT");

    // 🟢 4. ENVOI DE L'EMAIL NOTIFICATION
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
                    <p><b>Visiteur :</b> {visitorName}</p>
                    <p><b>Motif :</b> {resultDto.Motif}</p>
                    <p><b>Date :</b> {resultDto.Date:dd/MM/yyyy}</p>
                    <p><b>Heure :</b> {resultDto.HeureArriver}</p>
                    <p><b>Service :</b> {resultDto.Service}</p>
                </div>"
        };

        try
        {
            using var smtp = new SmtpClient();
            await smtp.ConnectAsync(smtpHost, smtpPort, SecureSocketOptions.StartTls);
            await smtp.AuthenticateAsync(smtpEmail, smtpPassword);
            await smtp.SendAsync(email);
            await smtp.DisconnectAsync(true);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[EMAIL ERROR] {ex.Message}");
        }
    }

    return resultDto;
}
}