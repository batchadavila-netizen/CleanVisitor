using CleanVisitor.Core.Entities.Visits;
using MediatR;
using CleanVisitor.Application.Features.Visite.Dtos;
namespace CleanVisitor.Application.Features.Visite.Querries.GetByDateVisit;
public record GetByDateVisitQuery : IRequest<VisitDto>
{
    public DateTime Date{get;set;}
    public GetByDateVisitQuery(DateTime date)
    {
        Date = date;
    }
}