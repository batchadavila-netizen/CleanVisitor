using CleanVisitor.Core.Enum.UserRole;
namespace CleanVisitor.Application.Features.Users.Dtos;
public class UserDto
{
    public int Id { get; set; }
    public string? Nom { get; set; }
    public string? Prenom { get; set; }
    public string? Email { get; set; }
    public string? Role { get; set; } 
    public DateTime CreatedAt { get; set; } = DateTime.Now;
    public bool IsActive { get; set; }
    public bool IsDeleted { get; set; } = false;
    public DateTime? DeletedAt { get; set; }
    public int VisitorId { get; set; }
}
