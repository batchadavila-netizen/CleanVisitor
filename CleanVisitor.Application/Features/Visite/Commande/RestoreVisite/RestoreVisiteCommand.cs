using MediatR;
using CleanVisitor.Core.Enum.UserRole;
using CleanVisitor.Application.Features.Users.Dtos;
namespace CleanVisitor.Application.Features.Visite.Commande.RestoreUser;
public record RestoreVisiteCommand(int Id) : IRequest<int>;