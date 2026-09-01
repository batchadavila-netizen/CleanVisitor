using MediatR;
using CleanVisitor.Core.Entities.User;
using CleanVisitor.Core.Enum.UserRole;
using CleanVisitor.Core.Enum.ServiceVisitor;
using CleanVisitor.Application.Features.Users.Dtos;
using CleanVisitor.Application.Features.Users.Interfaces;
using CleanVisitor.Application.Features.Users.Commande.UpdateProfile.UpdateProfileCommand;

namespace CleanVisitor.Application.Feautures.Users.Commande.CommandHandler.UpdateProfileHandler;

public class UpdateProfileHandler : IRequestHandler<UpdateProfileCommand, UserDto?>
{
    private readonly IUserRepository _repository;

    public UpdateProfileHandler(IUserRepository repository)
    {
        _repository = repository;
    }

    public async Task<UserDto?> Handle(UpdateProfileCommand request, CancellationToken cancellationToken)
    {
        // 1. Récupération de l'utilisateur existant
        var userDto = await _repository.GetByIdAsync(request.UserId);
        if (userDto == null) return null;

        // 2. Mapping des Enums
        Enum.TryParse<UserRole>(userDto.Role, true, out var targetRole);
        ServiceVisitor? targetService = null;
        if (!string.IsNullOrEmpty(userDto.Service) && Enum.TryParse<ServiceVisitor>(userDto.Service, true, out var parsedService))
        {
            targetService = parsedService;
        }

        // 3. Création de l'entité mise à jour avec le NOUVEAU numéro
        var userToUpdate = new User
        {
            Id = request.UserId,
            Nom = request.Nom,
            Prenom = request.Prenom,
            Email = request.Email,
            Telephone = request.Telephone, // 👈 S'assure que le téléphone du formulaire est injecté
            Role = targetRole,
            Service = targetService,
            IsActive = userDto.IsActive,
            PasswordHash = userDto.PasswordHash
        };

        // 4. Enregistrement en BDD
        return await _repository.UpdateAsync(userToUpdate);
    }
}