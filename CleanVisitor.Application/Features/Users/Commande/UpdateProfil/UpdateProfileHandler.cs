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
    // 1. Récupérer l'utilisateur (cela retourne un UserDto)
    var userDto = await _repository.GetByIdAsync(request.UserId);
    if (userDto == null) return null;

    // Convertir le DTO en Entité User pour pouvoir le modifier
    User existingUser = _mapper.Map<User>(userDto);

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