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
    [HttpPut("{id}")]
    public async Task<IActionResult>UpdateAsync(int id, [FromBody] UpdateVisitCommand request)
    {
    if (id != request.Id)
        {
            return BadRequest("L'ID Que Vous Demander Est Introuvable");
        }
        await _mediator.Send(request);
        return NoContent();
    }
     [HttpGet("count_by_service")]
    public async Task<IActionResult> GetVisitCountByService()
    {
        var service=await _mediator.Send(new GetVisitCountByServiceStatutQuery());
        return Ok(service);
    }
    }
