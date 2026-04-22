using MediatR;
using CleanVisitor.Application.Features.Visite.Interfaces;

namespace CleanVisitor.Application.Features.Visite.Commande.UpdateVisitStatus;

public class UpdateVisitStatusCommandHandler : IRequestHandler<UpdateVisitStatusCommand, bool>
{
    private readonly IVisitRepository _visitRepository;
    private readonly IVisitNotificationService _notificationService;
    private readonly IEmailService _emailService;

    public UpdateVisitStatusCommandHandler(
        IVisitRepository visitRepository, 
        IVisitNotificationService notificationService, 
        IEmailService emailService)
    {
        _visitRepository = visitRepository;
        _notificationService = notificationService;
        _emailService = emailService;
    }

    public async Task<bool> Handle(UpdateVisitStatusCommand request, CancellationToken cancellationToken)
    {
        // 1. Récupérer les détails de la visite AVANT la mise à jour
        var visit = await _visitRepository.GetByIdAsync(request.Id);
        
        if (visit == null) 
        {
            return false;
        }

        // 2. Mise à jour du statut en base de données
        var success = await _visitRepository.UpdateStatusAsync(request.Id, request.NewStatus);
        
        if (success)
        {
            // Déterminer le label selon le nouveau statut
            string statusLabel = request.NewStatus switch
            {
                2 => "Acceptée",
                3 => "Refusée",
                4 => "Reprogrammée",
                _ => "Mise à jour"
            };

            string notificationMessage = $"Votre visite a été {statusLabel.ToLower()}.";

            // 3. Notification SignalR (Temps réel)
            // On vérifie que l'email n'est pas nul pour éviter l'avertissement CS8604
            if (!string.IsNullOrEmpty(visit.Email_visitor))
            {
                await _notificationService.SendNotificationAsync(
                    visit.Email_visitor, 
                    notificationMessage, 
                    "STATUS_UPDATE"
                );

                // 4. Envoi de l'Email
                string emailSubject = $"Mise à jour de votre visite - {statusLabel}";
                string emailBody = $@"
                    <div style='font-family: sans-serif; padding: 20px;'>
                        <h3>Bonjour {visit.Nom_visitor},</h3>
                        <p>Le statut de votre demande de visite a été mis à jour : <b>{statusLabel}</b>.</p>
                        <p><b>Motif :</b> {visit.Motif}</p>
                        <br/>
                        <p>Merci d'utiliser notre service de gestion des visiteurs.</p>
                    </div>";

                try 
                {
                    await _emailService.SendEmailAsync(visit.Email_visitor, emailSubject, emailBody);
                }
                catch (Exception ex)
                {
                    // On log l'erreur sans faire planter la validation de la visite
                    Console.WriteLine($"[EMAIL ERROR] Impossible d'envoyer le mail à {visit.Email_visitor}: {ex.Message}");
                }
            }
        }

        return success;
    }
}