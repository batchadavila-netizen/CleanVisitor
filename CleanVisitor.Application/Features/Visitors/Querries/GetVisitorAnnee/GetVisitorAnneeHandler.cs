using CleanVisitor.Application.Features.Visitors.Interfaces;
using CleanVisitor.Application.Features.Visitors.Dtos.StatAnneeDto;
using AutoMapper;
using MediatR;
using CleanVisitor.Application.Features.Visitors.Querries.GetVisitorAnnee;
namespace CleanVisitor.Application.Features.Visitors.Querries.GetVisitorAnnee.GetVisitorAnneeHandler;
public class GetVisitorAnneeHandler:IRequestHandler<GetVisitorAnneeQuery, List<StatAnneeDto>>{
    private readonly IVisitorRepository _repository;
    private readonly IMapper _mapper;
    public GetVisitorAnneeHandler(IVisitorRepository repository, IMapper mapper)
    {
        _repository=repository;
        _mapper=mapper;
    }
    public async Task<List<StatAnneeDto>>Handle(GetVisitorAnneeQuery request, CancellationToken cancellationToken)
    {
        
        var visitor= await _repository.GetVisitorAnneeAsync();
        return _mapper.Map<List<StatAnneeDto>>(visitor);
    }
}