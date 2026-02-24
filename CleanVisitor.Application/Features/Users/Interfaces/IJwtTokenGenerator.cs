using CleanVisitor.Core.Entities.User;
using CleanVisitor.Core.Enum. UserRole;
namespace CleanVisitor.Application.Features.Users.Interfaces.IJwtTokenGenerator;
public interface IJwtTokenGenerator
{
string GenerateToken( string Nom, string Prenom, string Email, UserRole Role, bool IsActive, DateTime CreatedAt);
}