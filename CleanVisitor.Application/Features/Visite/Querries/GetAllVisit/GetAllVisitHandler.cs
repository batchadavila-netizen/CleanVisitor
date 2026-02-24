using MediatR;
using AutoMapper;
using CleanVisitor.Application.Features.Visite.Interfaces;
using CleanVisitor.Core.Entities.Visits;
using CleanVisitor.Application.Features.Visite.Dtos;
using CleanVisitor.Application.Features.Visite.Querries.GetAllVisit;
namespace CleanVisitor.Application.Features.Visite.Querries.GetAllVisit.GetAllVisitHandler;
public class GetAllVisitHandler:IRequestHandler<GetAllVisitQuery, List<VisitDto>>
{
    private readonly IVisitRepository _repository;
    private readonly IMapper _mapper;
    public GetAllVisitHandler(IVisitRepository repository, IMapper mapper)
    {
        _repository=repository;
        _mapper=mapper;
    }
    public async Task<List<VisitDto>>Handle(GetAllVisitQuery request, CancellationToken cancellationToken)
    {
       var visit=await _repository.GetAllAsync();
       var dto=_mapper.Map<List<VisitDto>>(visit);
       return dto;
    }
    }
