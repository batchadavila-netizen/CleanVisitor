using Microsoft.AspNetCore.Mvc;
using MediatR;
using System.Security.Claims;
using CleanVisitor.Core.Entities.User;
using CleanVisitor.Application.Features.Dashboard.Interfaces;


[ApiController]
[Route("api/[controller]")]
public class DashboardController : ControllerBase
{
    private readonly IDashboardRepository _dashboardRepo;

    public DashboardController(IDashboardRepository dashboardRepo)
    {
        _dashboardRepo = dashboardRepo;
    }

    [HttpGet("stats")]
    public async Task<IActionResult> GetStats()
    {
        var stats = await _dashboardRepo.GetGlobalStatsAsync();
        return Ok(stats);
    }
}