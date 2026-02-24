using CleanVisitor.Features.Visitors.Dtos.VisitCloneDto;
using CleanVisitor.Core.Enum. VisitStatut;
using CleanVisitor.Core.Enum. ServiceVisitor;
namespace CleanVisitor.Application.Features.Visitors.Dtos.VisitorVisitDto;
public class VisitorVisitDto
{
    public string Nom{get;set;} =string.Empty;
    public string Telephone{get;set;} =string.Empty;
    public DateTime DateEnregistrement{get;set;}
    public DateTime DateCreation{get;set;}
    public List<VisitClonDto> ?ListVisitClon{get;set;}
}