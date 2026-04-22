using MediatR;
using CleanVisitor.Application.Features.Visite.Dtos;
namespace CleanVisitor.Application.Features.Visite.Querries.GetUserVisits;
public record GetUserVisitsQuery(int UserId) : IRequest<List<VisitDto>>;