using Dapper;
using System.Data;
using CleanVisitor.Infrastructure.Data;
using CleanVisitor.Application.Features.Dashboard.Interfaces;
using CleanVisitor.Application.DTOs.Dashboard;

namespace CleanVisitor.Infrastructure.Repositories;

public class DashboardRepository : IDashboardRepository
{
    private readonly DbContext _dbContext;

    public DashboardRepository(DbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<DashboardStatsDto> GetGlobalStatsAsync()
    {
        using IDbConnection connection = _dbContext.CreateConnection();

        // 1. Syntaxe SQL Server
        const string sqlServerQuery = @"
            SELECT 
                COUNT(CASE WHEN CAST([Date] AS DATE) = CAST(GETDATE() AS DATE) THEN 1 END) as VisitDay,
                COUNT(CASE WHEN MONTH([Date]) = MONTH(GETDATE()) AND YEAR([Date]) = YEAR(GETDATE()) THEN 1 END) as VisitMonth,
                COUNT(CASE WHEN YEAR([Date]) = YEAR(GETDATE()) THEN 1 END) as VisitYear,
                
                COUNT(DISTINCT CASE WHEN CAST([Date] AS DATE) = CAST(GETDATE() AS DATE) THEN [IdVisitor] END) as VisitorDay,
                COUNT(DISTINCT CASE WHEN MONTH([Date]) = MONTH(GETDATE()) AND YEAR([Date]) = YEAR(GETDATE()) THEN [IdVisitor] END) as VisitorMonth,
                COUNT(DISTINCT CASE WHEN YEAR([Date]) = YEAR(GETDATE()) THEN [IdVisitor] END) as VisitorYear,
                
                COUNT(CASE WHEN [Statut] = 0 THEN 1 END) as Pending
            FROM [Visit]";

        // 2. Syntaxe PostgreSQL (Supabase)
        const string postgresQuery = @"
            SELECT 
                COUNT(CASE WHEN ""Date""::date = CURRENT_DATE THEN 1 END) as VisitDay,
                COUNT(CASE WHEN EXTRACT(MONTH FROM ""Date"") = EXTRACT(MONTH FROM CURRENT_DATE) 
                            AND EXTRACT(YEAR FROM ""Date"") = EXTRACT(YEAR FROM CURRENT_DATE) THEN 1 END) as VisitMonth,
                COUNT(CASE WHEN EXTRACT(YEAR FROM ""Date"") = EXTRACT(YEAR FROM CURRENT_DATE) THEN 1 END) as VisitYear,
                
                COUNT(DISTINCT CASE WHEN ""Date""::date = CURRENT_DATE THEN ""IdVisitor"" END) as VisitorDay,
                COUNT(DISTINCT CASE WHEN EXTRACT(MONTH FROM ""Date"") = EXTRACT(MONTH FROM CURRENT_DATE) 
                                    AND EXTRACT(YEAR FROM ""Date"") = EXTRACT(YEAR FROM CURRENT_DATE) THEN ""IdVisitor"" END) as VisitorMonth,
                COUNT(DISTINCT CASE WHEN EXTRACT(YEAR FROM ""Date"") = EXTRACT(YEAR FROM CURRENT_DATE) THEN ""IdVisitor"" END) as VisitorYear,
                
                COUNT(CASE WHEN ""Statut"" = 0 THEN 1 END) as Pending
            FROM ""Visit""";

        // Sélection dynamique de la requête selon le SGBD
        string sql = _dbContext.SelectQuery(sqlServerQuery, postgresQuery);

        var result = await connection.QuerySingleAsync<dynamic>(sql);

        return new DashboardStatsDto
        {
            Visits = new VisitStatsDto { 
                Day = Convert.ToInt32(result.VisitDay ?? 0), 
                Month = Convert.ToInt32(result.VisitMonth ?? 0), 
                Year = Convert.ToInt32(result.VisitYear ?? 0) 
            },
            Visitors = new VisitorStatsDto { 
                Day = Convert.ToInt32(result.VisitorDay ?? 0), 
                Month = Convert.ToInt32(result.VisitorMonth ?? 0), 
                Year = Convert.ToInt32(result.VisitorYear ?? 0) 
            },
            Pending = Convert.ToInt32(result.Pending ?? 0)
        };
    }
}