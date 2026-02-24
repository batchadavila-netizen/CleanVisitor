using MediatR;
using CleanVisitor.Application.Features.Visitors.Dtos.StatJourDto;
using CleanVisitor.Application.Features.Visitors.Querries.GetVisitorJour;
using AutoMapper;
using CleanVisitor.Application.Features.Visitors.Interfaces;
namespace CleanVisitor.Features.Visitors.Querries.GetVisitorJour.GetVisitorJourHandler;
public class GetVisitorJourHandler:IRequestHandler<GetVisitorJourQuery, List<StatJourDto>>
{
    private readonly IVisitorRepository _repository;
    private readonly IMapper _mapper;
    public GetVisitorJourHandler(IVisitorRepository repository, IMapper mapper)
    {
        _repository=repository;
        _mapper=mapper;
    }
    public async Task<List<StatJourDto>>Handle(GetVisitorJourQuery request, CancellationToken cancellationToken)
    {
        var visitor=await _repository.GetVisitorJourAsync();
        return _mapper.Map<List<StatJourDto>>(visitor);
    }
}