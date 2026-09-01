using MediatR;
using CleanVisitor.Application.Features.Users.Dtos;
using CleanVisitor.Application.Features.Users.Querries.LoginUser;

namespace CleanVisitor.Application.Features.Users.Commande.GoogleLogin;

public record GoogleLoginCommand(
    string Email,
    string Nom,
    string Prenom,
    string? Telephone = ""
) : IRequest<AuthenticationResponse>;