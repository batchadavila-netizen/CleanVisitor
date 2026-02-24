using MediatR;
using CleanVisitor.Application.Features.Users.Dtos;
namespace CleanVisitor.Application.Features.Users.Querries.GetByIdUser.GetByIdUserQuery;
public record GetByIdUserQuery : IRequest<UserDto>
{
    public int Id{get;set;}
    public GetByIdUserQuery(int id)
    {
        Id=id;
    }
}