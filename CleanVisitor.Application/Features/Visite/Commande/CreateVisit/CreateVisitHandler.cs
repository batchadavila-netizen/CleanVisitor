using MediatR;
using System;
using AutoMapper;
using System.Threading;
using System.Threading.Tasks;
using CleanVisitor.Application.Features.Visite.Dtos;
using CleanVisitor.Core.Entities.Visits;
using CleanVisitor.Application.Features.Visite.Interfaces;
using CleanVisitor.Application.Features.Visite.Commande.CreateVisit;
namespace CleanVisitor.Application.Feautures.Visite.Commandes.Handler.VisitHandler;
    public class CreateVisitHandler : IRequestHandler<CreateVisitCommand, VisitDto>
    {
         private readonly IVisitRepository  _repository;
         private readonly IMapper _mapper;

        public CreateVisitHandler(IVisitRepository repository, IMapper mapper)
        {
            _repository = repository;
            _mapper = mapper;
        }

        public async Task<VisitDto> Handle(CreateVisitCommand request, CancellationToken cancellationToken)
        {
            var visit= _mapper.Map<Visit>(request);
             await _repository.AddAsync(visit);
             return _mapper.Map<VisitDto>(visit);
            
        }
    }