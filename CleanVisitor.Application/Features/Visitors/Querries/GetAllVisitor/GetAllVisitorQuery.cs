using CleanVisitor.Application.Features.Visitors.Dtos;
using MediatR;
namespace CleanVisitor.Application.Features.Visitors.Querries.GetAllVisitor;
public record GetAllVisitorQuery : IRequest<List<VisitorDto>>
{
    public int Id;
    public String Nom=string.Empty;
    public string Telephone=string.Empty;
    public DateTime DateEnregistrement;
    public DateTime DateCreation;

}
