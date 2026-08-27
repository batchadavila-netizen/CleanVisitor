using CleanVisitor.Application.Features.SystemConfigs.Dtos;
using Application.Features.SystemConfigs.Commands;
using Application.Features.SystemConfig.Queries;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace WebAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SystemConfigController : ControllerBase
    {
        private readonly IMediator _mediator;

        public SystemConfigController(IMediator mediator)
        {
            _mediator = mediator;
        }

        /// <summary>
        /// Récupère la configuration globale (Nom entreprise, services, durées)
        /// GET: api/settings
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<SystemConfigDto>> GetSettings()
        {
            var result = await _mediator.Send(new GetSystemConfigQuery());
            return Ok(result);
        }

        /// <summary>
        /// Met à jour la configuration globale
        /// PUT: api/settings
        /// </summary>
        [HttpPut]
        public async Task<ActionResult<SystemConfigDto>> UpdateSettings([FromBody] SystemConfigDto dto)
        {
            var result = await _mediator.Send(new UpdateSystemConfigCommand(dto));
            return Ok(result);
        }
    }
}