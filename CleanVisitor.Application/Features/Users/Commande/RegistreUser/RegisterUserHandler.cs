using MediatR;
using AutoMapper;
using CleanVisitor.Core.Entities.User;
using CleanVisitor.Core.Entities; // Accès à l'entité Visitor
using CleanVisitor.Application.Features.Users.Dtos;
using CleanVisitor.Application.Features.Users.Interfaces.IJwtTokenGenerator;
using CleanVisitor.Application.Features.Users.Interfaces;
using CleanVisitor.Application.Features.Users.Commande.RegistreUser;
using CleanVisitor.Application.Features.Visitors.Interfaces; // IVisitorRepository

namespace CleanVisitor.Application.Features.Users.Commande.RegistreUser.RegisterUserHandler;

public class RegisterUserHandler : IRequestHandler<RegisterUserCommand, AuthenticationResponse>
{
    private readonly IUserRepository _repository;
    private readonly IVisitorRepository _visitorRepository;
    private readonly IMapper _mapper;
    private readonly IJwtTokenGenerator _jwtTokenGenerator;

    public RegisterUserHandler(
        IUserRepository repository, 
        IVisitorRepository visitorRepository, 
        IMapper mapper, 
        IJwtTokenGenerator jwtTokenGenerator)
    {
        _repository = repository;
        _visitorRepository = visitorRepository;
        _mapper = mapper;
        _jwtTokenGenerator = jwtTokenGenerator;
    }

    public async Task<AuthenticationResponse> Handle(RegisterUserCommand request, CancellationToken cancellationToken)
    {
        var user = _mapper.Map<User>(request);

        // Recherche du mot de passe brut envoyé
        string? rawPassword = request.Password ?? request.PasswordHash;

        // DEBUG CONSOLE
        Console.WriteLine("\n=== DEBUG INSCRIPTION ===");
        Console.WriteLine($"Email reçu : {request.Email}");
        Console.WriteLine($"Password reçu : '{request.Password}'");
        Console.WriteLine($"PasswordHash reçu : '{request.PasswordHash}'");
        Console.WriteLine($"Mot de passe final retenu : '{rawPassword}'");
        Console.WriteLine("=========================\n");

        // Hachage du mot de passe
        if (!string.IsNullOrEmpty(rawPassword))
        {
            string hashedPassword = BCrypt.Net.BCrypt.HashPassword(rawPassword);
            user.AddPassword(hashedPassword);
        }
        else
        {
            Console.WriteLine("🚨 ATTENTION : LE MOT DE PASSE REÇU EST VIDE ! 🚨");
        }

        // Sauvegarde de l'utilisateur
        await _repository.AddAsync(user);

        // Création automatique de la fiche Visiteur si le rôle est Visiteur (3)
        if ((int)user.Role == 3) 
        {
            var visitor = new Visitor
            {
                Nom = user.Nom,
                Prenom = user.Prenom,
                Email = user.Email,
                Telephone = request.Telephone 
            };
            
            await _visitorRepository.AddAsync(visitor);
        }

        string roleName = user.Role.ToString();
        
        // 🟢 Extraction du service pour la réponse (Valeur par défaut: "5" pour Secrétariat)
        string serviceCode = user.Service?.ToString() ?? "5";

        // Génération du jeton et mappage DTO
        var userDto = _mapper.Map<UserDto>(user);
        var token = _jwtTokenGenerator.GenerateToken(userDto);

        // 🟢 Envoi des 4 arguments requis par AuthenticationResponse
        return new AuthenticationResponse(userDto, token, roleName, serviceCode);
    }
}