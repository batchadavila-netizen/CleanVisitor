using MediatR;
using AutoMapper;
using CleanVisitor.Application.Features.Users.Interfaces.IJwtTokenGenerator;
using CleanVisitor.Application.Features.Users.Dtos;
using CleanVisitor.Application.Features.Users.Interfaces;
using CleanVisitor.Application.Features.Users.Querries.LoginUser;
using CleanVisitor.Core.Entities.User;

namespace CleanVisitor.Application.Features.Users.Querries.LoginUser.LoginUserHandler; 

public class LoginUserHandler : IRequestHandler<LoginUserQuery, AuthenticationResponse>
{
    private readonly IUserRepository _repository;
    private readonly IJwtTokenGenerator _jwtTokenGenerator;
    private readonly IMapper _mapper;

    public LoginUserHandler(IUserRepository repository, IMapper mapper, IJwtTokenGenerator jwtTokenGenerator)
    {
        _repository = repository;
        _mapper = mapper;
        _jwtTokenGenerator = jwtTokenGenerator;
    }

    public async Task<AuthenticationResponse> Handle(LoginUserQuery request, CancellationToken cancellationToken)
    {
        // 1. Récupération de l'utilisateur (renvoie un UserDto)
        var userDto = await _repository.GetByEmailAsync(request.Email);

        if (userDto == null)
            throw new Exception("Identifiants incorrects (Email non trouvé)");

        if (string.IsNullOrEmpty(userDto.PasswordHash))
            throw new Exception("Identifiants incorrects (Hash vide en base)");

        bool isPasswordValid = false;

        // 2. Vérification du mot de passe
        if (userDto.PasswordHash.StartsWith("$2a$") || userDto.PasswordHash.StartsWith("$2b$") || userDto.PasswordHash.StartsWith("$2y$"))
        {
            isPasswordValid = BCrypt.Net.BCrypt.Verify(request.Password, userDto.PasswordHash);
        }
        else
        {
            isPasswordValid = (userDto.PasswordHash == request.Password);

            if (isPasswordValid)
            {
                // Mise à jour du hash sur le DTO
                userDto.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);
                
                // 🟢 Conversion en 'User' car UpdateAsync attend un 'User'
                var userEntity = _mapper.Map<User>(userDto);
                await _repository.UpdateAsync(userEntity);
            }
        }

        if (!isPasswordValid)
            throw new Exception("Identifiants incorrects (Mot de passe invalide)");

        string roleName = userDto.Role.ToString();
        string serviceCode = userDto.Service?.ToString() ?? "5"; 

        // 🟢 Passage de 'userDto' car IJwtTokenGenerator prend un 'UserDto'
        var token = _jwtTokenGenerator.GenerateToken(userDto);

        return new AuthenticationResponse(userDto, token, roleName, serviceCode);
    }
}