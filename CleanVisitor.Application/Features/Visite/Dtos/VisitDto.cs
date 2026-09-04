using CleanVisitor.Core.Enum.VisitStatut;
using CleanVisitor.Core.Enum.ServiceVisitor;

namespace CleanVisitor.Application.Features.Visite.Dtos;

public class VisitDto
{
    public int Id { get; set; }
    public int IdVisitor { get; set; } 
    public string? Email_visitor { get; set; }
    public string Motif { get; set; } = string.Empty;
    public DateTime Date { get; set; }
    public TimeSpan HeureDepart { get; set; }
    public TimeSpan HeureArriver { get; set; }
    public VisitStatut Statut { get; set; }
    public ServiceVisitor Service { get; set; }
    public bool IsDeleted { get; set; } = false;
    public DateTime? DeletedAt { get; set; }

    // Informations Agent / Hôte
    public int? UserId { get; set; }
    public string? Nom_Host { get; set; }
    public string? Prenom_Host { get; set; }
    
    // Pass d'accès
    public string? AccessCode { get; set; }

    // 🟢 Propriété unique utilisée par tes fichiers existants
    public string? Nom_visitor { get; set; }
    public string? Prenom_visitor { get; set; }
}