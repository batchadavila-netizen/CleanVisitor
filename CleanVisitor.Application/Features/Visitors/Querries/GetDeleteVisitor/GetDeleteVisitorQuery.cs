using MediatR;
using CleanVisitor.Application.Features.Visitors.Dtos;
namespace CleanVisitor.Application.Features.Visitors.Querries.GetDeleteVisitor;
public record GetDeletedVisitorQuery() : IRequest<List<VisitorDto>>;