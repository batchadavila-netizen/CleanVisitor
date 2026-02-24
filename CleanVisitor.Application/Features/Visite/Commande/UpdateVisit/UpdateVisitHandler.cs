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
       var visit=_mapper.Map<Visit>(request);
       return await _repository.UpdateAsync(visit);
            
        }
    }