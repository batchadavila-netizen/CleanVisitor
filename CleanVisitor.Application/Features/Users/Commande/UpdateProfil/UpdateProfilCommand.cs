using MediatR;
using CleanVisitor.Application.Features.Users.Dtos;

namespace CleanVisitor.Application.Features.Users.Commande.UpdateProfile.UpdateProfileCommand;

public record UpdateProfileCommand(
    int UserId,          // Injecté depuis le Token JWT dans le Controller
    string Nom,
    string Prenom,
    string Email,
    string Telephone
) : IRequest<UserDto?>;