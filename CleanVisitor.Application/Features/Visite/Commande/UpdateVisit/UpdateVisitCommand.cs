using MediatR;
using CleanVisitor.Application.Features.Visite.Dtos;
using CleanVisitor.Core.Enum.VisitStatut;
using CleanVisitor.Core.Enum.ServiceVisitor;

namespace CleanVisitor.Application.Features.Visite.Commande.UpdateVisit.UpdateVisitCommand;

public record UpdateVisitCommand : IRequest<VisitDto?>
{
    public int Id { get; set; }
    public string Motif { get; set; } = string.Empty;
    public DateTime Date { get; set; }
    public TimeSpan HeureArriver { get; set; }
    public TimeSpan HeureDepart { get; set; }
    public VisitStatut Statut { get; set; }
    public ServiceVisitor Service { get; set; }

    // NOUVEAU : pour savoir qui fait la modification
    public string UpdatedByRole { get; set; } = "Visiteur"; // "Admin", "Agent" ou "Visiteur"
}