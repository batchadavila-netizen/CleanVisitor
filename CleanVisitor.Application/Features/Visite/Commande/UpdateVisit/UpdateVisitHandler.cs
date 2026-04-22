using MediatR;
using System;
using AutoMapper;
using System.Threading;
using System.Threading.Tasks;
using CleanVisitor.Core.Entities.Visits;
using CleanVisitor.Application.Features.Visite.Dtos;
using CleanVisitor.Application.Features.Visite.Interfaces;
using CleanVisitor.Application.Features.Visite.Commande.UpdateVisit.UpdateVisitCommand;
namespace CleanVisitor.Application.Feautures.Visite.Commandes.Handler.VisitHandler;
    public class UpdateVisitHandler : IRequestHandler<UpdateVisitCommand, VisitDto?>
    {
         private readonly IVisitRepository  _repository;
         private readonly IMapper _mapper;

        public UpdateVisitHandler(IVisitRepository repository, IMapper mapper)
        {
            _repository = repository;
            _mapper = mapper;
        }

        public async Task<VisitDto?> Handle(UpdateVisitCommand request, CancellationToken cancellationToken)
{
    // Si GetByIdAsync renvoie un VisitDto, on doit le re-transformer en Visit
    var visitDto = await _repository.GetByIdAsync(request.Id);
    if (visitDto == null) return null;

    // Convertir le DTO en Entité pour le Repository
    var visitEntity = _mapper.Map<Visit>(visitDto);

    // Appliquer les changements de la requête
    _mapper.Map(request, visitEntity);

    // Envoyer l'entité
    var result = await _repository.UpdateAsync(visitEntity);

    return _mapper.Map<VisitDto>(result);
}
    }