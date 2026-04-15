using MediatR;
using CleanVisitor.Application.Features.Visite.Dtos;
namespace CleanVisitor.Application.Features.Visite.Querries.GetDeleteByIdVisite.GetDeleteByIdVisiteQuery;
public record GetDeletedByIdVisiteQuery(int Id) : IRequest<VisitDto>;