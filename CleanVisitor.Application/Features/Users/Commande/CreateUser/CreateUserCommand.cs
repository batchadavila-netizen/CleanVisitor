using MediatR;
using CleanVisitor.Application.Features.Users.Dtos;
using CleanVisitor.Core.Enum.UserRole;
using CleanVisitor.Core.Entities.User;
namespace CleanVisitor.Application.Features.Users.Commande.CreateUser;
public record CreateUserCommand : IRequest<UserDto>
{
    public string Nom { get; set; }=string.Empty;
    public string Prenom { get; set; }=string.Empty;
    public string Email { get; set; }=string.Empty;
    public string ?PasswordHash { get; set; } 
    public UserRole Role { get; set; }       
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.Now;
}