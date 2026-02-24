using MediatR;
using CleanVisitor.Application.Features.Visitors.Dtos;
using CleanVisitor.Core.Entities;
namespace CleanVisitor.Application.Features.Visitors.Commande.UpdateVisitor;
public record UpdateVisitorCommand:IRequest<Visitor>
{
    public int Id{get;set;}
    public string Nom{get;set;}=string.Empty;
    public string Telephone{get;set;}=string.Empty;
    public String Email{get; set;}=string.Empty;
}