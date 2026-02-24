using MediatR;
using AutoMapper;
using CleanVisitor.Application.Features.Visitors.Interfaces;
using CleanVisitor.Core.Entities;
using CleanVisitor.Application.Features.Visitors.Dtos;
using  CleanVisitor.Application.Features.Visitors.Querries.GetVisitorById;
namespace CleanVisitor.Application.Features.Visitors.Querries.GetVisitorById.GetVisitorByIdHandler;
public class GetVisitorByIdHandler: IRequestHandler<GetVisitorByIdQuery, VisitorDto?>
{
    private readonly IVisitorRepository _repository;
    private readonly IMapper _mapper;
    public GetVisitorByIdHandler(IVisitorRepository repository, IMapper mapper)
    {
        _repository=repository;
        _mapper=mapper;
    }
    public async Task<VisitorDto?> Handle(GetVisitorByIdQuery request, CancellationToken cancellationToken)
{
    Console.WriteLine($"---> DEBUG: ID reçu de l'URL = {request.Id}");

    var visitor = await _repository.GetByIdAsync(request.Id);

    if (visitor == null) {
        Console.WriteLine("---> DEBUG: Le Repository a renvoyé NULL");
        return null;
    }

    return _mapper.Map<VisitorDto>(visitor);
}
}