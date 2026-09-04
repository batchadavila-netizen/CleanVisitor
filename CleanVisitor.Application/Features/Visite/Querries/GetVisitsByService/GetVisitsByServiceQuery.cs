using MediatR;
using CleanVisitor.Application.Features.Visite.Dtos; 

namespace CleanVisitor.Application.Features.Visite.Querries.GetVisitsByService;

public record GetVisitsByServiceQuery(int ServiceId) : IRequest<List<VisitDto>>;