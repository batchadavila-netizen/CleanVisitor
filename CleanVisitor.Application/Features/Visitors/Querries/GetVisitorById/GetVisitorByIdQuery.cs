using CleanVisitor.Application.Features.Visitors.Dtos;
using MediatR;
namespace CleanVisitor.Application.Features.Visitors.Querries.GetVisitorById;
public record GetVisitorByIdQuery:IRequest<VisitorDto?>
{
    public int Id{get;set;}
    public GetVisitorByIdQuery(int id)
    {
        Id=id;
    }
}