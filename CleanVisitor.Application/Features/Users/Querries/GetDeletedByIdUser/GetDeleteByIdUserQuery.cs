using MediatR;
using CleanVisitor.Application.Features.Users.Dtos;
namespace CleanVisitor.Application.Features.Users.Querries.GetDeleteByIdUser.GetDeleteByIdUserQuery;
public record GetDeletedByIdUserQuery(int Id) : IRequest<UserDto>;