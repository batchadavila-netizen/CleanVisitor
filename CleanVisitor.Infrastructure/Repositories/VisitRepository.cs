using System.Data;
using Dapper;
using CleanVisitor.Application.Features.Visite.Interfaces;
using CleanVisitor.Application.Features.Visite.Dtos.ServiceDto;
using CleanVisitor.Application.Features.Visite.Dtos;
using CleanVisitor.Core.Entities.Visits;
using CleanVisitor.Core.Entities;
using CleanVisitor.Infrastructure.Data;

namespace CleanVisitor.Infrastructure.Repositories;

public class VisitRepository : IVisitRepository
{
    private readonly DbContext _dbContext;

    public VisitRepository(DbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<VisitDto> AddAsync(Visit visit)
    {
        using IDbConnection connection = _dbContext.CreateConnection();

        // SQL Server
        const string sqlSqlServer = @"
            INSERT INTO [Visit] (Motif, Date, HeureDepart, HeureArriver, Statut, Service, IdVisitor, IsDeleted, UserId, AccessCode) 
            VALUES (@Motif, @Date, @HeureDepart, @HeureArriver, @Statut, @Service, @IdVisitor, 0, @UserId, @AccessCode);
            
            DECLARE @NewId INT = SCOPE_IDENTITY();

            SELECT 
                v.Id AS Id, v.Motif AS Motif, v.Date AS Date, v.HeureDepart AS HeureDepart, 
                v.HeureArriver AS HeureArriver, v.Statut AS Statut, v.Service AS Service,
                v.IdVisitor AS IdVisitor, v.UserId AS UserId, v.AccessCode AS AccessCode,
                vt.Nom AS Nom_visitor, vt.Email AS Email_visitor,
                u.Nom AS Nom_Host, u.Prenom AS Prenom_Host
            FROM [Visit] v
            LEFT JOIN [User] vt ON v.IdVisitor = vt.Id
            LEFT JOIN [User] u ON v.UserId = u.Id
            WHERE v.Id = @NewId;";

        // PostgreSQL (Supabase)
        const string sqlPostgres = @"
            WITH new_visit AS (
                INSERT INTO ""Visit"" (""Motif"", ""Date"", ""HeureDepart"", ""HeureArriver"", ""Statut"", ""Service"", ""IdVisitor"", ""IsDeleted"", ""UserId"", ""AccessCode"") 
                VALUES (@Motif, @Date, @HeureDepart, @HeureArriver, @Statut, @Service, @IdVisitor, FALSE, @UserId, @AccessCode)
                RETURNING *
            )
            SELECT 
                v.""Id"" AS Id, v.""Motif"" AS Motif, v.""Date"" AS Date, v.""HeureDepart"" AS HeureDepart, 
                v.""HeureArriver"" AS HeureArriver, v.""Statut"" AS Statut, v.""Service"" AS Service,
                v.""IdVisitor"" AS IdVisitor, v.""UserId"" AS UserId, v.""AccessCode"" AS AccessCode,
                vt.""Nom"" AS Nom_visitor, vt.""Email"" AS Email_visitor,
                u.""Nom"" AS Nom_Host, u.""Prenom"" AS Prenom_Host
            FROM new_visit v
            LEFT JOIN ""User"" vt ON v.""IdVisitor"" = vt.""Id""
            LEFT JOIN ""User"" u ON v.""UserId"" = u.""Id"";";

        string sql = _dbContext.SelectQuery(sqlSqlServer, sqlPostgres);

        var result = await connection.QueryFirstOrDefaultAsync<VisitDto>(sql, new 
        {
            Motif = visit.Motif,
            Date = visit.Date,
            HeureDepart = visit.HeureDepart,
            HeureArriver = visit.HeureArriver,
            Statut = (int)visit.Statut,
            Service = (int)visit.Service,
            IdVisitor = visit.IdVisitor,
            UserId = visit.UserId,
            AccessCode = visit.AccessCode
        });

        return result ?? throw new InvalidOperationException("Échec de la récupération de la visite enregistrée.");
    }

    public async Task<VisitDto?> UpdateAsync(Visit visit)
    {
        using IDbConnection connection = _dbContext.CreateConnection();

        const string sqlSqlServer = @"
            UPDATE [Visit] 
            SET Motif = @Motif, Date = @Date, HeureDepart = @HeureDepart, HeureArriver = @HeureArriver, 
                Statut = @Statut, Service = @Service, UserId = @UserId
            WHERE Id = @Id;

            SELECT 
                v.Id AS Id, v.Motif AS Motif, v.Date AS Date, v.HeureDepart AS HeureDepart, 
                v.HeureArriver AS HeureArriver, v.Statut AS Statut, v.Service AS Service,
                v.IdVisitor AS IdVisitor, v.UserId AS UserId, v.AccessCode AS AccessCode,
                vt.Nom AS Nom_visitor, vt.Email AS Email_visitor,
                u.Nom AS Nom_Host, u.Prenom AS Prenom_Host
            FROM [Visit] v
            LEFT JOIN [User] vt ON v.IdVisitor = vt.Id
            LEFT JOIN [User] u ON v.UserId = u.Id
            WHERE v.Id = @Id;";

        const string sqlPostgres = @"
            UPDATE ""Visit"" 
            SET ""Motif"" = @Motif, ""Date"" = @Date, ""HeureDepart"" = @HeureDepart, ""HeureArriver"" = @HeureArriver, 
                ""Statut"" = @Statut, ""Service"" = @Service, ""UserId"" = @UserId
            WHERE ""Id"" = @Id;

            SELECT 
                v.""Id"" AS Id, v.""Motif"" AS Motif, v.""Date"" AS Date, v.""HeureDepart"" AS HeureDepart, 
                v.""HeureArriver"" AS HeureArriver, v.""Statut"" AS Statut, v.""Service"" AS Service,
                v.""IdVisitor"" AS IdVisitor, v.""UserId"" AS UserId, v.""AccessCode"" AS AccessCode,
                vt.""Nom"" AS Nom_visitor, vt.""Email"" AS Email_visitor,
                u.""Nom"" AS Nom_Host, u.""Prenom"" AS Prenom_Host
            FROM ""Visit"" v
            LEFT JOIN ""User"" vt ON v.""IdVisitor"" = vt.""Id""
            LEFT JOIN ""User"" u ON v.""UserId"" = u.""Id""
            WHERE v.""Id"" = @Id;";

        string sql = _dbContext.SelectQuery(sqlSqlServer, sqlPostgres);

        return await connection.QueryFirstOrDefaultAsync<VisitDto>(sql, visit);
    }

    public async Task<VisitDto?> GetByIdAsync(int id)
    {
        using IDbConnection connection = _dbContext.CreateConnection();

        const string sqlSqlServer = @"
            SELECT 
                v.Id AS Id, v.Motif AS Motif, v.Date AS Date, v.HeureDepart AS HeureDepart, 
                v.HeureArriver AS HeureArriver, v.Statut AS Statut, v.Service AS Service,
                v.IdVisitor AS IdVisitor, v.UserId AS UserId, v.AccessCode AS AccessCode,
                vt.Nom AS Nom_visitor, vt.Email AS Email_visitor,
                u.Nom AS Nom_Host, u.Prenom AS Prenom_Host
            FROM [Visit] v
            LEFT JOIN [User] vt ON v.IdVisitor = vt.Id
            LEFT JOIN [User] u ON v.UserId = u.Id
            WHERE v.Id = @Id AND v.IsDeleted = 0";

        const string sqlPostgres = @"
            SELECT 
                v.""Id"" AS Id, v.""Motif"" AS Motif, v.""Date"" AS Date, v.""HeureDepart"" AS HeureDepart, 
                v.""HeureArriver"" AS HeureArriver, v.""Statut"" AS Statut, v.""Service"" AS Service,
                v.""IdVisitor"" AS IdVisitor, v.""UserId"" AS UserId, v.""AccessCode"" AS AccessCode,
                vt.""Nom"" AS Nom_visitor, vt.""Email"" AS Email_visitor,
                u.""Nom"" AS Nom_Host, u.""Prenom"" AS Prenom_Host
            FROM ""Visit"" v
            LEFT JOIN ""User"" vt ON v.""IdVisitor"" = vt.""Id""
            LEFT JOIN ""User"" u ON v.""UserId"" = u.""Id""
            WHERE v.""Id"" = @Id AND v.""IsDeleted"" = FALSE";

        string sql = _dbContext.SelectQuery(sqlSqlServer, sqlPostgres);

        return await connection.QueryFirstOrDefaultAsync<VisitDto>(sql, new { Id = id });
    }

    public async Task<List<VisitDto?>> GetAllAsync()
    {
        using IDbConnection connection = _dbContext.CreateConnection();

        const string sqlSqlServer = @"
            SELECT 
                v.Id AS Id, v.Motif AS Motif, v.Date AS Date, v.HeureDepart AS HeureDepart, 
                v.HeureArriver AS HeureArriver, v.Statut AS Statut, v.Service AS Service,
                v.IdVisitor AS IdVisitor, v.UserId AS UserId, v.AccessCode AS AccessCode,
                vt.Nom AS Nom_visitor, vt.Email AS Email_visitor,
                u.Nom AS Nom_Host, u.Prenom AS Prenom_Host
            FROM [Visit] v
            LEFT JOIN [User] vt ON v.IdVisitor = vt.Id
            LEFT JOIN [User] u ON v.UserId = u.Id
            WHERE v.IsDeleted = 0
            ORDER BY v.Date DESC, v.HeureArriver DESC";

        const string sqlPostgres = @"
            SELECT 
                v.""Id"" AS Id, v.""Motif"" AS Motif, v.""Date"" AS Date, v.""HeureDepart"" AS HeureDepart, 
                v.""HeureArriver"" AS HeureArriver, v.""Statut"" AS Statut, v.""Service"" AS Service,
                v.""IdVisitor"" AS IdVisitor, v.""UserId"" AS UserId, v.""AccessCode"" AS AccessCode,
                vt.""Nom"" AS Nom_visitor, vt.""Email"" AS Email_visitor,
                u.""Nom"" AS Nom_Host, u.""Prenom"" AS Prenom_Host
            FROM ""Visit"" v
            LEFT JOIN ""User"" vt ON v.""IdVisitor"" = vt.""Id""
            LEFT JOIN ""User"" u ON v.""UserId"" = u.""Id""
            WHERE v.""IsDeleted"" = FALSE
            ORDER BY v.""Date"" DESC, v.""HeureArriver"" DESC";

        string sql = _dbContext.SelectQuery(sqlSqlServer, sqlPostgres);

        var visits = await connection.QueryAsync<VisitDto>(sql);
        return visits.ToList()!;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        using IDbConnection connection = _dbContext.CreateConnection();

        const string sqlSqlServer = @"UPDATE [Visit] SET IsDeleted = 1, DeletedAt = GETDATE() WHERE Id = @Id";
        const string sqlPostgres = @"UPDATE ""Visit"" SET ""IsDeleted"" = TRUE, ""DeletedAt"" = CURRENT_TIMESTAMP WHERE ""Id"" = @Id";

        string sql = _dbContext.SelectQuery(sqlSqlServer, sqlPostgres);

        await connection.ExecuteAsync(sql, new { Id = id });
        return true;
    }

    public async Task<VisitDto?> GetByDateAsync(DateTime date)
    {
        using IDbConnection connection = _dbContext.CreateConnection();

        const string sqlSqlServer = @"SELECT * FROM [Visit] WHERE Date = @Date";
        const string sqlPostgres = @"SELECT * FROM ""Visit"" WHERE ""Date"" = @Date";

        string sql = _dbContext.SelectQuery(sqlSqlServer, sqlPostgres);

        return await connection.QueryFirstOrDefaultAsync<VisitDto>(sql, new { Date = date });
    }

    public async Task<List<ServiceDto>> GetVisitCountByServiceStatutAsync()
    {
        using IDbConnection connection = _dbContext.CreateConnection();

        const string sqlSqlServer = @"SELECT Service AS Service, Statut AS Statut, COUNT(*) AS Total_visit FROM [Visit] GROUP BY Service, Statut";
        const string sqlPostgres = @"SELECT ""Service"" AS Service, ""Statut"" AS Statut, COUNT(*) AS Total_visit FROM ""Visit"" GROUP BY ""Service"", ""Statut""";

        string sql = _dbContext.SelectQuery(sqlSqlServer, sqlPostgres);

        var service = await connection.QueryAsync<ServiceDto>(sql);
        return service.ToList();
    }

    public async Task<List<VisitDto>> GetDeletedAsync()
    {
        using IDbConnection connection = _dbContext.CreateConnection();

        const string sqlSqlServer = @"SELECT * FROM [Visit] WHERE IsDeleted = 1";
        const string sqlPostgres = @"SELECT * FROM ""Visit"" WHERE ""IsDeleted"" = TRUE";

        string sql = _dbContext.SelectQuery(sqlSqlServer, sqlPostgres);

        var visits = await connection.QueryAsync<VisitDto>(sql);
        return visits.ToList();
    }

    public async Task<int> RestoreAsync(int id)
    {
        using IDbConnection connection = _dbContext.CreateConnection();

        const string sqlSqlServer = @"UPDATE [Visit] SET IsDeleted = 0, DeletedAt = NULL OUTPUT inserted.Id WHERE Id = @Id AND IsDeleted = 1";
        const string sqlPostgres = @"UPDATE ""Visit"" SET ""IsDeleted"" = FALSE, ""DeletedAt"" = NULL WHERE ""Id"" = @Id AND ""IsDeleted"" = TRUE RETURNING ""Id""";

        string sql = _dbContext.SelectQuery(sqlSqlServer, sqlPostgres);

        return await connection.QueryFirstOrDefaultAsync<int>(sql, new { Id = id });
    }

    public async Task<VisitDto?> GetDeletedByIdAsync(int id)
    {
        using IDbConnection connection = _dbContext.CreateConnection();

        const string sqlSqlServer = @"SELECT * FROM [Visit] WHERE Id = @Id AND IsDeleted = 1";
        const string sqlPostgres = @"SELECT * FROM ""Visit"" WHERE ""Id"" = @Id AND ""IsDeleted"" = TRUE";

        string sql = _dbContext.SelectQuery(sqlSqlServer, sqlPostgres);

        return await connection.QueryFirstOrDefaultAsync<VisitDto>(sql, new { Id = id });
    }

    public async Task<bool> UpdateStatusAsync(int id, int newStatus)
    {
        using IDbConnection connection = _dbContext.CreateConnection();

        const string sqlSqlServer = @"UPDATE [Visit] SET Statut = @Statut WHERE Id = @Id";
        const string sqlPostgres = @"UPDATE ""Visit"" SET ""Statut"" = @Statut WHERE ""Id"" = @Id";

        string sql = _dbContext.SelectQuery(sqlSqlServer, sqlPostgres);

        var rowsAffected = await connection.ExecuteAsync(sql, new { Statut = newStatus, Id = id });
        return rowsAffected > 0;
    }

    public async Task<IEnumerable<VisitDetailsDto>> GetAllVisitsWithDetailsAsync()
    {
        using IDbConnection connection = _dbContext.CreateConnection();

        const string sqlSqlServer = @"
            SELECT 
                v.Id, v.Motif, v.Service, v.Statut, v.HeureArriver, v.IdVisitor,
                vt.Nom, vt.Email 
            FROM [Visit] v 
            INNER JOIN [Visitors] vt ON v.IdVisitor = vt.Id
            WHERE v.IsDeleted = 0";

        const string sqlPostgres = @"
            SELECT 
                v.""Id"", v.""Motif"", v.""Service"", v.""Statut"", v.""HeureArriver"", v.""IdVisitor"",
                vt.""Nom"", vt.""Email"" 
            FROM ""Visit"" v 
            INNER JOIN ""Visitors"" vt ON v.""IdVisitor"" = vt.""Id""
            WHERE v.""IsDeleted"" = FALSE";

        string sql = _dbContext.SelectQuery(sqlSqlServer, sqlPostgres);

        return await connection.QueryAsync<VisitDetailsDto>(sql);
    }

    public async Task<List<VisitDto>> GetUserVisitsAsync(int userId)
    {
        using IDbConnection connection = _dbContext.CreateConnection();

        const string sqlSqlServer = @"
            SELECT 
                v.Id, v.Motif, v.Date, v.HeureArriver, v.HeureDepart, v.Statut, v.Service,
                v.IdVisitor, v.UserId, v.AccessCode,
                vt.Nom AS Nom_visitor, vt.Email AS Email_visitor,
                uHost.Nom AS Nom_Host, uHost.Prenom AS Prenom_Host
            FROM [Visit] v
            LEFT JOIN [User] vt ON v.IdVisitor = vt.Id
            LEFT JOIN [User] uHost ON v.UserId = uHost.Id
            WHERE v.IdVisitor = @UserId AND v.IsDeleted = 0
            ORDER BY v.Date DESC, v.HeureArriver DESC";

        const string sqlPostgres = @"
            SELECT 
                v.""Id"", v.""Motif"", v.""Date"", v.""HeureArriver"", v.""HeureDepart"", v.""Statut"", v.""Service"",
                v.""IdVisitor"", v.""UserId"", v.""AccessCode"",
                vt.""Nom"" AS Nom_visitor, vt.""Email"" AS Email_visitor,
                uHost.""Nom"" AS Nom_Host, uHost.""Prenom"" AS Prenom_Host
            FROM ""Visit"" v
            LEFT JOIN ""User"" vt ON v.""IdVisitor"" = vt.""Id""
            LEFT JOIN ""User"" uHost ON v.""UserId"" = uHost.""Id""
            WHERE v.""IdVisitor"" = @UserId AND v.""IsDeleted"" = FALSE
            ORDER BY v.""Date"" DESC, v.""HeureArriver"" DESC";

        string sql = _dbContext.SelectQuery(sqlSqlServer, sqlPostgres);

        var result = await connection.QueryAsync<VisitDto>(sql, new { UserId = userId });
        return result.ToList();
    }

    public async Task<List<VisitDto>> GetByServiceAsync(int serviceId)
    {
        using IDbConnection connection = _dbContext.CreateConnection();

        const string sqlSqlServer = @"
            SELECT 
                v.Id, v.Motif, v.Date, v.HeureArriver, v.HeureDepart, v.Statut, 
                v.Service, v.IdVisitor, v.UserId,
                vt.Nom AS Nom_visitor, vt.Email AS Email_visitor,
                u.Nom AS Nom_Host, u.Prenom AS Prenom_Host
            FROM [Visit] v
            LEFT JOIN [User] vt ON v.IdVisitor = vt.Id
            LEFT JOIN [User] u ON v.UserId = u.Id
            WHERE (v.Service = @ServiceId OR v.Service = CAST(@ServiceId AS VARCHAR)) 
              AND v.IsDeleted = 0
              AND (v.Statut = 1 OR v.Statut = 2)";

        const string sqlPostgres = @"
            SELECT 
                v.""Id"", v.""Motif"", v.""Date"", v.""HeureArriver"", v.""HeureDepart"", v.""Statut"", 
                v.""Service"", v.""IdVisitor"", v.""UserId"",
                vt.""Nom"" AS Nom_visitor, vt.""Email"" AS Email_visitor,
                u.""Nom"" AS Nom_Host, u.""Prenom"" AS Prenom_Host
            FROM ""Visit"" v
            LEFT JOIN ""User"" vt ON v.""IdVisitor"" = vt.""Id""
            LEFT JOIN ""User"" u ON v.""UserId"" = u.""Id""
            WHERE (v.""Service"" = @ServiceId OR v.""Service""::text = @ServiceId::text) 
              AND v.""IsDeleted"" = FALSE
              AND (v.""Statut"" = 1 OR v.""Statut"" = 2)";

        string sql = _dbContext.SelectQuery(sqlSqlServer, sqlPostgres);

        var visits = await connection.QueryAsync<VisitDto>(sql, new { ServiceId = serviceId });
        return visits.ToList();
    }

    public async Task<IEnumerable<(Visit visit, Visitor visitor)>> GetTodayVisitsByAgentOrServiceAsync(int userId, string service)
    {
        string serviceId = (service ?? "").Trim() switch
        {
            "Service Financier" or "Service_Financier" => "3",
            "Service RH" or "Service_RH" => "2",
            "Service Informatique" or "Service_Informatique" => "4",
            "Direction" => "1",
            "Secrétariat" => "5",
            _ => service
        };

        using IDbConnection connection = _dbContext.CreateConnection();

        const string sqlSqlServer = @"
            SELECT 
                v.Id, v.Motif, v.Date, v.HeureArriver, v.HeureDepart, v.Statut, 
                v.Service, v.UserId, v.IdVisitor, v.AccessCode,
                vis.Id AS VisitorId, vis.Nom, vis.Email, vis.Telephone
            FROM [Visit] v
            LEFT JOIN [Visitors] vis ON v.IdVisitor = vis.Id
            WHERE (v.UserId = @UserId OR CAST(v.Service AS VARCHAR) = @ServiceId OR CAST(v.Service AS VARCHAR) = @Service)
              AND CAST(v.Date AS DATE) = CAST(GETDATE() AS DATE)
            ORDER BY v.HeureArriver ASC";

        const string sqlPostgres = @"
            SELECT 
                v.""Id"", v.""Motif"", v.""Date"", v.""HeureArriver"", v.""HeureDepart"", v.""Statut"", 
                v.""Service"", v.""UserId"", v.""IdVisitor"", v.""AccessCode"",
                vis.""Id"" AS VisitorId, vis.""Nom"", vis.""Email"", vis.""Telephone""
            FROM ""Visit"" v
            LEFT JOIN ""Visitors"" vis ON v.""IdVisitor"" = vis.""Id""
            WHERE (v.""UserId"" = @UserId OR v.""Service""::text = @ServiceId OR v.""Service""::text = @Service)
              AND v.""Date""::DATE = CURRENT_DATE
            ORDER BY v.""HeureArriver"" ASC";

        string sql = _dbContext.SelectQuery(sqlSqlServer, sqlPostgres);

        return await connection.QueryAsync<Visit, Visitor, (Visit visit, Visitor visitor)>(
            sql,
            (visit, visitor) => (visit, visitor ?? new Visitor()),
            new { UserId = userId, ServiceId = serviceId, Service = service },
            splitOn: "VisitorId"
        );
    }

    public async Task<IEnumerable<Visit>> GetVisitsByHostAndDateAsync(int? userId, DateTime date)
    {
        using IDbConnection connection = _dbContext.CreateConnection();

        const string sqlSqlServer = @"
            SELECT Id, IdVisitor, UserId, Service, Date, HeureArriver, Motif, Statut, AccessCode 
            FROM [Visit] 
            WHERE IsDeleted = 0 
              AND (@UserId IS NULL OR UserId = @UserId)
              AND CAST(Date AS DATE) = CAST(@Date AS DATE)";

        const string sqlPostgres = @"
            SELECT ""Id"", ""IdVisitor"", ""UserId"", ""Service"", ""Date"", ""HeureArriver"", ""Motif"", ""Statut"", ""AccessCode"" 
            FROM ""Visit"" 
            WHERE ""IsDeleted"" = FALSE 
              AND (@UserId IS NULL OR ""UserId"" = @UserId)
              AND ""Date""::DATE = @Date::DATE";

        string sql = _dbContext.SelectQuery(sqlSqlServer, sqlPostgres);

        var visits = await connection.QueryAsync<Visit>(sql, new { UserId = userId, Date = date.Date });
        return visits?.ToList() ?? new List<Visit>();
    }
}