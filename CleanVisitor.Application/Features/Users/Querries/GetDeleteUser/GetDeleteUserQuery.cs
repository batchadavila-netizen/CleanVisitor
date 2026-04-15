using MediatR;
using CleanVisitor.Application.Features.Users.Dtos;
namespace CleanVisitor.Application.Features.Users.Querries.GetDeleteUser;
public record GetDeletedUsersQuery() : IRequest<List<UserDto>>;