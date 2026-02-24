using MediatR;
using CleanVisitor.Core.Enum.UserRole;
namespace CleanVisitor.Application.Features.Users.Commande.RegistreUser;
public record RegisterUserCommand:IRequest<AuthenticationResponse>{
    public string Nom { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty; 
    public UserRole Role { get; set; } 
}