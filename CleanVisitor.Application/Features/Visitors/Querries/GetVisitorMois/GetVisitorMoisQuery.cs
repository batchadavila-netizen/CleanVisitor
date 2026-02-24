using CleanVisitor.Application.Features.Visitors.Dtos.StatMoisDto;
using MediatR;
namespace CleanVisitor.Application.Features.Visitors.Querries.GetVisitorMois;
public record GetVisitorMoisQuery:IRequest<List<StatMoisDto>>{}