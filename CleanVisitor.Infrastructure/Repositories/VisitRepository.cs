using System.Data;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
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
    private readonly string _connectionString;

    public VisitRepository(IConfiguration configuration)
    {
        _connectionString = configuration.GetConnectionString("DefaultConnection")!;
    }
    
    // 🟢 1. ADDASYNC CORRIGÉ (Rejoint [User] pour alimenter l'hôte immédiatement à la création)
    public async Task<VisitDto> AddAsync(Visit visit)
    {
        var sql = @"
            INSERT INTO [Visit] (Motif, Date, HeureDepart, HeureArriver, Statut, Service, IdVisitor, IsDeleted, UserId, AccessCode) 
            VALUES (@Motif, @Date, @HeureDepart, @HeureArriver, @Statut, @Service, @IdVisitor, 0, @UserId, @AccessCode);
            
            DECLARE @NewId INT = SCOPE_IDENTITY();

            SELECT 
                v.Id AS Id,
                v.Motif AS Motif, 
                v.Date AS Date, 
                v.HeureDepart AS HeureDepart, 
                v.HeureArriver AS HeureArriver, 
                v.Statut AS Statut, 
                v.Service AS Service,
                v.IdVisitor AS IdVisitor,
                v.UserId AS UserId,             -- ID Hôte
                v.AccessCode AS AccessCode,
                vt.Nom AS Nom_visitor,   
                vt.Email AS Email_visitor,
                u.Nom AS Nom_Host,              -- Nom Hôte
                u.Prenom AS Prenom_Host         -- Prénom Hôte
            FROM [Visit] v
            INNER JOIN [Visitors] vt ON v.IdVisitor = vt.Id
            LEFT JOIN [User] u ON v.UserId = u.Id -- Jointure avec l'Hôte
            WHERE v.Id = @NewId;";
            
        using var connection = new SqlConnection(_connectionString);
        return await connection.QuerySingleAsync<VisitDto>(sql, visit);
    }

    public async Task<VisitDto?> UpdateAsync(Visit visit)
    {
        using var connection = new SqlConnection(_connectionString);
        string sql = @"
            UPDATE [Visit] 
            SET Motif = @Motif, 
                Date = @Date, 
                HeureDepart = @HeureDepart, 
                HeureArriver = @HeureArriver, 
                Statut = @Statut, 
                Service = @Service,
                UserId = @UserId
            WHERE Id = @Id;

            SELECT 
                v.Id AS Id,
                v.Motif AS Motif, 
                v.Date AS Date, 
                v.HeureDepart AS HeureDepart, 
                v.HeureArriver AS HeureArriver, 
                v.Statut AS Statut, 
                v.Service AS Service,
                v.IdVisitor AS IdVisitor,
                v.UserId AS UserId,
                v.AccessCode AS AccessCode,
                vt.Nom AS Nom_visitor,   
                vt.Email AS Email_visitor,
                u.Nom AS Nom_Host,
                u.Prenom AS Prenom_Host
            FROM [Visit] v
            INNER JOIN [Visitors] vt ON v.IdVisitor = vt.Id
            LEFT JOIN [User] u ON v.UserId = u.Id
            WHERE v.Id = @Id;";
                       
        return await connection.QueryFirstOrDefaultAsync<VisitDto>(sql, visit);
    }

    // 🟢 2. GETBYIDASYNC CORRIGÉ (C'est la méthode appelée quand on charge une visite à reprogrammer !)
    public async Task<VisitDto?> GetByIdAsync(int id)
    {
        string sql = @"
            SELECT 
                v.Id AS Id,
                v.Motif AS Motif, 
                v.Date AS Date, 
                v.HeureDepart AS HeureDepart, 
                v.HeureArriver AS HeureArriver, 
                v.Statut AS Statut, 
                v.Service AS Service,
                v.IdVisitor AS IdVisitor,
                v.UserId AS UserId,             -- ID Hôte
                v.AccessCode AS AccessCode,
                vt.Nom AS Nom_visitor, 
                vt.Email AS Email_visitor,
                u.Nom AS Nom_Host,              -- Nom Hôte
                u.Prenom AS Prenom_Host         -- Prénom Hôte
            FROM [Visit] v
            INNER JOIN [Visitors] vt ON v.IdVisitor = vt.Id
            LEFT JOIN [User] u ON v.UserId = u.Id  -- Jointure Hôte
            WHERE v.[Id] = @Id AND v.IsDeleted = 0";

        using var connection = new SqlConnection(_connectionString);
        return await connection.QueryFirstOrDefaultAsync<VisitDto?>(sql, new { Id = id });
    }

    public async Task<List<VisitDto?>> GetAllAsync()
    {
        var sql = @"
            SELECT 
                v.Id AS Id,
                v.Motif AS Motif, 
                v.Date AS Date, 
                v.HeureDepart AS HeureDepart, 
                v.HeureArriver AS HeureArriver, 
                v.Statut AS Statut, 
                v.Service AS Service,
                v.IdVisitor AS IdVisitor,
                v.UserId AS UserId,
                v.AccessCode AS AccessCode,
                vt.Nom AS Nom_visitor,   
                vt.Email AS Email_visitor,
                u.Nom AS Nom_Host,
                u.Prenom AS Prenom_Host
            FROM [Visit] v
            INNER JOIN [Visitors] vt ON v.IdVisitor = vt.Id
            LEFT JOIN [User] u ON v.UserId = u.Id
            WHERE v.IsDeleted = 0";

        using var connection = new SqlConnection(_connectionString);
        var visits = await connection.QueryAsync<VisitDto>(sql);
        return visits.ToList()!;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        using var connection = new SqlConnection(_connectionString);
        var sql = @"UPDATE [Visit] SET IsDeleted = 1, DeletedAt = GETDATE() WHERE Id = @Id";
        await connection.ExecuteAsync(sql, new { Id = id });
        return true;
    }

    public async Task<VisitDto?> GetByDateAsync(DateTime Date)
    {
        using var connection = new SqlConnection(_connectionString);
        string sql = @"SELECT * FROM Visit WHERE Date = @Date;";
        return await connection.QueryFirstOrDefaultAsync<VisitDto?>(sql, new { Date = Date });
    }

    public async Task<List<ServiceDto>> GetVisitCountByServiceStatutAsync()
    {
        using var connection = new SqlConnection(_connectionString);
        var sql = @"SELECT Service AS Service, Statut AS Statut, COUNT(*) AS Total_visit FROM [Visit] GROUP BY Service, Statut;";
        var service = await connection.QueryAsync<ServiceDto>(sql);
        return service.ToList();
    }

    public async Task<List<VisitDto>> GetDeletedAsync()
    {
        var sql = @"SELECT * FROM [Visit] WHERE IsDeleted = 1";
        using var connection = new SqlConnection(_connectionString);
        var user = await connection.QueryAsync<VisitDto>(sql);
        return user.ToList(); 
    }

    public async Task<int> RestoreAsync(int id)
    {
        var sql = @"UPDATE [Visit] SET IsDeleted = 0, DeletedAt = NULL OUTPUT inserted.* WHERE Id = @Id AND IsDeleted = 1";
        using var connection = new SqlConnection(_connectionString);
        return await connection.QueryFirstOrDefaultAsync<int>(sql, new { Id = id });
    }

    public async Task<VisitDto?> GetDeletedByIdAsync(int id)
    {
        string sql = "SELECT * FROM Visit WHERE Id = @id AND IsDeleted = 1";
        using var connection = new SqlConnection(_connectionString);
        return await connection.QueryFirstOrDefaultAsync<VisitDto>(sql, new { id });
    }

    public async Task<bool> UpdateStatusAsync(int id, int newStatus)
    {
        const string sql = @"UPDATE [Visit] SET Statut = @Statut WHERE Id = @Id";
        using var connection = new SqlConnection(_connectionString);
        var rowsAffected = await connection.ExecuteAsync(sql, new { Statut = newStatus, Id = id });
        return rowsAffected > 0;
    }

    public async Task<IEnumerable<VisitDetailsDto>> GetAllVisitsWithDetailsAsync()
    {
        using var connection = new SqlConnection(_connectionString);
        var sql = @"
            SELECT 
                v.Id, 
                v.Motif, 
                v.Service, 
                v.Statut, 
                v.HeureArriver, 
                v.IdVisitor,
                vt.Nom, 
                vt.Email 
            FROM Visit v 
            INNER JOIN Visitors vt ON v.IdVisitor = vt.Id
            WHERE v.IsDeleted = 0";

        try 
        {
            var result = await connection.QueryAsync<VisitDetailsDto>(sql);
            return result;
        }
        catch (SqlException ex)
        {
            Console.WriteLine($"Erreur SQL : {ex.Message}");
            throw;
        }
    }

    // 🟢 3. GETUSERVISITSASYNC CORRIGÉ (Côté Visiteur : renvoie les visites du visiteur avec l'hôte !)
    public async Task<List<VisitDto>> GetUserVisitsAsync(int userId)
    {
        const string sql = @"
            SELECT 
                v.Id, v.Motif, v.Date, v.HeureArriver, v.HeureDepart, v.Statut, v.Service,
                v.IdVisitor, v.UserId, v.AccessCode,
                uHost.Nom AS Nom_Host,
                uHost.Prenom AS Prenom_Host
            FROM [Visit] v
            INNER JOIN [Visitors] vt ON v.IdVisitor = vt.Id
            INNER JOIN [User] u ON vt.Email = u.Email
            LEFT JOIN [User] uHost ON v.UserId = uHost.Id -- Hôte ciblé par la visite
            WHERE u.Id = @UserId AND v.IsDeleted = 0";

        using var connection = new SqlConnection(_connectionString);
        var result = await connection.QueryAsync<VisitDto>(sql, new { UserId = userId });
        return result.ToList();
    }

    public async Task<List<VisitDto>> GetByServiceAsync(int serviceId)
    {
        const string sql = @"
            SELECT 
                v.Id, 
                v.Motif, 
                v.Date, 
                v.HeureArriver, 
                v.HeureDepart,
                v.Statut, 
                v.Service,
                v.IdVisitor,
                v.UserId,
                vt.Nom AS Nom_visitor,
                vt.Email AS Email_visitor,
                u.Nom AS Nom_Host,
                u.Prenom AS Prenom_Host
            FROM [Visit] v
            INNER JOIN [Visitors] vt ON v.IdVisitor = vt.Id
            LEFT JOIN [User] u ON v.UserId = u.Id
            WHERE (v.Service = @ServiceId OR v.Service = CAST(@ServiceId AS VARCHAR)) 
              AND v.IsDeleted = 0
              AND (v.Statut = 1 OR v.Statut = 'Accepter' OR v.Statut = 'Accepté')";

        using var connection = new SqlConnection(_connectionString);
        
        try 
        {
            var visits = await connection.QueryAsync<VisitDto>(sql, new { ServiceId = serviceId });
            return visits.ToList();
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[SQL ERROR] GetByServiceAsync : {ex.Message}");
            throw;
        }
    }
    public async Task<IEnumerable<(Visit visit, Visitor visitor)>> GetTodayVisitsByAgentOrServiceAsync(int userId, string service)
{
    // Normalisation de l'identifiant du service
    string serviceId = (service ?? "").Trim() switch
    {
        "Service Financier" => "3",
        "Service_Financier" => "3",
        "Service RH" => "2",
        "Service_RH" => "2",
        "Service Informatique" => "4",
        "Service_Informatique" => "4",
        "Direction" => "1",
        "Secrétariat" => "5",
        _ => service
    };

    // SQL avec alias 'VisitorId' explicite pour éviter tout conflit d'ID au mapping Dapper
    const string sql = @"
        SELECT 
            v.Id, 
            v.Motif, 
            v.Date, 
            v.HeureArriver, 
            v.HeureDepart, 
            v.Statut, 
            v.Service, 
            v.UserId, 
            v.IdVisitor, 
            v.AccessCode,
            vis.Id AS VisitorId, 
            vis.Nom, 
            vis.Email, 
            vis.Telephone
        FROM [Visit] v
        LEFT JOIN [Visitors] vis ON v.IdVisitor = vis.Id
        WHERE (v.UserId = @UserId OR CAST(v.Service AS VARCHAR) = @ServiceId OR CAST(v.Service AS VARCHAR) = @Service)
          AND CAST(v.Date AS DATE) = CAST(GETDATE() AS DATE)
        ORDER BY v.HeureArriver ASC";

    using var connection = new SqlConnection(_connectionString);

    // Multi-mapping Dapper avec 'VisitorId' comme point de séparation (splitOn)
    var result = await connection.QueryAsync<Visit, Visitor, (Visit visit, Visitor visitor)>(
        sql,
        (visit, visitor) => (visit, visitor ?? new Visitor()),
        new { UserId = userId, ServiceId = serviceId, Service = service },
        splitOn: "VisitorId"
    );

    return result;
}
public async Task<IEnumerable<Visit>> GetVisitsByHostAndDateAsync(int userId, DateTime date)
{
    const string sql = @"
        SELECT Id, HeureArriver, Statut 
        FROM [Visit] 
        WHERE UserId = @UserId
          AND CAST(Date AS DATE) = CAST(@Date AS DATE)
          AND Statut != 4"; // On ignore les visites annulées (4)

    using var connection = new SqlConnection(_connectionString);
    return await connection.QueryAsync<Visit>(sql, new { UserId = userId, Date = date });
}
}