namespace CleanVisitor.Application.Features.Visite.Dtos;
public class VisitDetailsDto
{
    public int Id { get; set; }
    public string Motif { get; set; }
    public int Service { get; set; }
    public int Statut { get; set; }
    public string HeureArriver { get; set; }
    public int IdVisitor { get; set; }
    // Champs récupérés via le JOIN
    public string Nom { get; set; }
    public string Email { get; set; }
}