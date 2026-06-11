using MediatR;

namespace CleanVisitor.Application.Features.Users.Commande.ForgotPassword;

public class ForgotPasswordCommand : IRequest<bool>
{
    public string Email { get; set; } = string.Empty;
}