namespace CleanVisitor.Application.Features.Visitors.Dtos;
public class VisitorDto
{
    public int Id{get;set;}
    public string Nom{get;set;} =string.Empty;
    public string Telephone{get;set;} =string.Empty;
    public DateTime DateEnregistrement{get;set;}
    public bool IsDeleted { get; set; }
    public DateTime? DeletedAt { get; set; }

   
}