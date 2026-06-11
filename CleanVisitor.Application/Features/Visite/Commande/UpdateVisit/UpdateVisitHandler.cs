using MediatR;
using AutoMapper;
using CleanVisitor.Core.Entities.Visits;
using CleanVisitor.Core.Entities.Notification; // Assure-toi d'avoir cette entité
using CleanVisitor.Application.Features.Visite.Dtos;
using CleanVisitor.Application.Features.Visite.Interfaces;
using CleanVisitor.Application.Features.Notifications.Interfaces;
using CleanVisitor.Application.Features.Notifications.Interfaces.IRealTimeNotificationService;
using CleanVisitor.Application.Features.Visitors.Interfaces;
using CleanVisitor.Application.Features.Visite.Commande.UpdateVisit.UpdateVisitCommand;

namespace CleanVisitor.Application.Feautures.Visite.Commandes.Handler.VisitHandler;

public class UpdateVisitHandler : IRequestHandler<UpdateVisitCommand, VisitDto?>
{
    private readonly IVisitRepository _repository;
    private readonly IVisitorRepository _visitorRepository;
    private readonly IMapper _mapper;
    private readonly IEmailService _emailService;
    private readonly INotificationService _notifRepository;
    private readonly IRealTimeNotificationService _signalRService; // Ajouté pour le temps réel

    public UpdateVisitHandler(
        IVisitRepository repository, 
        IVisitorRepository visitorRepository, 
        IMapper mapper, 
        IEmailService emailService,
        INotificationService notifRepository,
        IRealTimeNotificationService signalRService) // Injecté ici
    {
        _repository = repository;
        _visitorRepository = visitorRepository;
        _mapper = mapper;
        _emailService = emailService;
        _notifRepository = notifRepository;
        _signalRService = signalRService;
    }

    public async Task<VisitDto?> Handle(UpdateVisitCommand request, CancellationToken cancellationToken)
    {
        // 1. Récupérer l'état actuel avant modification
        var oldVisitDto = await _repository.GetByIdAsync(request.Id);
        if (oldVisitDto == null) return null;

        // Détection de la reprogrammation (Date ou Heure)
        bool isReprogrammed = oldVisitDto.Date.Date != request.Date.Date || 
                             oldVisitDto.HeureArriver != request.HeureArriver;

        // 2. Mise à jour de l'entité
        var visitEntity = _mapper.Map<Visit>(oldVisitDto);
        _mapper.Map(request, visitEntity);

        var result = await _repository.UpdateAsync(visitEntity);

        // 3. Gestion des notifications si reprogrammation
        if (isReprogrammed)
        {
            var visitor = await _visitorRepository.GetByIdAsync(visitEntity.IdVisitor);
            
            if (visitor != null)
            {
                string message = $"Votre visite a été reprogrammée au {request.Date:dd/MM/yyyy} à {request.HeureArriver}.";

                // A. Sauvegarde en Base de données (Historique)
                await _notifRepository.AddAsync(new Notification {
                    IdVisitor = visitor.Id,
                    Message = message,
                    DateEnvoi = DateTime.Now,
                    Type = "Reprogrammation",
                    IsRead = false
                });

                // B. Notification Temps Réel (SignalR - Pour le Toast React/Flutter)
                await _signalRService.SendStatusUpdateAsync(visitor.Email, message, "REPROGRAMMATION");

                // C. Envoi Email (Alerte externe)
                // C. Envoi Email (Alerte externe)
try 
{
    string emailBody = $@"
        <h3>Mise à jour de votre visite</h3>
        <p>Bonjour {visitor.Nom},</p>
        <p>{message}</p>
        <p>Cordialement,<br/>L'administration</p>";
    
    await _emailService.SendEmailAsync(visitor.Email, "Reprogrammation de votre visite", emailBody);
}
catch (Exception ex)
{
    // On log l'erreur dans la console mais on ne bloque pas le processus !
    Console.WriteLine($"[EMAIL ERROR] Echec de l'envoi d'email : {ex.Message}");
}
            }
        }

        return _mapper.Map<VisitDto>(result);
    }
}