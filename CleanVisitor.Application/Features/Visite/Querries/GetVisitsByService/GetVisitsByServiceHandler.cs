using MediatR;
using CleanVisitor.Application.Features.Visite.Dtos;
using CleanVisitor.Application.Features.Visite.Interfaces; // Ajuste selon tes interfaces

namespace CleanVisitor.Application.Features.Visite.Querries.GetVisitsByService;

public class GetVisitsByServiceHandler : IRequestHandler<GetVisitsByServiceQuery, List<VisitDto>>
{
    private readonly IVisitRepository _visitRepository;

    public GetVisitsByServiceHandler(IVisitRepository visitRepository)
    {
        _visitRepository = visitRepository;
    }

    public async Task<List<VisitDto>> Handle(GetVisitsByServiceQuery request, CancellationToken cancellationToken)
    {
        return await _visitRepository.GetByServiceAsync(request.ServiceId);
    }
}