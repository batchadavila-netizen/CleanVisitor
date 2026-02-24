using CleanVisitor.Application.Features.Visitors.Dtos.StatMoisDto;
using CleanVisitor.Application.Features.Visitors.Interfaces;
using MediatR;
using AutoMapper;
using CleanVisitor.Application.Features.Visitors.Querries.GetVisitorMois;
namespace CleanVisitor.Application.Features.Visitors.Querries.GetVisitorMois.GetVisitorMoisHandler;
public class GetVisitorMoisHandler:IRequestHandler<GetVisitorMoisQuery, List<StatMoisDto>>
{
    private readonly IVisitorRepository _repository;
    private readonly IMapper _mapper;
    public GetVisitorMoisHandler(IVisitorRepository repository, IMapper mapper)
    {
        _repository=repository;
        _mapper=mapper;
    }
    public async Task<List<StatMoisDto>>Handle(GetVisitorMoisQuery request, CancellationToken cancellationToken)
    {
        var visitor=await _repository.GetVisitorMoisAsync();
        return _mapper.Map<List<StatMoisDto>>(visitor);
    }
}
