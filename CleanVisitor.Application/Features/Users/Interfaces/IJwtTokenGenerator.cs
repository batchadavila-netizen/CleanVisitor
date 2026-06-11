using CleanVisitor.Core.Entities.User;
using CleanVisitor.Core.Enum. UserRole;
using CleanVisitor.Application.Features.Users.Dtos;
namespace CleanVisitor.Application.Features.Users.Interfaces.IJwtTokenGenerator;
public interface IJwtTokenGenerator
{
string GenerateToken(UserDto user );
}
