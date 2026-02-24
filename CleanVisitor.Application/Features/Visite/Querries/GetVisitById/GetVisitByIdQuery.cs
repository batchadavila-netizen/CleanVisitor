using CleanVisitor.Application.Features.Visite.Dtos;
using CleanVisitor.Core.Entities.Visits;
using MediatR;
namespace CleanVisitor.Application.Features.Visite.Querries.GetVisitById;
public class GetVisitByIdQuery : IRequest<VisitDto?>
{
    public int Id{get;set;}
   
    public GetVisitByIdQuery(int id)
    {
        Id=id;
    }
}
