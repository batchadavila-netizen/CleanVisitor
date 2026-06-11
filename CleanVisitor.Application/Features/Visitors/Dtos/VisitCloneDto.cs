namespace CleanVisitor.Features.Visitors.Dtos.VisitCloneDto;
using CleanVisitor.Core.Enum. VisitStatut;
using CleanVisitor.Core.Enum. ServiceVisitor;
public class VisitClonDto
{
     public int Id { get; set; }
    public int IdVisitor { get; set; }
    public string Motif{get;set;}=string.Empty;
    public DateTime Date{get;set;}
    public TimeSpan HeureDepart{get;set;}
     public TimeSpan HeureArriver{get;set;}
    public VisitStatut Statut{get;set;}
     public ServiceVisitor Service{get;set;}
}