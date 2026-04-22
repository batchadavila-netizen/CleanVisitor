using MediatR;
using CleanVisitor.Application.Features.Users.Interfaces;
using CleanVisitor.Application.Features.Users.Dtos;
using CleanVisitor.Application.Features.Users.Queries.GetUserProfile;

namespace CleanVisitor.Application.Features.Users.Queries.GetUserProfile.GetUserProfileHandler;

public class GetUserProfileHandler : IRequestHandler<GetUserProfileQuery, UserProfileDto>
{
    private readonly IUserRepository _userRepository;

    public GetUserProfileHandler(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<UserProfileDto> Handle(GetUserProfileQuery request, CancellationToken cancellationToken)
{
    // On récupère le profil
    var profile = await _userRepository.GetUserProfileAsync(request.UserId);
    
    // Au lieu de throw une exception qui casse tout, on gère le cas null proprement
    if (profile == null)
    {
        // On retourne un DTO vide ou un message d'erreur soft
        return new UserProfileDto { Nom = "Inconnu", Prenom = "Utilisateur" };
    }

    // Si profile est déjà un UserProfileDto, on le renvoie
    return profile;
}
}