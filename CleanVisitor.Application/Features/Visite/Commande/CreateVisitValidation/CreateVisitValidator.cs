using FluentValidation;
using CleanVisitor.Application.Features.Visite.Commande.CreateVisit;
namespace CleanVisitor.Application.Features.Visite.Commande.CreateVisitValidator;
public class CreateVisitValidator : AbstractValidator<CreateVisitCommand>
{
    public CreateVisitValidator()
    {
        RuleFor(v=>v.Motif)
        .NotEmpty().WithMessage("Le Motif est obligatoire")
        .MaximumLength(50).WithMessage("Le motif ne dois pas de passer 50 caractere");

       RuleFor(v => v.Date)
    .GreaterThanOrEqualTo(DateTime.Today)
    .WithMessage("La visite doit être prévue pour aujourd'hui ou plus tard.");
        
        RuleFor(t=>t.Service)
        .IsInEnum().WithMessage("Le Service Choisir N'exite Pas");

        RuleFor(v=>v.Statut)
        .NotNull()
        .IsInEnum().WithMessage("Le Statut choisir n'existe pas ");
    }  
}