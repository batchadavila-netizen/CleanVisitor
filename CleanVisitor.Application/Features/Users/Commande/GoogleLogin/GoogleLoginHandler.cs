using MediatR;
using CleanVisitor.Core.Entities.User;
using CleanVisitor.Core.Enum.UserRole;
using CleanVisitor.Application.Features.Users.Dtos;
using CleanVisitor.Application.Features.Users.Interfaces;
using CleanVisitor.Application.Features.Users.Interfaces.IJwtTokenGenerator;
using CleanVisitor.Application.Features.Users.Querries.LoginUser;

namespace CleanVisitor.Application.Features.Users.Commande.GoogleLogin;

public class GoogleLoginHandler : IRequestHandler<GoogleLoginCommand, AuthenticationResponse>
{
    private readonly IUserRepository _repository;
    private readonly IJwtTokenGenerator _jwtTokenGenerator;

    public GoogleLoginHandler(IUserRepository repository, IJwtTokenGenerator jwtTokenGenerator)
    {
        _repository = repository;
        _jwtTokenGenerator = jwtTokenGenerator;
    }

    public async Task<AuthenticationResponse> Handle(GoogleLoginCommand request, CancellationToken cancellationToken)
    {
        // 1. Recherche de l'utilisateur par Email
        var userDto = await _repository.GetByEmailAsync(request.Email);

        // 2. S'il n'existe pas en BDD, on l'insère (Inscription automatique Google)
        if (userDto == null)
        {
            var newUser = new User
            {
                Nom = string.IsNullOrEmpty(request.Nom) ? "Google" : request.Nom,
                Prenom = string.IsNullOrEmpty(request.Prenom) ? "User" : request.Prenom,
                Email = request.Email,
                Telephone = request.Telephone ?? "",
                Role = UserRole.Visiteur, // Visiteur par défaut
                IsActive = true,
                CreatedAt = DateTime.Now,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(Guid.NewGuid().ToString()) // Hash aléatoire
            };

            // 🟢 L'infrastructure retourne le UserDto avec l'ID SQL Server généré (Scope Identity)
            userDto = await _repository.AddAsync(newUser);
        }

        // 3. Génération du Token JWT avec le vrai userDto
        var token = _jwtTokenGenerator.GenerateToken(userDto);
        string roleName = userDto.Role?.ToString() ?? "3";
        string serviceCode = userDto.Service?.ToString() ?? "5";

        // 🟢 Retourne la réponse avec l'ID complet stocké dans userDto
        return new AuthenticationResponse(userDto, token, roleName, serviceCode);
    }
}