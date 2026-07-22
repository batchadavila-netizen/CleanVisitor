using MediatR;
using CleanVisitor.Application.Features.Visitors.Dtos;

namespace CleanVisitor.Application.Features.Visitors.Commande.UpdateVisitor;

public record UpdateVisitorCommand : IRequest<VisitorDto>
{
    public int Id { get; set; }
    public string? Nom { get; set; }
    public string? Prenom { get; set; }
    public string? Telephone { get; set; }
    public string? Email { get; set; }
    public string? Password { get; set; }
}