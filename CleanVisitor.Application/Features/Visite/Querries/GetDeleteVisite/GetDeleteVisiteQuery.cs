using MediatR;
using CleanVisitor.Application.Features.Visite.Dtos;
namespace CleanVisitor.Application.Features.Visite.Querries.GetDeleteVisite;
public record GetDeletedVisiteQuery() : IRequest<List<VisitDto>>;