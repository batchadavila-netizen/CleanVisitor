using CleanVisitor.Core.Enum. UserRole;

namespace CleanVisitor.Core.Entities.User;
public class User
{
    public int Id { get; set; }
    public string Nom { get; set; }=string.Empty;
    public string Prenom { get; set; }=string.Empty;
    public string Email { get; set; }=string.Empty;
    public byte[] ?PasswordHash { get; private set; } 
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.Now;
    public bool IsDeleted { get; set; } = false;
    public DateTime? DeletedAt { get; set; }
    public UserRole Role{get;set;}
    public void UpdatePassword(byte[] newHash) 
    {  
        PasswordHash = newHash;
    }
    public void AddPassword(byte[] newHash)
    {
        PasswordHash= newHash;
    }
}