using System.Data;
using Dapper;
using CleanVisitor.Application.Features.Visitors.Interfaces;
using CleanVisitor.Application.Features.Visitors.Dtos.StatJourDto;
using CleanVisitor.Application.Features.Visitors.Dtos.StatMoisDto;
using CleanVisitor.Application.Features.Visitors.Dtos.StatAnneeDto;
using CleanVisitor.Features.Visitors.Dtos.VisitCloneDto;
using CleanVisitor.Application.Features.Visitors.Dtos.VisitorVisitDto;
using CleanVisitor.Application.Features.Visitors.Dtos;
using CleanVisitor.Core.Entities;
using CleanVisitor.Infrastructure.Data;

namespace CleanVisitor.Infrastructure.Repositories;

public class VisitorRepository : IVisitorRepository
{
    private readonly DbContext _dbContext;

    public VisitorRepository(DbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<VisitorDto?> AddAsync(Visitor visitor)
    {
        using IDbConnection connection = _dbContext.CreateConnection();

        // SQL Server
        const string sqlInsertSqlServer = @"
            INSERT INTO Visitors (Nom, Telephone, Email, DateEnregistrement, DateCreation, IsDeleted)
            VALUES (@Nom, @Telephone, @Email, @DateEnregistrement, GETDATE(), 0);
            SELECT CAST(SCOPE_IDENTITY() AS int);";

        // PostgreSQL (Supabase)
        const string sqlInsertPostgres = @"
            INSERT INTO ""Visitors"" (""Nom"", ""Telephone"", ""Email"", ""DateEnregistrement"", ""DateCreation"", ""IsDeleted"")
            VALUES (@Nom, @Telephone, @Email, @DateEnregistrement, CURRENT_TIMESTAMP, FALSE)
            RETURNING ""Id"";";

        string sqlInsert = _dbContext.SelectQuery(sqlInsertSqlServer, sqlInsertPostgres);
        int newVisitorId = await connection.QuerySingleAsync<int>(sqlInsert, visitor);

        // Lier le visiteur à l'utilisateur
        const string sqlUpdateSqlServer = @"UPDATE [User] SET VisitorId = @VisitorId WHERE Email = @Email";
        const string sqlUpdatePostgres = @"UPDATE ""User"" SET ""VisitorId"" = @VisitorId WHERE ""Email"" = @Email";

        string sqlUpdate = _dbContext.SelectQuery(sqlUpdateSqlServer, sqlUpdatePostgres);
        await connection.ExecuteAsync(sqlUpdate, new { VisitorId = newVisitorId, Email = visitor.Email });

        return await GetByIdDtoAsync(newVisitorId);
    }

    public async Task<Visitor?> GetByIdAsync(int id)
    {
        using IDbConnection connection = _dbContext.CreateConnection();

        const string sqlSqlServer = @"
            SELECT v.Id, v.Nom, v.Telephone, v.Email, v.DateEnregistrement, v.IsDeleted, v.DeletedAt,
                   u.Prenom
            FROM [Visitors] v
            LEFT JOIN [User] u ON u.VisitorId = v.Id
            WHERE v.Id = @Id AND v.IsDeleted = 0";

        const string sqlPostgres = @"
            SELECT v.""Id"", v.""Nom"", v.""Telephone"", v.""Email"", v.""DateEnregistrement"", v.""IsDeleted"", v.""DeletedAt"",
                   u.""Prenom""
            FROM ""Visitors"" v
            LEFT JOIN ""User"" u ON u.""VisitorId"" = v.""Id""
            WHERE v.""Id"" = @Id AND v.""IsDeleted"" = FALSE";

        string sql = _dbContext.SelectQuery(sqlSqlServer, sqlPostgres);
        return await connection.QueryFirstOrDefaultAsync<Visitor>(sql, new { Id = id });
    }

    public async Task<List<Visitor>> GetAllAsync()
    {
        using IDbConnection connection = _dbContext.CreateConnection();

        const string sqlSqlServer = @"SELECT * FROM [Visitors] WHERE IsDeleted = 0";
        const string sqlPostgres = @"SELECT * FROM ""Visitors"" WHERE ""IsDeleted"" = FALSE";

        string sql = _dbContext.SelectQuery(sqlSqlServer, sqlPostgres);
        var visitors = await connection.QueryAsync<Visitor>(sql);
        return visitors.ToList();
    }

    public async Task<bool> DeleteAsync(int id)
    {
        using IDbConnection connection = _dbContext.CreateConnection();

        const string sqlSqlServer = @"UPDATE [Visitors] SET IsDeleted = 1, DeletedAt = GETDATE() WHERE Id = @Id";
        const string sqlPostgres = @"UPDATE ""Visitors"" SET ""IsDeleted"" = TRUE, ""DeletedAt"" = CURRENT_TIMESTAMP WHERE ""Id"" = @Id";

        string sql = _dbContext.SelectQuery(sqlSqlServer, sqlPostgres);
        var rowsAffected = await connection.ExecuteAsync(sql, new { Id = id });
        return rowsAffected > 0;
    }

    public async Task<VisitorDto?> UpdateAsync(Visitor visitor)
    {
        using IDbConnection connection = _dbContext.CreateConnection();

        // 1. Mise à jour dynamique de Visitors
        var visitorUpdatesSqlServer = new List<string>();
        var visitorUpdatesPostgres = new List<string>();
        var parameters = new DynamicParameters();
        parameters.Add("Id", visitor.Id);

        if (!string.IsNullOrEmpty(visitor.Nom))
        {
            visitorUpdatesSqlServer.Add("Nom = @Nom");
            visitorUpdatesPostgres.Add(@"""Nom"" = @Nom");
            parameters.Add("Nom", visitor.Nom);
        }
        if (!string.IsNullOrEmpty(visitor.Telephone))
        {
            visitorUpdatesSqlServer.Add("Telephone = @Telephone");
            visitorUpdatesPostgres.Add(@"""Telephone"" = @Telephone");
            parameters.Add("Telephone", visitor.Telephone);
        }
        if (!string.IsNullOrEmpty(visitor.Email))
        {
            visitorUpdatesSqlServer.Add("Email = @Email");
            visitorUpdatesPostgres.Add(@"""Email"" = @Email");
            parameters.Add("Email", visitor.Email);
        }

        if (visitorUpdatesSqlServer.Count > 0)
        {
            string sqlVisitorSqlServer = $"UPDATE Visitors SET {string.Join(", ", visitorUpdatesSqlServer)} WHERE Id = @Id";
            string sqlVisitorPostgres = $"UPDATE \"Visitors\" SET {string.Join(", ", visitorUpdatesPostgres)} WHERE \"Id\" = @Id";
            
            string sqlVisitor = _dbContext.SelectQuery(sqlVisitorSqlServer, sqlVisitorPostgres);
            await connection.ExecuteAsync(sqlVisitor, parameters);
        }

        // 2. Mise à jour dynamique de User
        var userUpdatesSqlServer = new List<string>();
        var userUpdatesPostgres = new List<string>();
        var userParameters = new DynamicParameters();
        userParameters.Add("Id", visitor.Id);

        if (!string.IsNullOrEmpty(visitor.Email))
        {
            userUpdatesSqlServer.Add("Email = @Email");
            userUpdatesPostgres.Add(@"""Email"" = @Email");
            userParameters.Add("Email", visitor.Email);
        }
        if (!string.IsNullOrEmpty(visitor.Prenom))
        {
            userUpdatesSqlServer.Add("Prenom = @Prenom");
            userUpdatesPostgres.Add(@"""Prenom"" = @Prenom");
            userParameters.Add("Prenom", visitor.Prenom);
        }
        if (!string.IsNullOrEmpty(visitor.Nom))
        {
            userUpdatesSqlServer.Add("Nom = @Nom");
            userUpdatesPostgres.Add(@"""Nom"" = @Nom");
            userParameters.Add("Nom", visitor.Nom);
        }
        if (!string.IsNullOrEmpty(visitor.Password))
        {
            userUpdatesSqlServer.Add("PasswordHash = @PasswordHash");
            userUpdatesPostgres.Add(@"""PasswordHash"" = @PasswordHash");
            userParameters.Add("PasswordHash", BCrypt.Net.BCrypt.HashPassword(visitor.Password));
        }

        if (userUpdatesSqlServer.Count > 0)
        {
            string sqlUserSqlServer = $"UPDATE [User] SET {string.Join(", ", userUpdatesSqlServer)} WHERE VisitorId = @Id";
            string sqlUserPostgres = $"UPDATE \"User\" SET {string.Join(", ", userUpdatesPostgres)} WHERE \"VisitorId\" = @Id";
            
            string sqlUser = _dbContext.SelectQuery(sqlUserSqlServer, sqlUserPostgres);
            await connection.ExecuteAsync(sqlUser, userParameters);
        }

        return await GetByIdDtoAsync(visitor.Id);
    }

    public async Task<VisitorVisitDto?> GetVisitorVisitAsync(int id)
    {
        using IDbConnection connection = _dbContext.CreateConnection();

        VisitorVisitDto? visitorDto = null;

        const string sqlSqlServer = @"
            SELECT 
                u.Nom, u.Telephone, u.Email, u.DateEnregistrement, 
                v.Id, v.IdVisitor, v.Motif, v.Date, v.HeureDepart, v.HeureArriver, v.Statut, v.Service
            FROM [User] u
            INNER JOIN [Visit] v ON u.Id = v.IdVisitor
            WHERE u.Id = @Id AND v.IsDeleted = 0";

        const string sqlPostgres = @"
            SELECT 
                u.""Nom"", u.""Telephone"", u.""Email"", u.""DateEnregistrement"", 
                v.""Id"", v.""IdVisitor"", v.""Motif"", v.""Date"", v.""HeureDepart"", v.""HeureArriver"", v.""Statut"", v.""Service""
            FROM ""User"" u
            INNER JOIN ""Visit"" v ON u.""Id"" = v.""IdVisitor""
            WHERE u.""Id"" = @Id AND v.""IsDeleted"" = FALSE";

        string sql = _dbContext.SelectQuery(sqlSqlServer, sqlPostgres);

        await connection.QueryAsync<VisitorVisitDto, VisitClonDto, VisitorVisitDto>(
            sql,
            (visitor, visit) =>
            {
                if (visitorDto == null)
                {
                    visitorDto = visitor;
                    visitorDto.ListVisitClon = new List<VisitClonDto>();
                }

                if (visit != null)
                {
                    visitorDto.ListVisitClon.Add(visit);
                }

                return visitor;
            },
            new { Id = id },
            splitOn: "Id"
        );

        return visitorDto;
    }

    public async Task<List<StatJourDto>> GetVisitorJourAsync()
    {
        using IDbConnection connection = _dbContext.CreateConnection();

        const string sqlSqlServer = @"
            SELECT CAST(DateEnregistrement AS DATE) AS DateJour, COUNT(*) AS TotalVisitorJour
            FROM [Visitors]
            GROUP BY CAST(DateEnregistrement AS DATE);";

        const string sqlPostgres = @"
            SELECT ""DateEnregistrement""::DATE AS DateJour, COUNT(*) AS TotalVisitorJour
            FROM ""Visitors""
            GROUP BY ""DateEnregistrement""::DATE;";

        string sql = _dbContext.SelectQuery(sqlSqlServer, sqlPostgres);
        var statistique = await connection.QueryAsync<StatJourDto>(sql);
        return statistique.ToList();
    }

    public async Task<List<StatMoisDto>> GetVisitorMoisAsync()
    {
        using IDbConnection connection = _dbContext.CreateConnection();

        const string sqlSqlServer = @"
            SELECT MONTH(DateEnregistrement) AS Mois, COUNT(*) AS TotalVisitor
            FROM [Visitors]
            GROUP BY MONTH(DateEnregistrement)
            ORDER BY Mois;";

        const string sqlPostgres = @"
            SELECT EXTRACT(MONTH FROM ""DateEnregistrement"") AS Mois, COUNT(*) AS TotalVisitor
            FROM ""Visitors""
            GROUP BY EXTRACT(MONTH FROM ""DateEnregistrement"")
            ORDER BY Mois;";

        string sql = _dbContext.SelectQuery(sqlSqlServer, sqlPostgres);
        var stat = await connection.QueryAsync<StatMoisDto>(sql);
        return stat.ToList();
    }

    public async Task<List<StatAnneeDto>> GetVisitorAnneeAsync()
    {
        using IDbConnection connection = _dbContext.CreateConnection();

        const string sqlSqlServer = @"
            SELECT YEAR(DateEnregistrement) AS Annee, COUNT(*) AS TotalVisitor
            FROM [Visitors]
            GROUP BY YEAR(DateEnregistrement)
            ORDER BY Annee;";

        const string sqlPostgres = @"
            SELECT EXTRACT(YEAR FROM ""DateEnregistrement"") AS Annee, COUNT(*) AS TotalVisitor
            FROM ""Visitors""
            GROUP BY EXTRACT(YEAR FROM ""DateEnregistrement"")
            ORDER BY Annee;";

        string sql = _dbContext.SelectQuery(sqlSqlServer, sqlPostgres);
        var stat = await connection.QueryAsync<StatAnneeDto>(sql);
        return stat.ToList();
    }

    public async Task<List<VisitorDto>> GetDeletedAsync()
    {
        using IDbConnection connection = _dbContext.CreateConnection();

        const string sqlSqlServer = @"SELECT * FROM [Visitors] WHERE IsDeleted = 1";
        const string sqlPostgres = @"SELECT * FROM ""Visitors"" WHERE ""IsDeleted"" = TRUE";

        string sql = _dbContext.SelectQuery(sqlSqlServer, sqlPostgres);
        var visitors = await connection.QueryAsync<VisitorDto>(sql);
        return visitors.ToList();
    }

    public async Task<int> RestoreAsync(int id)
    {
        using IDbConnection connection = _dbContext.CreateConnection();

        const string sqlSqlServer = @"
            UPDATE [Visitors]
            SET IsDeleted = 0, DeletedAt = NULL
            OUTPUT inserted.Id
            WHERE Id = @Id AND IsDeleted = 1";

        const string sqlPostgres = @"
            UPDATE ""Visitors""
            SET ""IsDeleted"" = FALSE, ""DeletedAt"" = NULL
            WHERE ""Id"" = @Id AND ""IsDeleted"" = TRUE
            RETURNING ""Id""";

        string sql = _dbContext.SelectQuery(sqlSqlServer, sqlPostgres);
        return await connection.QueryFirstOrDefaultAsync<int>(sql, new { Id = id });
    }

    public async Task LinkVisitorToUserAsync(string email, int visitorId)
    {
        using IDbConnection connection = _dbContext.CreateConnection();

        const string sqlSqlServer = @"UPDATE [User] SET VisitorId = @VisitorId WHERE Email = @Email";
        const string sqlPostgres = @"UPDATE ""User"" SET ""VisitorId"" = @VisitorId WHERE ""Email"" = @Email";

        string sql = _dbContext.SelectQuery(sqlSqlServer, sqlPostgres);
        await connection.ExecuteAsync(sql, new { VisitorId = visitorId, Email = email });
    }

    public async Task<VisitorDto?> GetDeletedByIdAsync(int id)
    {
        using IDbConnection connection = _dbContext.CreateConnection();

        const string sqlSqlServer = @"SELECT * FROM [Visitors] WHERE Id = @Id AND IsDeleted = 1";
        const string sqlPostgres = @"SELECT * FROM ""Visitors"" WHERE ""Id"" = @Id AND ""IsDeleted"" = TRUE";

        string sql = _dbContext.SelectQuery(sqlSqlServer, sqlPostgres);
        return await connection.QueryFirstOrDefaultAsync<VisitorDto>(sql, new { Id = id });
    }

    private async Task<VisitorDto?> GetByIdDtoAsync(int id)
    {
        using IDbConnection connection = _dbContext.CreateConnection();

        const string sqlSqlServer = @"SELECT * FROM [Visitors] WHERE Id = @Id";
        const string sqlPostgres = @"SELECT * FROM ""Visitors"" WHERE ""Id"" = @Id";

        string sql = _dbContext.SelectQuery(sqlSqlServer, sqlPostgres);
        return await connection.QueryFirstOrDefaultAsync<VisitorDto>(sql, new { Id = id });
    }
}