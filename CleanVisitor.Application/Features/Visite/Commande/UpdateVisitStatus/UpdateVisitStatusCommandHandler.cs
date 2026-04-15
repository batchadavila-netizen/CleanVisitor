using MediatR;
using CleanVisitor.Application.Features.Visite.Interfaces;

namespace CleanVisitor.Application.Features.Visite.Commande.UpdateVisitStatus;

public class UpdateVisitStatusCommandHandler : IRequestHandler<UpdateVisitStatusCommand, bool>
{
    private readonly IVisitRepository _visitRepository;

    public UpdateVisitStatusCommandHandler(IVisitRepository visitRepository)
    {
        _visitRepository = visitRepository;
    }

    public async Task<bool> Handle(UpdateVisitStatusCommand request, CancellationToken cancellationToken)
    {
        // On appelle la méthode du repository que nous avons définie plus tôt
        return await _visitRepository.UpdateStatusAsync(request.Id, request.NewStatus);
    }
}