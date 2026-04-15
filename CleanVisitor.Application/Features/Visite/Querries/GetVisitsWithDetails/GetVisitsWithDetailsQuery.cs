using MediatR;
using CleanVisitor.Application.Features.Visite.Dtos;
namespace CleanVisitor.Application.Features.Visite.Querries.GetVisitsWithDetails;

public class GetVisitsWithDetailsQuery : IRequest<IEnumerable<VisitDetailsDto>>
{
    // Pas de paramètres nécessaires ici car on veut tout
}