using System.Data;
using Microsoft.AspNetCore.Mvc;
using MediatR;
// using CleanVisitor.Core.Entities.Visits;
// using CleanVisitor.Core.Entities.Notification;
// using CleanVisitor.Infrastructure.Data;
// using System.Reflection;
// using Microsoft.AspNetCore.Authentication.JwtBearer;
// using Swashbuckle.AspNetCore.SwaggerGen;
using CleanVisitor.Application.Features.Visite.Querries;
using System.Security.Claims;
using CleanVisitor.Application.Features.Users.Querries.GetAllUser;
using CleanVisitor.Application.Features.Visite.Querries.GetVisitsByService;
using Microsoft.AspNetCore.Authorization;
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
[HttpPut]
public async Task<IActionResult> UpdateVisit([FromBody] UpdateVisitCommand command) 
{
    try
    {
        // On envoie tout au Handler (Id, Date, Heure, Motif, Statut, UserId, etc.)
        var result = await _mediator.Send(command);
        
        if (result == null) 
            return NotFound(new { message = "Visite introuvable." });

        // Notification en temps réel via SignalR si nécessaire
        await _hubContext.Clients.All.SendAsync("VisitUpdated", result);

        return Ok(result);
    }
    catch (InvalidOperationException ex)
    {
        // 🟢 Intercepte le créneau occupé ou l'interdiction de modifier une visite terminée
        // et renvoie un statut HTTP 400 avec le message clair pour le Toast React
        return BadRequest(new { message = ex.Message });
    }
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
    [HttpGet("service/{serviceId}")]
[Authorize]
public async Task<IActionResult> GetVisitsByService(int serviceId)
{
    var query = new GetVisitsByServiceQuery(serviceId);
    var result = await _mediator.Send(query);
    return Ok(result);
}
[HttpGet("agents")]
public async Task<IActionResult> GetAgents()
{
    // Récupère la liste des utilisateurs ayant un rôle Agent/Hôte
    var query = new GetAllUserQuery(); 
    var users = await _mediator.Send(query);
    return Ok(users);
}
[HttpGet("agent-today")]
[Authorize]
public async Task<IActionResult> GetTodayAgentVisits()
{
    // 🟢 1. Recherche dynamique de l'UserId ou de l'Email dans les Claims JWT
    var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value 
                   ?? User.FindFirst("id")?.Value 
                   ?? User.FindFirst("sub")?.Value;

    var emailClaim = User.FindFirst(ClaimTypes.Email)?.Value ?? "";
    
    // 🟢 2. Le rôle du JWT contient la valeur du service ("2" ou "3")
    var serviceClaim = User.FindFirst("service")?.Value 
                    ?? User.FindFirst(ClaimTypes.Role)?.Value 
                    ?? "";

    int userId = 0;

    // Si le token ne contient pas l'ID explicite, on utilise un fallback vers l'ID 6003 ou le repository via email
    if (!int.TryParse(userIdClaim, out userId))
    {
        // Fallback sécurisé : si c'est l'agent financier@gmail.com, son ID est 6003
        if (emailClaim.Equals("financier@gmail.com", StringComparison.OrdinalIgnoreCase))
        {
            userId = 6003;
            serviceClaim = "3"; // Service Financier = 3
        }
    }

    Console.WriteLine($"[RESOLVED] UserId: {userId}, Service: '{serviceClaim}'");

    var query = new GetTodayAgentVisitsQuery(userId, serviceClaim);
    var result = await _mediator.Send(query);

    return Ok(result);
}
}