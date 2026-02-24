using FluentValidation;
using CleanVisitor.Application.Features.Visitors.Commande.CreateVisitor;
namespace CleanVisitor.Application.Features.Visitors.Commande.CreateVisit.CreateVisitValidator;
public class CreateVisitorValidator : AbstractValidator<CreateVisitorCommand>
{
    public CreateVisitorValidator()
    {
        RuleFor(t=>t.Nom)
        .NotEmpty().WithMessage("Le Motif est obligatoire")
        .MaximumLength(20).WithMessage("Le motif ne dois pas de passer 50 caractere");

        RuleFor(t=>t.DateEnregistrement)
        .LessThanOrEqualTo(DateTime.Now).WithMessage("On ne peut entrez une date futur");

        RuleFor(t=>t.Email)
        .EmailAddress().WithMessage("L'Email doit toujours contenir un @")
        .MaximumLength(20).WithMessage("Ne doit pas depasser 20 Caractere");

        RuleFor(t=>t.Telephone)
        .NotNull().WithMessage("Ne doit Pas etre Null")
        .Matches(@"1\+[1-9]\d\d{7,14}$").WithMessage("Numero de telephone Invalide");

    }  
}