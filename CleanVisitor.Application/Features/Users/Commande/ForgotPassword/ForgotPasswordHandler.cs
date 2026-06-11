using MediatR;
using CleanVisitor.Application.Features.Users.Interfaces;
using CleanVisitor.Application.Features.Visite.Interfaces;
using System.Security.Cryptography;

namespace CleanVisitor.Application.Features.Users.Commande.ForgotPassword;

public class ForgotPasswordHandler : IRequestHandler<ForgotPasswordCommand, bool>
{
    private readonly IUserRepository _userRepository;
    private readonly IEmailService _emailService;

    public ForgotPasswordHandler(IUserRepository userRepository, IEmailService emailService)
    {
        _userRepository = userRepository;
        _emailService = emailService;
    }

    public async Task<bool> Handle(ForgotPasswordCommand request, CancellationToken cancellationToken)
    {
        // 1. Vérifier si l'email existe
        var user = await _userRepository.GetByEmailAsync(request.Email);
        if (user == null) return true; // On retourne true pour ne pas révéler si l'email existe

        // 2. Générer un token sécurisé
        var token = Convert.ToHexString(RandomNumberGenerator.GetBytes(32));
       var expiry = DateTime.Now.AddHours(1); 

        // 3. Sauvegarder le token en base
        await _userRepository.SaveResetTokenAsync(user.Id, token, expiry);

        // 4. Construire le lien de réinitialisation
        var resetLink = $"http://localhost:5173/reset-password?token={token}&email={request.Email}";

        // 5. Envoyer l'email
        var body = $@"
            <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;'>
                <h2 style='color: #2563eb;'>Réinitialisation de mot de passe</h2>
                <p>Bonjour <strong>{user.Nom}</strong>,</p>
                <p>Vous avez demandé la réinitialisation de votre mot de passe.</p>
                <p>Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :</p>
                <a href='{resetLink}' 
                   style='display:inline-block; background:#2563eb; color:white; 
                          padding:12px 24px; border-radius:8px; text-decoration:none; 
                          font-weight:bold; margin: 16px 0;'>
                    Réinitialiser mon mot de passe
                </a>
                <p style='color:#666; font-size:12px;'>Ce lien expire dans <strong>1 heure</strong>.</p>
                <p style='color:#666; font-size:12px;'>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>
            </div>";

        await _emailService.SendEmailAsync(request.Email, "Réinitialisation de mot de passe", body);
        return true;
    }
}