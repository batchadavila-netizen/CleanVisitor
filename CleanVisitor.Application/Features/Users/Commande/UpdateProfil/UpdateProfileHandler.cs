using MediatR;
using AutoMapper;
using CleanVisitor.Core.Entities.User;
using CleanVisitor.Application.Features.Users.Dtos;
using CleanVisitor.Application.Features.Users.Interfaces;
using CleanVisitor.Application.Features.Users.Commande.UpdateProfile.UpdateProfileCommand;

namespace CleanVisitor.Application.Feautures.Users.Commande.CommandHandler.UpdateProfileHandler;

public class UpdateProfileHandler : IRequestHandler<UpdateProfileCommand, UserDto?>
{
    private readonly IUserRepository _repository;
    private readonly IMapper _mapper;

    public UpdateProfileHandler(IUserRepository repository, IMapper mapper)
    {
        _repository = repository;
        _mapper = mapper;
    }

    public async Task<UserDto?> Handle(UpdateProfileCommand request, CancellationToken cancellationToken)
    {
        // 1. Récupérer l'entité de l'utilisateur connecté
        User? existingUser = await _repository.GetByIdAsync(request.UserId);
        if (existingUser == null) return null;

        // 2. Mettre à jour uniquement ses informations personnelles
        existingUser.Nom = request.Nom;
        existingUser.Prenom = request.Prenom;
        existingUser.Email = request.Email;
        existingUser.Telephone = request.Telephone;

        // 3. Sauvegarder dans la base de données
        await _repository.UpdateAsync(existingUser);

        // 4. Retourner le DTO mis à jour
        return _mapper.Map<UserDto>(existingUser);
    }
}