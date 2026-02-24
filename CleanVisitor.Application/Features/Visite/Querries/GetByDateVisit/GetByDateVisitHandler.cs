using MediatR;
using AutoMapper;
using CleanVisitor.Application.Features.Visite.Interfaces;
using CleanVisitor.Core.Entities.Visits;
using CleanVisitor.Application.Features.Visite.Dtos;
using CleanVisitor.Application.Features.Visite.Querries.GetByDateVisit;
namespace CleanVisitor.Application.Features.Visite.Querries.GetByDateVisit.GetByDateVisitHandler;
public class GetByDateVisitHandler:IRequestHandler<GetByDateVisitQuery, VisitDto>
{
    private IVisitRepository _repository;
    private readonly IMapper _mapper;
    public GetByDateVisitHandler(IVisitRepository repository, IMapper mapper)
    {
        _repository=repository;
        _mapper=mapper;
    }
    public async Task<VisitDto>Handle(GetByDateVisitQuery request, CancellationToken cancellationToken)
    {
        var visit= await _repository.GetByDateAsync(request.Date);
        return _mapper.Map<VisitDto>(visit);
    }
}
