using CleanVisitor.Application.Features.Visitors.Dtos.StatAnneeDto;
using MediatR;
namespace CleanVisitor.Application.Features.Visitors.Querries.GetVisitorAnnee;
public record GetVisitorAnneeQuery:IRequest<List<StatAnneeDto>>{}
