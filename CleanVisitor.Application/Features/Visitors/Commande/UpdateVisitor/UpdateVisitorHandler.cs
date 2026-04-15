using MediatR;
using CleanVisitor.Core.Entities;
using AutoMapper;
using CleanVisitor.Application.Features.Visitors.Dtos;
using CleanVisitor.Application.Features.Visitors.Interfaces;
using CleanVisitor.Application.Features.Visitors.Commande.UpdateVisitor;
public class UpdateVisitorHandler:IRequestHandler<UpdateVisitorCommand, VisitorDto?>
{
    private readonly IVisitorRepository _repository;
    private readonly IMapper _mapper;
    public UpdateVisitorHandler(IVisitorRepository repository, IMapper mapper)
    {
        _repository=repository;
        _mapper=mapper;
    }
public async Task<VisitorDto?>Handle(UpdateVisitorCommand request, CancellationToken cancelationToken)
    {
       await _repository.GetByIdAsync(request.Id);
       var visitor=_mapper.Map<Visitor>(request);
       return await _repository.UpdateAsync(visitor);

    }

    
}