using MediatR;
using CleanVisitor.Core.Entities.Visits;
namespace CleanVisitor.Application.Features.Visite.Commande.DeleteVisit;
public record DeleteVisitCommand(int Id):IRequest<Visit>{}