using CleanVisitor.Core.Entities.Visits;
namespace CleanVisitor.Core.Entities;
public class  Visitor{
    public int Id{get;set;}
    public String Email{get; set;}=string.Empty;
    public string Nom{get;set;}=string.Empty;
    public string Prenom{get;set;}=string.Empty;
    public string Telephone{get;set;}=string.Empty;
    public DateTime DateEnregistrement{get;set;}
    public DateTime DateCreation{get; set;}=DateTime.Now;
    public List<Visit> ?visits{get;set;}

    
}