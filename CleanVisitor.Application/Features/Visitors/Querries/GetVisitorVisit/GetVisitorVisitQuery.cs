using MediatR;
using CleanVisitor.Application.Features.Visitors.Dtos.VisitorVisitDto;
namespace CleanVisitor.Application.Features.Visitors.Querries.GetVisitorVisit;
public record GetVisitorVisitQuery : IRequest<VisitorVisitDto>
{
    public int Id{get;set;}
    public GetVisitorVisitQuery(int id)
    {
        Id=id;
    }
}