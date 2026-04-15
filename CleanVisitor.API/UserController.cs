using Microsoft.AspNetCore.Mvc;
using MediatR;
using System.Security.Claims;
using CleanVisitor.Core.Entities.User;
using Microsoft.AspNetCore.Authorization;
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
// [Authorize]
[ApiController]
[Route("api/[controller]")]
public class UserController : ControllerBase
{
    private readonly IMediator _mediator;
    public UserController(IMediator mediator)
    {
        _mediator = mediator;
    }

    // [HttpGet("whoami")]
    // public IActionResult WhoAmI()
    // {
    //     var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
    //     var role = User.FindFirst(ClaimTypes.Role)?.Value;
    //     return Ok(new { userId, role });
    // }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateUserCommand request)
    {
        var user = await _mediator.Send(request);
        return Ok(user);
    }

    [HttpDelete("{id:int}")] // Ajout du paramètre dans la route
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

    [HttpGet("email/{email}")] // Changement de route pour éviter le conflit avec GetById
    public async Task<IActionResult> GetByEmailAsync(string email)
    {
        var user = await _mediator.Send(new GetByEmailUserQuery(email));
        if (user == null) return NotFound(); // Correction : on vérifie 'user', pas 'email'
        return Ok(user);
    }

    [HttpGet]
    public async Task<IActionResult> GetAllAsync()
    {
        var users = await _mediator.Send(new GetAllUserQuery());
        return Ok(users);
    }

    // --- NOUVELLES MÉTHODES POUR COMPLÉTER L'INTERFACE ---

    [HttpGet("deleted")]
    public async Task<IActionResult> GetDeletedAsync()
    {
        // Nécessite une nouvelle Query : GetAllDeletedUsersQuery
        var users = await _mediator.Send(new GetDeletedUsersQuery());
        return Ok(users);
    }

    [HttpGet("deleted/{id:int}")] 
public async Task<IActionResult> GetDeletedByIdAsync([FromRoute] int id)
{
    // Ajoute ceci aussi
    Console.WriteLine($"---> Appel de GetDeletedById (SUPPRIMÉ) pour l'ID: {id}");
    
    var user = await _mediator.Send(new GetDeletedByIdUserQuery(id));
    if (user == null) return NotFound();
    return Ok(user);
}

    [HttpPost("restore/{id:int}")]
    public async Task<IActionResult> RestoreAsync(int id)
    {
        // Nécessite une nouvelle Commande : RestoreUserCommand
        var result = await _mediator.Send(new RestoreUserCommand(id));
        return Ok(new { RestoredId = result });
    }
}