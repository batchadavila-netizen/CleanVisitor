using MediatR;
using CleanVisitor.Application.Features.Visitors.Dtos;
using CleanVisitor.Application.Features.Visitors.Interfaces;
using AutoMapper;
using CleanVisitor.Application.Features.Visitors.Querries.GetDeleteByIdVisitor.GetDeleteByIdVisitorQuery;
namespace CleanVisitor.Application.Features.Visitors.Querries.GetDeleteByIdVisitor.GetDeleteByIdVisitorHandler;

public class GetDeletedByIdVisitorHandler:IRequestHandler<GetDeletedByIdVisitorQuery, VisitorDto>
{
    private readonly IVisitorRepository _repository;
    private readonly IMapper _mapper;

    public GetDeletedByIdVisitorHandler(IVisitorRepository repository, IMapper mapper)
    {
        _repository = repository;
        _mapper=mapper;
    }

    public async Task<VisitorDto> Handle(GetDeletedByIdVisitorQuery request, CancellationToken cancellationToken)
    {
        var visitors = await _repository.GetDeletedByIdAsync(request.Id);

        if (visitors == null )
        return null;

        return _mapper.Map<VisitorDto>(visitors);
    }
}