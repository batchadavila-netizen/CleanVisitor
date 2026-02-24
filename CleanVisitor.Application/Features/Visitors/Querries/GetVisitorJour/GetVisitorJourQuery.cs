using MediatR;
using CleanVisitor.Application.Features.Visitors.Dtos.StatJourDto;
namespace CleanVisitor.Application.Features.Visitors.Querries.GetVisitorJour;
public record GetVisitorJourQuery:IRequest<List<StatJourDto>>{}