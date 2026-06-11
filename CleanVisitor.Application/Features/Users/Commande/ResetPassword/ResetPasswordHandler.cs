using MediatR;
using CleanVisitor.Application.Features.Users.Interfaces;
using BC = BCrypt.Net.BCrypt;

namespace CleanVisitor.Application.Features.Users.Commande.ResetPassword;

public class ResetPasswordHandler : IRequestHandler<ResetPasswordCommand, bool>
{
    private readonly IUserRepository _userRepository;

    public ResetPasswordHandler(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<bool> Handle(ResetPasswordCommand request, CancellationToken cancellationToken)
    {
        // 1. Vérifier le token
        var user = await _userRepository.GetByResetTokenAsync(request.Email, request.Token);
        if (user == null) return false; // Token invalide ou expiré

        // 2. Hasher le nouveau mot de passe
       var newHash = BC.HashPassword(request.NewPassword);

        // 3. Mettre à jour le mot de passe et supprimer le token
        await _userRepository.UpdatePasswordAsync(user.Id, newHash);
        return true;
    }
}