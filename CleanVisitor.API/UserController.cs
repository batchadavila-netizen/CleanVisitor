using Microsoft.AspNetCore.Mvc;
using MediatR;
using CleanVisitor.Core.Entities.User;
using CleanVisitor.Application.Features.Users.Dtos;
using CleanVisitor.Application.Features.Users.Commande.CreateUser;
using CleanVisitor.Application.Features.Users.Commande.DeleteUser.DeleteUserCommand;
using CleanVisitor.Application.Features.Users.Commande.UpdateUser.UpdateUserCommand;
using CleanVisitor.Application.Features.Users.Querries.GetAllUser;
using CleanVisitor.Application.Features.Users.Querries.GetByEmailUser.GetByEmailUserQuery;
using CleanVisitor.Application.Features.Users.Querries.GetByIdUser.GetByIdUserQuery;
[ApiController]
[Route("api/[controller]")]
public class UserController : ControllerBase
{
    private readonly IMediator _mediator;
    public UserController(IMediator mediator)
    {
        _mediator=mediator;
    }
    [HttpPost]
    public async Task<IActionResult>Create([FromBody] CreateUserCommand request)
    {
        var user=await _mediator.Send(request);
        return Ok(user);
    }
    [HttpDelete]
    public async Task<IActionResult>DeleteAsync(int id)
    {
        var user=await _mediator.Send(new DeleteUserCommand(id));
        return Ok(user);
        
    }
    [HttpPut("{id}")]
public async Task<IActionResult> Update(int id, UpdateUserCommand command)
{
    command.Id = id; 
    await _mediator.Send(command);
    return NoContent();
}
[HttpGet("{id:int}")]
public async Task<IActionResult>GetByIdAsync(int id)
    {
       var user=await _mediator.Send(new GetByIdUserQuery(id));
       if (user==null) return NotFound();
       return Ok(user);
    }
    [HttpGet("{email}")]
    public async Task<IActionResult>GetByEmailAsync(string email)
    {
        var user=await _mediator.Send(new GetByEmailUserQuery(email));
        if(email==null) return NotFound();
        return Ok(user);
    }
    [HttpGet]
    public async Task<IActionResult> GetAllAsync()
    {
        var user=await _mediator.Send(new GetAllUserQuery());
        return Ok(user);
    }
    }
