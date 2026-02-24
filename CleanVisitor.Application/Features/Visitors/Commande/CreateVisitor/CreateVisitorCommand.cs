using MediatR;
using CleanVisitor.Application.Features.Visitors.Dtos;
using CleanVisitor.Core.Entities;
namespace CleanVisitor.Application.Features.Visitors.Commande.CreateVisitor;
public record CreateVisitorCommand:IRequest<VisitorDto?>
{
    public string Nom{get;set;}=string.Empty;
    public string Telephone{get;set;}=string.Empty;
    public String Email{get; set;}=string.Empty;
    public DateTime DateEnregistrement{get;set;}
    public DateTime DateCreation{get;set;}

}