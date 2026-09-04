namespace CleanVisitor.Core.Entities;
public class Visitor {
    public int Id { get; set; }
    public string? Email { get; set; }
    public string? Nom { get; set; }
    public string? Prenom { get; set; }
    public string? Telephone { get; set; }
    public string? Password { get; set; } 
    public DateTime DateEnregistrement { get; set; } = DateTime.Now;
    public bool IsDeleted { get; set; }
    public DateTime? DeletedAt { get; set; }
    public int UserId { get; set; }
}