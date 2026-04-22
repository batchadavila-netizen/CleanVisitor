using MediatR;
using AutoMapper;
using Microsoft.AspNetCore.SignalR;
using CleanVisitor.Application.Features.Visite.Dtos;
using CleanVisitor.Core.Entities.Visits;
using CleanVisitor.Application.Features.Visite.Interfaces;
using CleanVisitor.Application.Features.Visite.Commande.CreateVisit;

namespace CleanVisitor.Application.Feautures.Visite.Commandes.Handler.VisitHandler;

// Projet : CleanVisitor.Application
public class CreateVisitHandler : IRequestHandler<CreateVisitCommand, VisitDto>
{
    private readonly IVisitRepository _repository;
    private readonly IMapper _mapper;
    private readonly IVisitNotificationService _notificationService; // On utilise l'interface
    private readonly IEmailService _emailService;

    public CreateVisitHandler(IVisitRepository repository, IMapper mapper, IVisitNotificationService notificationService, IEmailService emailService)
    {
        _repository = repository;
        _mapper = mapper;
        _notificationService = notificationService;
        _emailService=emailService;
    }

    public async Task<VisitDto> Handle(CreateVisitCommand request, CancellationToken cancellationToken)
{
    // 1. Mapping et sauvegarde
    var visit = _mapper.Map<Visit>(request);
    await _repository.AddAsync(visit);
    
    var resultDto = _mapper.Map<VisitDto>(visit);

    // 2. Notification SignalR (Mise à jour avec 3 arguments)
    // On passe l'email de l'admin pour que le système sache que c'est une alerte "Back-office"
    string adminEmail = "batchadavila@gmail.com"; 

    await _notificationService.SendNotificationAsync(
        adminEmail,
        $"Nouvelle visite : {resultDto.Nom_visitor}", 
        "NEW_VISIT"
    );

    // 3. Notification par Email à l'Admin
    string subject = "🔔 Nouvelle demande de visite enregistrée";
    string body = $@"
        <h3>Nouvelle demande de visite</h3>
        <p><b>Visiteur :</b> {resultDto.Nom_visitor}</p>
        <p><b>Motif :</b> {resultDto.Motif}</p>
        <p><b>Date :</b> {resultDto.Date.ToShortDateString()}</p>
        <p><b>Service :</b> {resultDto.Service}</p>
        <br/>
        <p>Connectez-vous à l'interface admin pour valider cette demande.</p>";

    try 
    {
        await _emailService.SendEmailAsync(adminEmail, subject, body);
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Erreur d'envoi d'email admin: {ex.Message}");
    }

    return resultDto;
}
}