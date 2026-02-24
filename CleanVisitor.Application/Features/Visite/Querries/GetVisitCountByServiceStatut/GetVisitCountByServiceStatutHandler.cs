using CleanVisitor.Application.Features.Visite.Dtos.ServiceDto;
using MediatR;
using AutoMapper;
using CleanVisitor.Application.Features.Visite.Interfaces;
using CleanVisitor.Application.Features.Visite.Querries.GetVisitCountByServiceStatut.GetVisitCountByServiceStatutQuery;
namespace CleanVisitor.Application.Features.Visitors.Querries.GetVisitCountByServiceStatut.GetVisitorCountByServiceHandler;
public class GetVisitCountByServiceHandler:IRequestHandler<GetVisitCountByServiceStatutQuery, List<ServiceDto>>
{
    private readonly IVisitRepository _repository;
    private readonly IMapper _mapper;
    public GetVisitCountByServiceHandler(IVisitRepository repository, IMapper mapper)
    {
        _repository=repository;
        _mapper=mapper;
    }
    public async Task<List<ServiceDto>>Handle(GetVisitCountByServiceStatutQuery request, CancellationToken cancellationToken)
    {
        var visitor=await _repository.GetVisitCountByServiceStatutAsync();
        return _mapper.Map<List<ServiceDto>>(visitor);
        

    }
}