using MediatR;
using AutoMapper;
using Microsoft.Extensions.Configuration;
using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;
using MimeKit.Text;
using CleanVisitor.Application.Features.Visite.Dtos;
using CleanVisitor.Core.Entities.Visits;
using CleanVisitor.Application.Features.Visite.Interfaces;
using CleanVisitor.Application.Features.Notifications.Interfaces;
using CleanVisitor.Application.Features.Notifications.Interfaces.IRealTimeNotificationService;
using CleanVisitor.Application.Features.Visite.Commande.CreateVisit;

namespace CleanVisitor.Application.Feautures.Visite.Commandes.Handler.VisitHandler;

public class CreateVisitHandler : IRequestHandler<CreateVisitCommand, VisitDto>
{
    private readonly IVisitRepository _repository;
    private readonly IMapper _mapper;
    private readonly IRealTimeNotificationService _signalRService;
    private readonly IConfiguration _configuration;

    public CreateVisitHandler(
        IVisitRepository repository,
        IMapper mapper,
        IRealTimeNotificationService signalRService,
        IConfiguration configuration)
    {
        _repository = repository;
        _mapper = mapper;
        _signalRService = signalRService;
        _configuration = configuration;
    }

    public async Task<VisitDto> Handle(CreateVisitCommand request, CancellationToken cancellationToken)
    {
        // 1. Sauvegarde de la visite
        var visit = _mapper.Map<Visit>(request);
        var createdVisit = await _repository.AddAsync(visit);
        var resultDto = _mapper.Map<VisitDto>(createdVisit);

        // 🔥 FIX : bons noms de clés correspondant à appsettings.json
        var smtpEmail    = _configuration["EmailCommand:Email"];
        var smtpPassword = _configuration["EmailCommand:Password"];
        var smtpHost     = _configuration["EmailCommand:Host"];
        var smtpPort     = int.Parse(_configuration["EmailCommand:Port"] ?? "587");
        var adminEmail   = _configuration["EmailCommand:AdminEmail"] ?? "batchadavila81@gmail.com";

        // 🔥 Sécurité : ne pas envoyer si config manquante
        if (string.IsNullOrEmpty(smtpEmail) || string.IsNullOrEmpty(smtpPassword) || string.IsNullOrEmpty(adminEmail))
        {
            Console.WriteLine("[EMAIL] Configuration email manquante, envoi ignoré.");
            return resultDto;
        }

        // 2. Notification SignalR
        await _signalRService.SendStatusUpdateAsync(adminEmail, $"Nouvelle visite : {resultDto.Nom_visitor}", "NEW_VISIT");

        // 3. Envoi Email
        var email = new MimeMessage();
        email.From.Add(MailboxAddress.Parse(smtpEmail));
        email.To.Add(MailboxAddress.Parse(adminEmail));
        email.Subject = "🔔 Nouvelle demande de visite enregistrée";
        email.Body = new TextPart(TextFormat.Html)
        {
            Text = $@"
                <h3>Nouvelle demande de visite</h3>
                <p><b>Visiteur :</b> {resultDto.Nom_visitor}</p>
                <p><b>Motif :</b> {resultDto.Motif}</p>
                <p><b>Date :</b> {resultDto.Date:dd/MM/yyyy}</p>
                <p><b>Service :</b> {resultDto.Service}</p>
                <br/>
                <p>Connectez-vous à l'interface admin pour valider cette demande.</p>"
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

        return resultDto;
    }
}