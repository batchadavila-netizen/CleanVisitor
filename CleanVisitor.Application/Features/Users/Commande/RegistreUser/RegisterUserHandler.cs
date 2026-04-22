using MediatR;
using AutoMapper;
using CleanVisitor.Core.Entities.User;
using CleanVisitor.Core.Entities; // Assure-toi d'avoir l'accès à l'entité Visitor
using CleanVisitor.Application.Features.Users.Dtos;
using CleanVisitor.Application.Features.Users.Interfaces.IJwtTokenGenerator;
using CleanVisitor.Application.Features.Users.Interfaces;
using CleanVisitor.Application.Features.Users.Commande.RegistreUser;
using CleanVisitor.Application.Features.Visitors.Interfaces; // Là où se trouve ton IVisitorRepository

namespace CleanVisitor.Application.Features.Users.Commande.RegistreUser.RegisterUserHandler;

public class RegisterUserHandler : IRequestHandler<RegisterUserCommand, AuthenticationResponse>
{
    private readonly IUserRepository _repository;
    private readonly IVisitorRepository _visitorRepository; // AJOUT : Pour le métier
    private readonly IMapper _mapper;
    private readonly IJwtTokenGenerator _jwtTokenGenerator;

    // Ajout du visitorRepository dans le constructeur
    public RegisterUserHandler(
        IUserRepository repository, 
        IVisitorRepository visitorRepository, 
        IMapper mapper, 
        IJwtTokenGenerator jwtTokenGenerator)
    {
        _repository = repository;
        _visitorRepository = visitorRepository; // Initialisation
        _mapper = mapper;
        _jwtTokenGenerator = jwtTokenGenerator;
    }

    public async Task<AuthenticationResponse> Handle(RegisterUserCommand request, CancellationToken cancellationToken)
    {
        // 1. Mappage et création de l'utilisateur (Sécurité)
        // 1. Mappage et création de l'utilisateur (C'est OK)
var user = _mapper.Map<User>(request);
await _repository.AddAsync(user);

// 2. Création de la fiche Visiteur (Métier)
if ((int)user.Role == 3) 
{
    var visitor = new Visitor
    {
        Nom = user.Nom,
        Prenom = user.Prenom,
        Email = user.Email,
        
        // ATTENTION : On utilise 'request' ici, PAS 'user'
        // Car 'request' contient le champ Telephone que l'utilisateur a saisi
        Telephone = request.Telephone 
    };
    
    await _visitorRepository.AddAsync(visitor);
}
        // ------------------------------

        string roleName = user.Role.ToString();

        // 2. Génération du jeton et réponse
        var userDto = _mapper.Map<UserDto>(user);
        var token = _jwtTokenGenerator.GenerateToken(user);

        return new AuthenticationResponse(userDto, token, roleName);
    }
}