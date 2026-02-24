using MediatR;
using AutoMapper;
using CleanVisitor.Application.Features.Visitors.Interfaces;
using CleanVisitor.Core.Entities;
using CleanVisitor.Application.Features.Visitors.Dtos;
using CleanVisitor.Application.Features.Visitors.Querries.GetAllVisitor;
namespace CleanVisitor.Application.Features.Visitors.Querries.GetAllVisitor.GetAllVisitorHandler;
public class GetAllVisitorHandler:IRequestHandler<GetAllVisitorQuery, List<VisitorDto>>
{
    private readonly IVisitorRepository _repository;
    private readonly IMapper _mapper;
    public GetAllVisitorHandler(IVisitorRepository repository, IMapper mapper)
    {
        _repository=repository;
        _mapper=mapper;
    }
    public async Task<List<VisitorDto>> Handle(GetAllVisitorQuery query, CancellationToken cancellationToken)
    {
        var visitor= await _repository.GetAllAsync();
        var dto=  _mapper.Map<List<VisitorDto>>(visitor);
        return dto;
    
    }
}