using CleanVisitor.Application.DTOs.Dashboard;

namespace CleanVisitor.Application.Features.Dashboard.Interfaces;

public interface IDashboardRepository
{
    // Une seule méthode qui récupère tout d'un coup pour optimiser les appels SQL
    Task<DashboardStatsDto> GetGlobalStatsAsync();
}