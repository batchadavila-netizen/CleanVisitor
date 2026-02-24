using MediatR;
using CleanVisitor.Core.Entities.User;
using CleanVisitor.Application.Features.Users.Dtos;
namespace CleanVisitor.Application.Features.Users.Querries.GetAllUser;
public record GetAllUserQuery:IRequest<List<UserDto>>{}