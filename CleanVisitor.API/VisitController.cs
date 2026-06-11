using System.Data;
using Microsoft.AspNetCore.Mvc;
using MediatR;
using CleanVisitor.Core.Entities.Visits;
using CleanVisitor.Core.Entities.Notification;
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
using CleanVisitor.Application.Features.Visite.Querries.GetUserVisits;
using Microsoft.AspNetCore.SignalR;
using CleanVisitor.Application.Features.Visite.Interfaces;
using CleanVisitor.Api.Hubs;
using CleanVisitor.Application.Features.Visite.Dtos;
[ApiController]
[Route("api/[controller]")]
public class VisitController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly IHubContext<VisitHub> _hubContext;
    private readonly IConfiguration _configuration;
    private readonly IEmailService _emailService;
    public VisitController(IMediator mediator, IHubContext<VisitHub> hubContext, IConfiguration configuration, IEmailService emailService)
    {
        _mediator=mediator;
        _hubContext = hubContext;
        _configuration = configuration;
        _emailService=emailService;
    }
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateVisitCommand request)
    {
        // 1. Création de la visite via MediatR
        var visit = await _mediator.Send(request);

        await _hubContext.Clients.All.SendAsync("ReceiveNewVisit", visit);

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
public async Task<IActionResult> UpdateVisit([FromBody] UpdateVisitCommand command) 
{
    // On envoie tout au Handler (Id, Date, Heure, Motif, Statut, etc.)
    var result = await _mediator.Send(command);
    
    if (result == null) return NotFound("Visite introuvable");

    // Notification en temps réel via SignalR si nécessaire
    await _hubContext.Clients.All.SendAsync("VisitUpdated", result);

    return Ok(result);
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
// On utilise Patch car on ne modifie qu'une partie de la donnée
public record UpdateStatusRequest(int Statut);
[HttpPatch("{id}/status")]
public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateStatusRequest request)
{
    // On utilise request.Statut pour récupérer la valeur 2 (Terminé)
    var result = await _mediator.Send(new UpdateVisitStatusCommand(id, request.Statut));
    
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
[HttpGet("user/{userId}")] // Ceci s'ajoute à la route de base
    public async Task<IActionResult> GetMyVisits(int userId)
    {
        var query = new GetUserVisitsQuery(userId);
        var result = await _mediator.Send(query);
        return Ok(result);
    }
}