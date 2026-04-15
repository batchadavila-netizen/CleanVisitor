using MediatR;
using CleanVisitor.Application.Features.Visite.Dtos;
using CleanVisitor.Application.Features.Visite.Interfaces;
using AutoMapper;
using CleanVisitor.Core.Entities;
using  CleanVisitor.Application.Features.Visite.Querries.GetDeleteVisite;
namespace CleanVisitor.Application.Features.Visite.Querries.GetDeleteVisite.GetDeleteVisiteHandler;

public class GetDeletedVisiteHandler:IRequestHandler<GetDeletedVisiteQuery, List<VisitDto>>
{
    private readonly IVisitRepository _repository;
    private readonly IMapper _mapper;

    public GetDeletedVisiteHandler(IVisitRepository repository, IMapper mapper)
    {
        _repository = repository;
        _mapper=mapper;
    }

    public async Task<List<VisitDto>> Handle(GetDeletedVisiteQuery request, CancellationToken cancellationToken)
    {
        var visite = await _repository.GetDeletedAsync();

        return _mapper.Map<List<VisitDto>>(visite);
    }
}