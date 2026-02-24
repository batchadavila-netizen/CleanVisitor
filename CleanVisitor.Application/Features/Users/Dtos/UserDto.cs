using CleanVisitor.Core.Enum.UserRole;
namespace CleanVisitor.Application.Features.Users.Dtos;
public class UserDto
{
     public string Nom { get; set; }=string.Empty;
    public string Prenom { get; set; }=string.Empty;
    public string Email { get; set; }=string.Empty;
    public UserRole Role { get; set; }       
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.Now;
    public bool IsDeleted {get;set;}= false;
}