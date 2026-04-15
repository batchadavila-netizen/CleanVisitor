using MediatR;
using CleanVisitor.Application.Features.Visite.Dtos;
using CleanVisitor.Application.Features.Visite.Interfaces;
using CleanVisitor.Application.Features.Visite.Querries.GetVisitsWithDetails;
namespace CleanVisitor.Application.Features.Visite.Querries.GetVisitsWithDetails.GetVisitsWithDetailsHandler;
public class GetVisitsWithDetailsHandler : IRequestHandler<GetVisitsWithDetailsQuery, IEnumerable<VisitDetailsDto>>
{
    private readonly IVisitRepository _visitRepository;

    public GetVisitsWithDetailsHandler(IVisitRepository visitRepository)
    {
        _visitRepository = visitRepository;
    }

   public async Task<IEnumerable<VisitDetailsDto>> Handle(GetVisitsWithDetailsQuery request, CancellationToken cancellationToken)
{
    var result = await _visitRepository.GetAllVisitsWithDetailsAsync();

    return result.Select(v => new VisitDetailsDto
    {
        // Utilise la conversion explicite si nécessaire
        Id = (int)v.Id,
        Motif = v.Motif?.ToString(),
        Service = (int)v.Service,
        Statut = (int)v.Statut,
        HeureArriver = v.HeureArriver?.ToString(),
        IdVisitor = (int)v.IdVisitor,
        Nom = v.Nom?.ToString(),
        Email = v.Email?.ToString()
    });
}
}