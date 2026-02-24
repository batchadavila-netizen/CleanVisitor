using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using CleanVisitor.Application.Features.Users.Interfaces.IJwtTokenGenerator;
using CleanVisitor.Core.Enum.VisitStatut;
using CleanVisitor.Core.Enum.UserRole;
namespace CleanVisitor.Infrastructure.AuthService.JwtTokenGenerator;
public class JwtTokenGenerator : IJwtTokenGenerator
{
public string GenerateToken(string Nom, string Prenom, string Email, UserRole Role, bool IsActive, DateTime CreatedAt)
{
// 1. On prépare les informations à mettre dans le badge
var claims = new[]
{
            new Claim(JwtRegisteredClaimNames.FamilyName, Nom),
            new Claim(JwtRegisteredClaimNames.GivenName, Prenom),
            new Claim(JwtRegisteredClaimNames.Email, Email),
            new Claim(ClaimTypes.Role, Role.ToString()),
            new Claim("IsActive", IsActive.ToString().ToLower()),
            new Claim("CreatedAt", CreatedAt.ToString("O")),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
};

     var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes("MA_CLE_SUPER_SECRETE_DE_32_CHARS!!"));

        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: "CleanVisitor",
            audience: "CleanVisitor",
            claims: claims,
            expires: DateTime.Now.AddHours(2),
            signingCredentials: creds);

        return new JwtSecurityTokenHandler().WriteToken(token);
}
}