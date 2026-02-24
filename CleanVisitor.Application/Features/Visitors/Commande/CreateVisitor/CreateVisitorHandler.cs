using MediatR;
using AutoMapper;
using CleanVisitor.Core.Entities;
using CleanVisitor.Application.Features.Visitors.Dtos;
using CleanVisitor.Application.Features.Visitors.Interfaces;
using CleanVisitor.Application.Features.Visitors.Commande.CreateVisitor;
namespace CleanVisitor.Application.Features.Visitors.Commande.CreateVisitor.CreateVisitorHandler;
    public class CreateVisitorHandler : IRequestHandler<CreateVisitorCommand, VisitorDto?>
    {
        private readonly IVisitorRepository _repository;
        private readonly IMapper _mapper;

        public CreateVisitorHandler(IVisitorRepository repository, IMapper mapper )
        {
            _repository = repository;
            _mapper=mapper;
        }
        public async Task<VisitorDto?> Handle(CreateVisitorCommand request, CancellationToken cancellationToken)
    {
        var visitor= _mapper.Map<Visitor>(request);
         return await _repository.AddAsync(visitor);
    }
    }