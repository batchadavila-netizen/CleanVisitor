using MediatR;
using AutoMapper;
using CleanVisitor.Application.Features.Visite.Interfaces;
using CleanVisitor.Core.Entities.Visits;
using CleanVisitor.Application.Features.Visite.Dtos;
using CleanVisitor.Application.Features.Visite.Querries.GetVisitById;
namespace CleanVisitor.Application.Features.Visite.Querries.GetVisitById.GetVisitByIdHandler;
public class GetVisitByIdHandler : IRequestHandler<GetVisitByIdQuery, VisitDto?>{
private readonly IVisitRepository  _repository;
private readonly IMapper _mapper;
public GetVisitByIdHandler(IVisitRepository repository, IMapper mapper)
{
    _repository=repository;
    _mapper=mapper;
}
public async Task<VisitDto?>Handle(GetVisitByIdQuery request, CancellationToken cancellationToken)
{
    Console.WriteLine($"---> DEBUG: ID reçu de l'URL = {request.Id}");

    var visit = await _repository.GetByIdAsync(request.Id);

    if (visit == null) {
        Console.WriteLine("---> DEBUG: Le Repository a renvoyé NULL");
        return null;
    }

    return _mapper.Map<VisitDto>(visit);
}
}