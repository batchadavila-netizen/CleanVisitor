using Microsoft.AspNetCore.Mvc;
using MediatR;
using CleanVisitor.Core.Entities;
using CleanVisitor.Infrastructure.Data;
using CleanVisitor.Application.Features.Visitors.Querries.GetAllVisitor;
using CleanVisitor.Application.Features.Visitors.Querries.GetVisitorById;
using CleanVisitor.Application.Features.Visitors.Commande.UpdateVisitor;
using CleanVisitor.Application.Features.Visitors.Commande.DeleteVisitor;
using CleanVisitor.Application.Features.Visitors.Commande.CreateVisitor;
using CleanVisitor.Application.Features.Visitors.Querries.GetVisitorVisit;
using CleanVisitor.Application.Features.Visitors.Querries.GetVisitorJour;
using CleanVisitor.Application.Features.Visitors.Querries.GetVisitorAnnee;
using CleanVisitor.Application.Features.Visitors.Querries.GetVisitorMois;
using CleanVisitor.Application.Features.Visitors.Commande.RestoreUser;
using CleanVisitor.Application.Features.Visitors.Querries.GetDeleteByIdVisitor.GetDeleteByIdVisitorQuery;
using CleanVisitor.Application.Features.Visitors.Querries.GetDeleteVisitor;

namespace CleanVisitor.Api.Controllers;
   [ApiController]
[Route("api/[controller]")] 
public class VisitorController : ControllerBase
    {
        private readonly IMediator _mediator;

        public VisitorController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpPost]
public async Task<IActionResult> Create([FromBody] CreateVisitorCommand command) 
{
    var result = await _mediator.Send(command);
    return Ok(result);
}

        [HttpGet("{id}")]
public async Task<IActionResult> GetById(int id)
{
    var result = await _mediator.Send(new GetVisitorByIdQuery(id)); 

    if (result == null) return NotFound(); 
    return Ok(result);
}
[HttpGet("detail/{id}")]
public async Task<IActionResult>GetVisitorVisit([FromRoute]int id)
    {
        var visitor= await _mediator.Send(new GetVisitorVisitQuery(id));
        if(visitor==null)  return NotFound();
        return Ok(visitor);
    }
          [HttpGet()]
    public async Task<IActionResult> GetAll()
    {
        var result=await _mediator.Send(new GetAllVisitorQuery());
        return Ok(result);
    }
    [HttpGet("stat_jour")]
    public async Task<IActionResult> GetVisitorJour()
    {
        var statistique=await _mediator.Send(new GetVisitorJourQuery());
        return Ok(statistique);
    }
    [HttpGet("stat_mois")]
    public async Task<IActionResult> GetVisitorMois()
    {
        var statistique=await _mediator.Send(new GetVisitorMoisQuery());
        return Ok(statistique);
    }
    [HttpGet("stat_annee")]
    public async Task<IActionResult> GetVisitorAnnee()
    {
        var statistique=await _mediator.Send(new GetVisitorAnneeQuery());
        return Ok(statistique);
    }
      [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteAsync(int id)
    {
       var visitor=await _mediator.Send(new DeleteVisitorCommand(id)); 
       if (visitor==null)
       return NotFound("Visitors non trouver.");
       return NoContent();
    }
    [HttpPut]

public async Task<IActionResult> Update( [FromBody] UpdateVisitorCommand command)
{

    await _mediator.Send(command);
    return NoContent();
}
 [HttpGet("deleted")]
public async Task<IActionResult> GetDeletedAsync()
    {
        // Nécessite une nouvelle Query : GetAllDeletedUsersQuery
        var users = await _mediator.Send(new GetDeletedVisitorQuery());
        return Ok(users);
    }

    [HttpGet("deleted/{id:int}")]
    public async Task<IActionResult> GetDeletedByIdAsync(int id)
    {
        // Nécessite une nouvelle Query : GetDeletedUserByIdQuery
        var user = await _mediator.Send(new GetDeletedByIdVisitorQuery(id));
        if (user == null) return NotFound();
        return Ok(user);
    }

    [HttpPost("restore/{id:int}")]
    public async Task<IActionResult> RestoreAsync(int id)
    {
        // Nécessite une nouvelle Commande : RestoreUserCommand
        var result = await _mediator.Send(new RestoreVisitorCommand(id));
        return Ok(new { RestoredId = result });
    }
}
  