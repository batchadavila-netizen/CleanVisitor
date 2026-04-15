using CleanVisitor.Core.Enum.UserRole;
namespace CleanVisitor.Application.Features.Users.Dtos.UserRegistrationDto;
public class UserRegistrationDto
{
    public string Nom { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public UserRole Role { get; set; } 
    public record AuthenticationResponse(
    UserDto User, 
    string Token, 
    string Role
);
}