using Microsoft.AspNetCore.Mvc;
using MediatR;
using System.Security.Claims;
using CleanVisitor.Core.Entities.User;
using Microsoft.AspNetCore.Authorization;
using CleanVisitor.Application.Features.Users.Queries.GetAgentsByService;
using CleanVisitor.Application.Features.Users.Dtos;
using CleanVisitor.Application.Features.Users.Commande.CreateUser;
using CleanVisitor.Application.Features.Users.Commande.DeleteUser.DeleteUserCommand;
using CleanVisitor.Application.Features.Users.Commande.UpdateUser.UpdateUserCommand;
using CleanVisitor.Application.Features.Users.Querries.GetAllUser;
using CleanVisitor.Application.Features.Users.Querries.GetByEmailUser.GetByEmailUserQuery;
using CleanVisitor.Application.Features.Users.Querries.GetByIdUser.GetByIdUserQuery;
using CleanVisitor.Application.Features.Users.Commande.RestoreUser;
using CleanVisitor.Application.Features.Users.Querries.GetDeleteByIdUser.GetDeleteByIdUserQuery;
using CleanVisitor.Application.Features.Users.Querries.GetDeleteUser;
using CleanVisitor.Application.Features.Users.Queries.GetUserProfile;
using CleanVisitor.Application.Features.Users.Interfaces.IJwtTokenGenerator;

namespace CleanVisitor.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")] // 📌 URL générée : /api/user
    public class UserController : ControllerBase
    {
        private readonly IMediator _mediator;
        private readonly IJwtTokenGenerator _jwtTokenGenerator;

        public UserController(IMediator mediator, IJwtTokenGenerator jwtTokenGenerator)
        {
            _mediator = mediator;
            _jwtTokenGenerator = jwtTokenGenerator;
        }

        // 🟢 ENDPOINT DE SYNCHRONISATION (Accessible en /api/user/sync)
        [HttpPost("sync")]
        [AllowAnonymous]
        public async Task<IActionResult> Sync([FromBody] UserSyncDto dto)
        {
            if (string.IsNullOrEmpty(dto.Email))
            {
                return BadRequest(new { message = "L'adresse email est requise." });
            }

            // 1. Recherche si l'utilisateur existe déjà
            var existingUser = await _mediator.Send(new GetByEmailUserQuery(dto.Email));

            if (existingUser != null)
            {
                // Génération du token JWT local pour la session
                var existingToken = _jwtTokenGenerator.GenerateToken(existingUser);

                return Ok(new
                {
                    token = existingToken,
                    role = "Visiteur",
                    user = existingUser,
                    message = "Utilisateur déjà synchronisé."
                });
            }

            // 2. Création automatique de l'utilisateur s'il n'existe pas
            var command = new CreateUserCommand
            {
                Nom = string.IsNullOrWhiteSpace(dto.Nom) ? "Visiteur" : dto.Nom,
                Prenom = dto.Prenom ?? "Google",
                Email = dto.Email,
                Telephone = "+237600000000",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(Guid.NewGuid().ToString()),
                Role = (CleanVisitor.Core.Enum.UserRole.UserRole)3, // 3 = Visiteur
                Service = (CleanVisitor.Core.Enum.ServiceVisitor.ServiceVisitor)5 // 5 = Secrétariat
            };

            var createdUser = await _mediator.Send(command);

            // Génération du token JWT pour le nouvel utilisateur
            var token = _jwtTokenGenerator.GenerateToken(createdUser);

            return Ok(new
            {
                token = token,
                role = "Visiteur",
                user = createdUser,
                message = "Compte utilisateur créé et synchronisé avec succès."
            });
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateUserCommand request)
        {
            var user = await _mediator.Send(request);
            return Ok(user);
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> DeleteAsync(int id)
        {
            var user = await _mediator.Send(new DeleteUserCommand(id));
            return Ok(user);
        }

        [HttpPut]
        public async Task<IActionResult> Update([FromBody] UpdateUserCommand command)
        {
            await _mediator.Send(command);
            return NoContent();
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetByIdAsync(int id)
        {
            var user = await _mediator.Send(new GetByIdUserQuery(id));
            if (user == null) return NotFound();
            return Ok(user);
        }

        [HttpGet("email/{email}")]
        public async Task<IActionResult> GetByEmailAsync(string email)
        {
            var user = await _mediator.Send(new GetByEmailUserQuery(email));
            if (user == null) return NotFound();
            return Ok(user);
        }

        [HttpGet]
        public async Task<IActionResult> GetAllAsync()
        {
            var users = await _mediator.Send(new GetAllUserQuery());
            return Ok(users);
        }

        [HttpGet("deleted")]
        public async Task<IActionResult> GetDeletedAsync()
        {
            var users = await _mediator.Send(new GetDeletedUsersQuery());
            return Ok(users);
        }

        [HttpGet("deleted/{id:int}")]
        public async Task<IActionResult> GetDeletedByIdAsync([FromRoute] int id)
        {
            var user = await _mediator.Send(new GetDeletedByIdUserQuery(id));
            if (user == null) return NotFound();
            return Ok(user);
        }

        [HttpPost("restore/{id:int}")]
        public async Task<IActionResult> RestoreAsync(int id)
        {
            var result = await _mediator.Send(new RestoreUserCommand(id));
            return Ok(new { RestoredId = result });
        }

        [HttpGet("profile/{id}")]
        public async Task<IActionResult> GetProfile(int id)
        {
            var query = new GetUserProfileQuery { UserId = id };
            var result = await _mediator.Send(query);
            return Ok(result);
        }

        [HttpGet("agents-by-service/{service}")]
        public async Task<IActionResult> GetAgentsByService(string service)
        {
            var query = new GetAgentsByServiceQuery(service);
            var result = await _mediator.Send(query);
            return Ok(result);
        }
    }

    public class UserSyncDto
    {
        public string? ClerkId { get; set; }
        public string Email { get; set; } = string.Empty;
        public string? Nom { get; set; }
        public string? Prenom { get; set; }
        public string? Role { get; set; }
    }
}