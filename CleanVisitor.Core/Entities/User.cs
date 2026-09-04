using CleanVisitor.Core.Enum. UserRole;
using CleanVisitor.Core.Enum. ServiceVisitor;

namespace CleanVisitor.Core.Entities.User;
public class User
{
    public int Id { get; set; }
    public string Nom { get; set; }=string.Empty;
    public string Prenom { get; set; }=string.Empty;
    public string Email { get; set; }=string.Empty;
   public string PasswordHash { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.Now;
    public bool IsDeleted { get; set; } = false;
    public DateTime? DeletedAt { get; set; }
    public UserRole Role{get;set;}
    public string ?Telephone {get; set;}
    public ServiceVisitor? Service { get; set; } = ServiceVisitor.Secretariat;
    public void UpdatePassword(string newHash) 
    {  
        PasswordHash = newHash;
    }
    public void AddPassword(string newHash)
    {
        PasswordHash= newHash;
    }
    // Dans CleanVisitor.Core.Entities.User.cs
public void SetPasswordHash(string newHash)
{
    PasswordHash = newHash;
}
}