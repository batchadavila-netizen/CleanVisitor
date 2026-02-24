using MediatR;
using AutoMapper;
using CleanVisitor.Application.Features.Visitors.Interfaces;
using CleanVisitor.Application.Features.Visitors.Dtos.VisitorVisitDto;
using CleanVisitor.Application.Features.Visitors.Querries.GetVisitorVisit;
namespace CleanVisitor.Application.Features.Visitors.Querries.GetVisitorVisit.GetVisitorVisitHandler;
public class GetVisitorVisitHandler:IRequestHandler<GetVisitorVisitQuery, VisitorVisitDto>
{
    private IVisitorRepository _repository;
    private IMapper _mapper;
    public GetVisitorVisitHandler(IVisitorRepository repository, IMapper mapper)
    {
        _repository=repository;
        _mapper=mapper;
    }
    public async Task<VisitorVisitDto>Handle(GetVisitorVisitQuery request, CancellationToken cancellationToken)
    {
        var visitor=await _repository.GetVisitorVisitAsync(request.Id);
        return _mapper.Map<VisitorVisitDto>(visitor);
    }
}