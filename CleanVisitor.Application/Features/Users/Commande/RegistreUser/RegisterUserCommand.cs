using MediatR;
using CleanVisitor.Core.Enum.UserRole;
namespace CleanVisitor.Application.Features.Users.Commande.RegistreUser;

public record RegisterUserCommand : IRequest<AuthenticationResponse>
{
    public string Nom { get; set; } = string.Empty;
    public string? Prenom { get; set; }
    public string Email { get; set; } = string.Empty;
    
    // On met les deux noms les plus probables envoyés par React
    public string? Password { get; set; } 
    public string? PasswordHash { get; set; } 
    
    public UserRole Role { get; set; } 
    public string? Telephone { get; set; }
}