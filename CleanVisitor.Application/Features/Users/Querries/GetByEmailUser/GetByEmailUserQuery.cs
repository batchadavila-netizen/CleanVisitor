using MediatR;
using CleanVisitor.Application.Features.Users.Dtos;
using CleanVisitor.Core.Entities.User;
namespace CleanVisitor.Application.Features.Users.Querries.GetByEmailUser.GetByEmailUserQuery;
public record GetByEmailUserQuery : IRequest<UserDto>
{
    public string Email{get;set;}=string.Empty;
    public GetByEmailUserQuery(string email)
    {
        Email=email ;
    }
}