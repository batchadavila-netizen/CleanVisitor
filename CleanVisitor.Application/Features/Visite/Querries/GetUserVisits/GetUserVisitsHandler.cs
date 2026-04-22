using MediatR;
using CleanVisitor.Application.Features.Visite.Dtos;
using CleanVisitor.Application.Features.Visite.Interfaces;
using CleanVisitor.Application.Features.Visite.Querries.GetUserVisits;
namespace CleanVisitor.Application.Features.Visite.Querries.GetUserVisits.GetUserVisitsHandler;
public class GetUserVisitsHandler : IRequestHandler<GetUserVisitsQuery, List<VisitDto>>
{
    private readonly IVisitRepository _visitRepository;

    public GetUserVisitsHandler(IVisitRepository visitRepository)
    {
        _visitRepository = visitRepository;
    }

    public async Task<List<VisitDto>> Handle(GetUserVisitsQuery request, CancellationToken cancellationToken)
    {
        return await _visitRepository.GetUserVisitsAsync(request.UserId);
    }
}