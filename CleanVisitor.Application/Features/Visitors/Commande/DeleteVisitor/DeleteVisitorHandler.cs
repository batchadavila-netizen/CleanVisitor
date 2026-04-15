using MediatR;
using AutoMapper;
using CleanVisitor.Core.Entities;
using CleanVisitor.Application.Features.Visitors.Dtos;
using CleanVisitor.Application.Features.Visitors.Interfaces;
using CleanVisitor.Application.Features.Visitors.Commande.DeleteVisitor;
    public class DeleteVisitorHandler : IRequestHandler<DeleteVisitorCommand, bool>
{
    private readonly IVisitorRepository _repository;
    private readonly IMapper _mapper;

    public DeleteVisitorHandler(IVisitorRepository repository, IMapper mapper)
    {
        _repository = repository;
        _mapper = mapper;
    }

    public async Task<bool> Handle(DeleteVisitorCommand request, CancellationToken cancellationToken)
    {
        var visitor = await _repository.GetByIdAsync(request.Id);
        
        if (visitor == null)
            throw new KeyNotFoundException("Visiteur non trouvé");
        await _repository.DeleteAsync(request.Id);

       return true;
    }
}
