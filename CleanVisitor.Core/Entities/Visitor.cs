using CleanVisitor.Core.Entities.Visits;
namespace CleanVisitor.Core.Entities;
public class  Visitor{
    public int Id{get;set;}
    public String Email{get; set;}=string.Empty;
    public string Nom{get;set;}=string.Empty;
    public string Telephone{get;set;}=string.Empty;
    public DateTime DateEnregistrement{get;set;}=DateTime.Now;
    public bool IsDeleted { get; set; } 
    public DateTime? DeletedAt { get; set; }
    public int UserId{get;set;}

    
}