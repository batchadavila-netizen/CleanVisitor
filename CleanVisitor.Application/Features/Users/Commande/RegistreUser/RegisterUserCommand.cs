using MediatR;
using CleanVisitor.Core.Enum.UserRole;
namespace CleanVisitor.Application.Features.Users.Commande.RegistreUser;
public record RegisterUserCommand:IRequest<AuthenticationResponse>{
    public string Nom { get; set; } = string.Empty;
    public string ?Prenom {get;set;}
    public string Email { get; set; } = string.Empty;
    public string ?PasswordHash { get; set; } 
    public UserRole Role { get; set; } 
    
}