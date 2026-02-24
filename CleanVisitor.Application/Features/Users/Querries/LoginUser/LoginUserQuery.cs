using MediatR;
using CleanVisitor.Core.Entities.User;
namespace CleanVisitor.Application.Features.Users.Querries.LoginUser;
public record LoginUserQuery : IRequest<AuthenticationResponse>
{
    public string Email{get;set;}=string.Empty;
    public string Password{get;set;}=string.Empty;
}