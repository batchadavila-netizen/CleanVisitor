using Microsoft.AspNetCore.Mvc;
using MediatR;
using CleanVisitor.Application.Features.Users.Commande.RegistreUser;
using CleanVisitor.Application.Features.Users.Querries.LoginUser;
using CleanVisitor.Application.Features.Users.Commande.ForgotPassword;
using CleanVisitor.Application.Features.Users.Commande.ResetPassword;
using Microsoft.AspNetCore.Authorization;
using CleanVisitor.Application.Features.Users.Commande.GoogleLogin;
[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IMediator _mediator;

    public AuthController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterUserCommand command)
    {
        // 1. Envoyer la commande au Handler via Mediator
        var userId = await _mediator.Send(command);

        // 2. Répondre avec le bon code HTTP
        return CreatedAtAction(nameof(Register), new { id = userId }, null);
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginUserQuery query)
    {
        // 1. Envoyer la query pour vérification
        var authResponse = await _mediator.Send(query);

        // 2. Si le résultat est nul, les identifiants sont faux
        if (authResponse == null)
        {
            return Unauthorized(new { message = "Email ou mot de passe incorrect" });
        }

        // 3. Retourner le Token et les infos utilisateur
        return Ok(authResponse);
    }
[HttpPost("forgot-password")]
[AllowAnonymous]
public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordCommand command)
{
    await _mediator.Send(command);
    // Toujours retourner OK pour ne pas révéler si l'email existe
    return Ok(new { message = "Si cet email existe, un lien a été envoyé." });
}

[HttpPost("reset-password")]
[AllowAnonymous]
public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordCommand command)
{
    var result = await _mediator.Send(command);
    if (!result)
        return BadRequest(new { message = "Token invalide ou expiré." });
    return Ok(new { message = "Mot de passe réinitialisé avec succès." });
}
[HttpPost("google-login")]
public async Task<IActionResult> GoogleLogin([FromBody] GoogleLoginCommand command)
{
    var result = await _mediator.Send(command);
    return Ok(result);
}
}