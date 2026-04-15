using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using CleanVisitor.Application.Features.Users.Interfaces.IJwtTokenGenerator;
using CleanVisitor.Application.Features.Users.Interfaces;
using CleanVisitor.Application.Features.Users.Dtos;
using CleanVisitor.Core.Enum.UserRole;
using CleanVisitor.Core.Entities.User;
namespace CleanVisitor.Infrastructure.AuthService.JwtTokenGenerator;
public class JwtTokenGenerator : IJwtTokenGenerator
{
    private readonly IConfiguration _configuration;
     public JwtTokenGenerator(IConfiguration configuration)
    {
        _configuration = configuration;
    }
public string GenerateToken( User user)

{
// 1. On prépare les informations à mettre dans le badge
var claims = new List<Claim>
{
            new Claim(JwtRegisteredClaimNames.FamilyName, user.Nom),
            new Claim(JwtRegisteredClaimNames.GivenName, user.Prenom),
            new Claim(JwtRegisteredClaimNames.Email, user.Email),
            new Claim(ClaimTypes.Role, user.Role.ToString()),
            new Claim("IsActive", user.IsActive.ToString().ToLower()),
            new Claim("CreatedAt", user.CreatedAt.ToString("O")),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
};

    var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]));

        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _configuration["Jwt:Issuer"],
            audience:_configuration["Jwt:Audience"],
            claims: claims,
            expires: DateTime.Now.AddHours(2),
            signingCredentials: creds);

        return new JwtSecurityTokenHandler().WriteToken(token);
}
}