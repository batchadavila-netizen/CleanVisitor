using MediatR;
using CleanVisitor.Application.Features.Users.Dtos;
using CleanVisitor.Core.Enum.UserRole;
namespace CleanVisitor.Application.Features.Users.Commande.UpdateUser.UpdateUserCommand;
public record UpdateUserCommand : IRequest<UserDto?>
{
    public int Id{get;set;}
    public string Nom { get; set; }=string.Empty;
    public string Prenom { get; set; }=string.Empty;
    public string Email { get; set; }=string.Empty;
    public string ?PasswordHash { get; set; } 
    public UserRole Role { get; set; }       
    public bool IsActive { get; set; } = true;
    public string ?Telephone{get;set;}
    public DateTime CreatedAt { get; set; } = DateTime.Now;
    public string? Service { get; set; }
    }