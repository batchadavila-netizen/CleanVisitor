using CleanVisitor.Application.Features.Visite.Dtos.ServiceDto;
using MediatR;
namespace CleanVisitor.Application.Features.Visite.Querries.GetVisitCountByServiceStatut.GetVisitCountByServiceStatutQuery;
public record GetVisitCountByServiceStatutQuery:IRequest<List<ServiceDto>>{}