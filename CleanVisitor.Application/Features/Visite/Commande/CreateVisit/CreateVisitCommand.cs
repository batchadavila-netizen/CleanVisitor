using MediatR;
using CleanVisitor.Core.Enum.VisitStatut;
using CleanVisitor.Core.Enum.ServiceVisitor;
using CleanVisitor.Application.Features.Visite.Dtos;
namespace CleanVisitor.Application.Features.Visite.Commande.CreateVisit;
public record CreateVisitCommand : IRequest<VisitDto>
{
    public string Motif{get;set;}=string.Empty;
    public DateTime Date{get;set;}
    public TimeSpan HeureDepart{get;set;}
    public TimeSpan HeureArriver{get; set;}
    public VisitStatut Statut{get;set;}
    public ServiceVisitor Service{get;set;}
    public int IdVisitor {get;set;}
    public int UserId {get; set;}
    public string? AccessCode { get; set; }
}