using MediatR;
using CleanVisitor.Application.Features.Users.Dtos;
namespace CleanVisitor.Application.Features.Users.Commande.DeleteUser.DeleteUserCommand;
public record DeleteUserCommand : IRequest<bool>
{
    public int Id{get;set;}
    public DeleteUserCommand(int id)
    {
        Id=id;
    }
}