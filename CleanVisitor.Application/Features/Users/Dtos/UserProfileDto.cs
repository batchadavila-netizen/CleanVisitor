namespace CleanVisitor.Application.Features.Users.Dtos;

public class UserProfileDto
{
    public int Id { get; set; }
    public string Nom { get; set; }
    public string Prenom { get; set; }
    public string Email { get; set; }
    
    // Le rôle sera retourné sous forme de chaîne (Admin, Agent, Visiteur)
    public string Role { get; set; }
    
    // Ce champ sera rempli par le LEFT JOIN sur la table Visitors
    public string Telephone { get; set; }
}