using MediatR;
using CleanVisitor.Core.Enum.UserRole;
using CleanVisitor.Application.Features.Users.Dtos;
namespace CleanVisitor.Application.Features.Visitors.Commande.RestoreUser;
public record RestoreVisitorCommand(int Id) : IRequest<int>;