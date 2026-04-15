using MediatR;
using CleanVisitor.Core.Enum.UserRole;
using CleanVisitor.Application.Features.Users.Dtos;
namespace CleanVisitor.Application.Features.Users.Commande.RestoreUser;
public record RestoreUserCommand(int Id) : IRequest<int>;