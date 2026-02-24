using MediatR;
using AutoMapper;
using CleanVisitor.Core.Entities.User;
using CleanVisitor.Application.Features.Users.Dtos.UserRegistrationDto;
using CleanVisitor.Application.Features.Users.Interfaces.IJwtTokenGenerator;
using CleanVisitor.Application.Features.Users.Interfaces;
using CleanVisitor.Application.Features.Users.Commande.RegistreUser;
namespace CleanVisitor.Application.Features.Users.Commande.RegistreUser.RegisterUserHandler;
public class RegisterUserHandler:IRequestHandler<RegisterUserCommand, AuthenticationResponse>
{
    private readonly IUserRepository _repository;
    private readonly IMapper _mapper;
    private readonly IJwtTokenGenerator _jwtTokenGenerator;
    public RegisterUserHandler(IUserRepository repository, IMapper mapper, IJwtTokenGenerator jwtTokenGenerator){
        _repository=repository;
        _mapper=mapper;
        _jwtTokenGenerator= jwtTokenGenerator;

        }
        public async Task<AuthenticationResponse>Handle(RegisterUserCommand request, CancellationToken cancellationToken)
    {
        var user = _mapper.Map<User>(request);
         await _repository.AddAsync(user);

        // 2. Génération du jeton via ton interface
        var token = _jwtTokenGenerator.GenerateToken( user.Nom, user.Prenom, user.Email, user.Role, user.IsActive, user.CreatedAt);

        return new AuthenticationResponse(user, token);
    }
}