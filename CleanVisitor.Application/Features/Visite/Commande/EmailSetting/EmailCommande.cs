namespace CleanVisitor.Application.Features.Visite.Commande.EmailSetting;

public class EmailCommande
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty; // Ton code de 16 caractères Google
    public string Host { get; set; } = "smtp.gmail.com";
    public int Port { get; set; } = 587;
}