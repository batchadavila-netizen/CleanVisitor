using MediatR;
using AutoMapper;
using CleanVisitor.Application.Features.Visite.Interfaces;
using CleanVisitor.Core.Entities.Visits;
using CleanVisitor.Application.Features.Visite.Commande.DeleteVisit;
namespace CleanVisitor.Application.Features.Visite.Commande.DeleteVisit.DeleteVisitHandler;
public class DeleteVisitHandler:IRequestHandler<DeleteVisitCommand, Visit>
{
    private readonly IVisitRepository _repository;
    private readonly IMapper _mapper;
    public DeleteVisitHandler(IVisitRepository repository, IMapper mapper)
    {
        _repository=repository;
        _mapper=mapper;
    }
    public async Task<Visit>Handle(DeleteVisitCommand request, CancellationToken cancellationToken)
    {
        var visit = await _repository.GetByIdAsync(request.Id);
        
        if (visit == null)
            throw new KeyNotFoundException("Visiteur non trouvé");
        await _repository.DeleteAsync(request.Id);

        return _mapper.Map<Visit>(visit);
    }
}