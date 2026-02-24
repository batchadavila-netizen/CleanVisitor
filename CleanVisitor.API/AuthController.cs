using Microsoft.AspNetCore.Mvc;
using MediatR;
using CleanVisitor.Application.Features.Users.Commande.RegistreUser;
using CleanVisitor.Application.Features.Users.Querries.LoginUser;

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
}