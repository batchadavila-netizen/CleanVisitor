using FluentValidation;
using CleanVisitor.Application.Features.Users.Commande.CreateUser;
namespace CleanVisitor.Application.Feautures.Users.Commande.Command.CreateUserValidator;
public class CreateUserValidator : AbstractValidator<CreateUserCommand>
{
    public CreateUserValidator(){
RuleFor(u=> u.Nom)
.NotEmpty().WithMessage(" Le nom est obligatoire")
.MaximumLength(20).WithMessage(" Le nom ne dois pas depasser 20 caractere");

RuleFor(u=> u.PasswordHash)
.NotNull().WithMessage(" Le mot de passe ne doit pas etre Null");

RuleFor(u=>u.Email)
.EmailAddress().WithMessage(" Votre Email doit Contenir un @");


RuleFor(u=> u.Role)
.NotNull()
.IsInEnum().WithMessage("Le Role choisir n'exite pas");

RuleFor(u=> u.CreatedAt)
.LessThanOrEqualTo(DateTime.Now).WithMessage(" La date ne doit pas etre futur");
    }
}