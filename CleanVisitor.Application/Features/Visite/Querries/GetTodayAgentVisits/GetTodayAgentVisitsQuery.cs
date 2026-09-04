using MediatR;
using CleanVisitor.Application.Features.Visite.Dtos;
namespace CleanVisitor.Application.Features.Visite.Querries;
public record GetTodayAgentVisitsQuery(int UserId, string Service) : IRequest<IEnumerable<VisitDto>>;