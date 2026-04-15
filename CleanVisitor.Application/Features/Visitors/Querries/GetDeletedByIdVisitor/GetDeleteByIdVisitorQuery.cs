using MediatR;
using CleanVisitor.Application.Features.Visitors.Dtos;
namespace CleanVisitor.Application.Features.Visitors.Querries.GetDeleteByIdVisitor.GetDeleteByIdVisitorQuery;
public record GetDeletedByIdVisitorQuery(int Id) : IRequest<VisitorDto>;