using MediatR;
using CleanVisitor.Application.Features.Visite.Dtos;
using CleanVisitor.Core.Entities.Visits;
namespace CleanVisitor.Application.Features.Visite.Querries.GetAllVisit;
public record GetAllVisitQuery:IRequest<List<VisitDto>>{}