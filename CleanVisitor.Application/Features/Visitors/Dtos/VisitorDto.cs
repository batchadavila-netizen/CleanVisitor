namespace CleanVisitor.Application.Features.Visitors.Dtos;
public class VisitorDto
{
    public string Nom{get;set;} =string.Empty;
    public string Telephone{get;set;} =string.Empty;
    public DateTime DateEnregistrement{get;set;}
    public DateTime DateCreation{get;set;}

   
}