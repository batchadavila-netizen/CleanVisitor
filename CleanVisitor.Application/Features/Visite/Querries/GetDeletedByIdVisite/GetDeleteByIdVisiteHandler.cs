using MediatR;
using CleanVisitor.Application.Features.Visite.Dtos;
using CleanVisitor.Application.Features.Visite.Interfaces;
using AutoMapper;
using CleanVisitor.Application.Features.Visite.Querries.GetDeleteByIdVisite.GetDeleteByIdVisiteQuery;
namespace CleanVisitor.Application.Features.Visite.Querries.GetDeleteByIdVisite.GetDeleteByIdVisiteHandler;

public class GetDeletedByIdVisiteHandler:IRequestHandler<GetDeletedByIdVisiteQuery, VisitDto>
{
    private readonly IVisitRepository _repository;
    private readonly IMapper _mapper;

    public GetDeletedByIdVisiteHandler(IVisitRepository repository, IMapper mapper)
    {
        _repository = repository;
        _mapper=mapper;
    }

    public async Task<VisitDto> Handle(GetDeletedByIdVisiteQuery request, CancellationToken cancellationToken)
    {
        var visite = await _repository.GetDeletedByIdAsync(request.Id);

        if (visite== null )
        return null;

        return _mapper.Map<VisitDto>(visite);
    }
}