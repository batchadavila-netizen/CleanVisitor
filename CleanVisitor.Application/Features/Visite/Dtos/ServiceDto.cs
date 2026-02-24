using CleanVisitor.Core.Enum.ServiceVisitor;
using CleanVisitor.Core.Enum.VisitStatut;
namespace CleanVisitor.Application.Features.Visite.Dtos.ServiceDto;
public class ServiceDto
{
    public ServiceVisitor Service{get;set;}
    public VisitStatut Statut{get;set;}
    public int Total_visit{get;set;}
}