using Dapper;
using Microsoft.Data.SqlClient; // Ou ton provider SQL
using CleanVisitor.Application.Features.Dashboard.Interfaces;
using CleanVisitor.Application.DTOs.Dashboard;
using Microsoft.Extensions.Configuration;

namespace CleanVisitor.Infrastructure.Repositories;

public class DashboardRepository : IDashboardRepository
{
    private readonly string _connectionString;

    public DashboardRepository(IConfiguration configuration)
    {
        _connectionString = configuration.GetConnectionString("DefaultConnection");
    }

   public async Task<DashboardStatsDto> GetGlobalStatsAsync()
{
    using var connection = new SqlConnection(_connectionString);

    // Utilisation des noms exacts : [Date], [Statut], [IdVisitor] et la table [Visit]
    const string sql = @"
        SELECT 
            -- Statistiques des Visites (basées sur la colonne [Date])
            COUNT(CASE WHEN CAST([Date] AS DATE) = CAST(GETDATE() AS DATE) THEN 1 END) as VisitDay,
            COUNT(CASE WHEN MONTH([Date]) = MONTH(GETDATE()) AND YEAR([Date]) = YEAR(GETDATE()) THEN 1 END) as VisitMonth,
            COUNT(CASE WHEN YEAR([Date]) = YEAR(GETDATE()) THEN 1 END) as VisitYear,
            
            -- Statistiques des Visiteurs Uniques (basées sur [IdVisitor])
            COUNT(DISTINCT CASE WHEN CAST([Date] AS DATE) = CAST(GETDATE() AS DATE) THEN [IdVisitor] END) as VisitorDay,
            COUNT(DISTINCT CASE WHEN MONTH([Date]) = MONTH(GETDATE()) AND YEAR([Date]) = YEAR(GETDATE()) THEN [IdVisitor] END) as VisitorMonth,
            COUNT(DISTINCT CASE WHEN YEAR([Date]) = YEAR(GETDATE()) THEN [IdVisitor] END) as VisitorYear,
            
            -- Visites en attente (Statut = 0 ou selon ta logique)
            COUNT(CASE WHEN [Statut] = 0 THEN 1 END) as Pending
        FROM [Visit]"; 

    var result = await connection.QuerySingleAsync<dynamic>(sql);

    return new DashboardStatsDto
    {
        Visits = new VisitStatsDto { 
            Day = (int)(result.VisitDay ?? 0), 
            Month = (int)(result.VisitMonth ?? 0), 
            Year = (int)(result.VisitYear ?? 0) 
        },
        Visitors = new VisitorStatsDto { 
            Day = (int)(result.VisitorDay ?? 0), 
            Month = (int)(result.VisitorMonth ?? 0), 
            Year = (int)(result.VisitorYear ?? 0) 
        },
        Pending = (int)(result.Pending ?? 0)
    };
}
}