using MediatR;

namespace CleanVisitor.Application.Features.Users.Commande.ResetPassword;

public class ResetPasswordCommand : IRequest<bool>
{
    public string Email { get; set; } = string.Empty;
    public string Token { get; set; } = string.Empty;
    public string NewPassword { get; set; } = string.Empty;
}