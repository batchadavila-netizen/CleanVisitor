using MediatR;
using CleanVisitor.Application.Features.Visitors.Dtos;
using CleanVisitor.Application.Features.Visitors.Interfaces;
using AutoMapper;
using CleanVisitor.Core.Entities;
using  CleanVisitor.Application.Features.Visitors.Querries.GetDeleteVisitor;
namespace CleanVisitor.Application.Features.Visitors.Querries.GetDeleteVisitor.GetDeleteVisitorHandler;

public class GetDeletedVisitorHandler:IRequestHandler<GetDeletedVisitorQuery, List<VisitorDto>>
{
    private readonly IVisitorRepository _repository;
    private readonly IMapper _mapper;

    public GetDeletedVisitorHandler(IVisitorRepository repository, IMapper mapper)
    {
        _repository = repository;
        _mapper=mapper;
    }

    public async Task<List<VisitorDto>> Handle(GetDeletedVisitorQuery request, CancellationToken cancellationToken)
    {
        var visitors = await _repository.GetDeletedAsync();

        return _mapper.Map<List<VisitorDto>>(visitors);
    }
}