using MediatR;
using CleanVisitor.Application.Features.Users.Dtos;

namespace CleanVisitor.Application.Features.Users.Queries.GetAgentsByService;

public record GetAgentsByServiceQuery(string Service) : IRequest<List<UserDto>>;