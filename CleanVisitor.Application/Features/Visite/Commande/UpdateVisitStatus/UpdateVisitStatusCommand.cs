using MediatR;

namespace CleanVisitor.Application.Features.Visite.Commande.UpdateVisitStatus;

// On définit que cette commande retourne un booléen (succès ou échec)
public record UpdateVisitStatusCommand(int Id, int NewStatus) : IRequest<bool>;