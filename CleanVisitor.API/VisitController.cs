using System.Data;
using Microsoft.AspNetCore.Mvc;
using MediatR;
using CleanVisitor.Infrastructure.Data;
using CleanVisitor.Application.Features.Visite.Commande.CreateVisit;
using CleanVisitor.Application.Features.Visite.Commande.DeleteVisit;
using CleanVisitor.Application.Features.Visite.Commande.UpdateVisit.UpdateVisitCommand;
using CleanVisitor.Application.Features.Visite.Querries.GetAllVisit;
using CleanVisitor.Application.Features.Visite.Querries.GetByDateVisit;
using CleanVisitor.Application.Features.Visite.Querries.GetVisitById;
using CleanVisitor.Application.Features.Visite.Querries.GetVisitCountByServiceStatut.GetVisitCountByServiceStatutQuery;
using CleanVisitor.Application.Features.Visite.Commande.RestoreUser;
using CleanVisitor.Application.Features.Visite.Querries.GetDeleteByIdVisite.GetDeleteByIdVisiteQuery;
using CleanVisitor.Application.Features.Visite.Querries.GetDeleteVisite;
using CleanVisitor.Application.Features.Visite.Commande.UpdateVisitStatus;
using CleanVisitor.Application.Features.Visite.Querries.GetVisitsWithDetails;
[ApiController]
[Route("api/[controller]")]
public class VisitController : ControllerBase
{
    private readonly IMediator _mediator;
    public VisitController(IMediator mediator)
    {
        _mediator=mediator;
    }
    [HttpPost]
    public async Task<IActionResult>Create([FromBody] CreateVisitCommand request)
    {
        var visit= await _mediator.Send(request);
        return Ok(visit);
    }
    [HttpGet("{id:int}")]
    public async Task<IActionResult>GetByIdAsync(int id)
    {
        var visit=await _mediator.Send(new GetVisitByIdQuery(id));
        if (visit==null) return NotFound();
        return Ok(visit);
    }
    [HttpGet("{Date:datetime}")]
    public async Task<IActionResult>GetByDateAsync(DateTime Date)
    {
        var visit= await _mediator.Send(new GetByDateVisitQuery(Date));
            return Ok(visit);
        }
        [HttpGet]
        public async Task<IActionResult> GetAllAsync()
    {
        var visit=await _mediator.Send(new GetAllVisitQuery());
        return Ok(visit);
    }
    [HttpDelete]
    public async Task<IActionResult>DeleteAsync(int id)
    {
        var visit=await _mediator.Send(new DeleteVisitCommand(id));
        if(visit==null) return NotFound("Aucune Visit Trouver");
        return Ok(visit);
    }
    [HttpPut]
    public async Task<IActionResult>UpdateAsync( [FromBody] UpdateVisitCommand request)
    {
        await _mediator.Send(request);
        return NoContent();
    }
     [HttpGet("count_by_service")]
    public async Task<IActionResult> GetVisitCountByService()
    {
        var service=await _mediator.Send(new GetVisitCountByServiceStatutQuery());
        return Ok(service);
    }
     [HttpGet("deleted")]
    public async Task<IActionResult> GetDeletedAsync()
    {
        // Nécessite une nouvelle Query : GetAllDeletedUsersQuery
        var users = await _mediator.Send(new GetDeletedVisiteQuery());
        return Ok(users);
    }

    [HttpGet("deleted/{id:int}")]
    public async Task<IActionResult> GetDeletedByIdAsync(int id)
    {
        // Nécessite une nouvelle Query : GetDeletedUserByIdQuery
        var user = await _mediator.Send(new GetDeletedByIdVisiteQuery(id));
        if (user == null) return NotFound();
        return Ok(user);
    }

    [HttpPost("restore/{id:int}")]
    public async Task<IActionResult> RestoreAsync(int id)
    {
        // Nécessite une nouvelle Commande : RestoreUserCommand
        var result = await _mediator.Send(new RestoreVisiteCommand(id));
        return Ok(new { RestoredId = result });
    }
    [HttpPatch("{id}/status")] // On utilise Patch car on ne modifie qu'une partie de la donnée
[HttpPatch("{id}/status")]
public async Task<IActionResult> UpdateStatus(int id, [FromBody] int newStatus)
{
    // On crée une commande spécifique pour le changement de statut
    // Tu devras créer cette classe "UpdateVisitStatusCommand" dans ton dossier Features
    var result = await _mediator.Send(new UpdateVisitStatusCommand(id, newStatus));
    
    if (!result) return NotFound("Visite introuvable");
    
    return Ok(new { message = "Statut mis à jour avec succès" });
}
[HttpGet("details")]
public async Task<IActionResult> GetDetails()
{
    var query = new GetVisitsWithDetailsQuery();
    var result = await _mediator.Send(query);
    return Ok(result);
}
}
    
