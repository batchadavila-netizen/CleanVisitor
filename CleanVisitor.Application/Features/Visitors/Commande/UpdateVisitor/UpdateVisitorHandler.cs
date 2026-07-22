using MediatR;
using CleanVisitor.Core.Entities;
using AutoMapper;
using CleanVisitor.Application.Features.Visitors.Dtos;
using CleanVisitor.Application.Features.Visitors.Interfaces;
using CleanVisitor.Application.Features.Visitors.Commande.UpdateVisitor;

public class UpdateVisitorHandler : IRequestHandler<UpdateVisitorCommand, VisitorDto?>
{
    private readonly IVisitorRepository _repository;
    private readonly IMapper _mapper;

    public UpdateVisitorHandler(IVisitorRepository repository, IMapper mapper)
    {
        _repository = repository;
        _mapper = mapper;
    }

    public async Task<VisitorDto?> Handle(UpdateVisitorCommand request, CancellationToken cancellationToken)
    {
        // 1. Récupérer le visiteur existant
        var existingVisitor = await _repository.GetByIdAsync(request.Id);
        if (existingVisitor == null) return null;

        // 2. Mettre à jour uniquement les champs renseignés
        if (!string.IsNullOrEmpty(request.Nom))
            existingVisitor.Nom = request.Nom;

        if (!string.IsNullOrEmpty(request.Prenom))
            existingVisitor.Prenom = request.Prenom;

        if (!string.IsNullOrEmpty(request.Telephone))
            existingVisitor.Telephone = request.Telephone;

        if (!string.IsNullOrEmpty(request.Email))
            existingVisitor.Email = request.Email;

        if (!string.IsNullOrEmpty(request.Password))
            existingVisitor.Password = request.Password;

        // 3. Sauvegarder et retourner
        return await _repository.UpdateAsync(existingVisitor);
    }
}