using Dapper;
using System.Data;
using CleanVisitor.Core.Entities.User;
using CleanVisitor.Application.Features.Users.Dtos;
using CleanVisitor.Application.Features.Users.Interfaces;
using CleanVisitor.Infrastructure.Data;

namespace CleanVisitor.Infrastructure.Repositories.UserRepository;

public class UserRepository : IUserRepository
{
    private readonly DbContext _dbContext;

    public UserRepository(DbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<UserDto> AddAsync(User user)
{
    using IDbConnection connection = _dbContext.CreateConnection();

    const string sqlSqlServer = @"
        INSERT INTO [User] (Nom, Prenom, Email, Telephone, PasswordHash, IsActive, CreatedAt, Role, Service)
        VALUES (@Nom, @Prenom, @Email, @Telephone, @PasswordHash, @IsActive, @CreatedAt, @Role, @Service);
        SELECT CAST(SCOPE_IDENTITY() AS int);";

    const string sqlPostgres = @"
        INSERT INTO ""User"" (""Nom"", ""Prenom"", ""Email"", ""Telephone"", ""PasswordHash"", ""IsActive"", ""CreatedAt"", ""Role"", ""Service"")
        VALUES (@Nom, @Prenom, @Email, @Telephone, @PasswordHash, @IsActive, @CreatedAt, @Role, @Service)
        RETURNING ""Id"";";

    string sql = _dbContext.SelectQuery(sqlSqlServer, sqlPostgres);

    // Exécution et récupération directe de l'ID
    int generatedId = await connection.ExecuteScalarAsync<int>(sql, new 
    {
        Nom = user.Nom,
        Prenom = user.Prenom,
        Email = user.Email,
        Telephone = user.Telephone,
        PasswordHash = user.PasswordHash,
        IsActive = user.IsActive,
        CreatedAt = user.CreatedAt,
        Role = (int)user.Role,
        Service = (int)user.Service
    });

    // Récupération de l'utilisateur complet via son ID nouvellement créé
    var result = await GetByIdAsync(generatedId);

    return result ?? throw new InvalidOperationException($"Erreur : Impossible de récupérer l'utilisateur avec l'ID {generatedId}");
}
    public async Task<bool> DeleteAsync(int id)
    {
        using IDbConnection connection = _dbContext.CreateConnection();

        const string sqlSqlServer = @"UPDATE [User] SET IsDeleted = 1, DeletedAt = GETDATE() WHERE Id = @Id";
        const string sqlPostgres = @"UPDATE ""User"" SET ""IsDeleted"" = TRUE, ""DeletedAt"" = CURRENT_TIMESTAMP WHERE ""Id"" = @Id";

        string sql = _dbContext.SelectQuery(sqlSqlServer, sqlPostgres);

        await connection.ExecuteAsync(sql, new { Id = id });
        return true;
    }

    public async Task<UserDto?> UpdateAsync(User user)
    {
        using IDbConnection connection = _dbContext.CreateConnection();

        const string sqlSqlServer = @"
            UPDATE [User] 
            SET Nom = @Nom, 
                Prenom = @Prenom, 
                Email = @Email, 
                Telephone = @Telephone, 
                PasswordHash = @PasswordHash,
                Role = @Role, 
                Service = @Service, 
                IsActive = @IsActive
            WHERE Id = @Id;

            SELECT Id, Nom, Prenom, Email, Telephone, PasswordHash, CAST(Role AS NVARCHAR(50)) AS Role, CAST(Service AS NVARCHAR(50)) AS Service, IsActive 
            FROM [User] WHERE Id = @Id;";

        const string sqlPostgres = @"
            UPDATE ""User"" 
            SET ""Nom"" = @Nom, 
                ""Prenom"" = @Prenom, 
                ""Email"" = @Email, 
                ""Telephone"" = @Telephone, 
                ""PasswordHash"" = @PasswordHash,
                ""Role"" = @Role, 
                ""Service"" = @Service, 
                ""IsActive"" = @IsActive
            WHERE ""Id"" = @Id;

            SELECT ""Id"", ""Nom"", ""Prenom"", ""Email"", ""Telephone"", ""PasswordHash"", ""Role""::text AS Role, ""Service""::text AS Service, ""IsActive"" 
            FROM ""User"" WHERE ""Id"" = @Id;";

        string sql = _dbContext.SelectQuery(sqlSqlServer, sqlPostgres);

        return await connection.QueryFirstOrDefaultAsync<UserDto>(sql, user);
    }

    public async Task<List<UserDto>> GetAllAsync()
    {
        using IDbConnection connection = _dbContext.CreateConnection();

        const string sqlSqlServer = @"SELECT Id, Nom, Prenom, Email, Telephone, Role, Service, IsActive, CreatedAt FROM [User] WHERE IsDeleted = 0";
        const string sqlPostgres = @"SELECT ""Id"", ""Nom"", ""Prenom"", ""Email"", ""Telephone"", ""Role"", ""Service"", ""IsActive"", ""CreatedAt"" FROM ""User"" WHERE ""IsDeleted"" = FALSE";

        string sql = _dbContext.SelectQuery(sqlSqlServer, sqlPostgres);

        var users = await connection.QueryAsync<UserDto>(sql);
        return users.ToList();
    }

    public async Task<UserDto?> GetByIdAsync(int id)
{
    using IDbConnection connection = _dbContext.CreateConnection();

    const string sqlSqlServer = @"
        SELECT 
            Id, Nom, Prenom, Email, Telephone, 
            CAST(Role AS NVARCHAR(50)) AS Role, 
            CAST(Service AS NVARCHAR(50)) AS Service, 
            IsActive, CreatedAt, IsDeleted, DeletedAt, VisitorId, PasswordHash
        FROM [User] 
        WHERE Id = @Id AND IsDeleted = 0";

    const string sqlPostgres = @"
        SELECT 
            ""Id"" AS Id, 
            ""Nom"" AS Nom, 
            ""Prenom"" AS Prenom, 
            ""Email"" AS Email, 
            ""Telephone"" AS Telephone, 
            ""Role""::text AS Role, 
            ""Service""::text AS Service, 
            ""IsActive"" AS IsActive, 
            ""CreatedAt"" AS CreatedAt, 
            ""IsDeleted"" AS IsDeleted, 
            ""DeletedAt"" AS DeletedAt, 
            ""VisitorId"" AS VisitorId, 
            ""PasswordHash"" AS PasswordHash
        FROM ""User"" 
        WHERE ""Id"" = @Id AND ""IsDeleted"" = FALSE";

    string sql = _dbContext.SelectQuery(sqlSqlServer, sqlPostgres);

    return await connection.QueryFirstOrDefaultAsync<UserDto>(sql, new { Id = id });
}

    public async Task<UserDto?> GetByEmailAsync(string email)
    {
        using IDbConnection connection = _dbContext.CreateConnection();

        const string sqlSqlServer = @"
            SELECT u.Id, u.Nom, u.Prenom, u.Email, u.Telephone, u.Role, u.Service, u.IsActive, u.CreatedAt, u.IsDeleted, u.DeletedAt, u.VisitorId, u.PasswordHash
            FROM [User] u 
            WHERE u.Email = @Email AND u.IsDeleted = 0";

        const string sqlPostgres = @"
            SELECT u.""Id"", u.""Nom"", u.""Prenom"", u.""Email"", u.""Telephone"", u.""Role""::text AS Role, u.""Service""::text AS Service, u.""IsActive"", u.""CreatedAt"", u.""IsDeleted"", u.""DeletedAt"", u.""VisitorId"", u.""PasswordHash""
            FROM ""User"" u 
            WHERE u.""Email"" = @Email AND u.""IsDeleted"" = FALSE";

        string sql = _dbContext.SelectQuery(sqlSqlServer, sqlPostgres);

        return await connection.QueryFirstOrDefaultAsync<UserDto>(sql, new { Email = email });
    }

    public async Task<List<UserDto>> GetDeletedAsync()
    {
        using IDbConnection connection = _dbContext.CreateConnection();

        const string sqlSqlServer = @"SELECT * FROM [User] WHERE IsDeleted = 1";
        const string sqlPostgres = @"SELECT * FROM ""User"" WHERE ""IsDeleted"" = TRUE";

        string sql = _dbContext.SelectQuery(sqlSqlServer, sqlPostgres);

        var users = await connection.QueryAsync<UserDto>(sql);
        return users.ToList();
    }

    public async Task<int> RestoreAsync(int id)
    {
        using IDbConnection connection = _dbContext.CreateConnection();

        const string sqlSqlServer = @"UPDATE [User] SET IsDeleted = 0, DeletedAt = NULL OUTPUT inserted.Id WHERE Id = @Id AND IsDeleted = 1";
        const string sqlPostgres = @"UPDATE ""User"" SET ""IsDeleted"" = FALSE, ""DeletedAt"" = NULL WHERE ""Id"" = @Id AND ""IsDeleted"" = TRUE RETURNING ""Id""";

        string sql = _dbContext.SelectQuery(sqlSqlServer, sqlPostgres);

        return await connection.QueryFirstOrDefaultAsync<int>(sql, new { Id = id });
    }

    public async Task<UserDto?> GetDeletedByIdAsync(int id)
    {
        using IDbConnection connection = _dbContext.CreateConnection();

        const string sqlSqlServer = @"SELECT * FROM [User] WHERE Id = @Id AND IsDeleted = 1";
        const string sqlPostgres = @"SELECT * FROM ""User"" WHERE ""Id"" = @Id AND ""IsDeleted"" = TRUE";

        string sql = _dbContext.SelectQuery(sqlSqlServer, sqlPostgres);

        return await connection.QueryFirstOrDefaultAsync<UserDto>(sql, new { id });
    }

    public async Task<UserProfileDto> GetUserProfileAsync(int userId)
    {
        using IDbConnection connection = _dbContext.CreateConnection();

        const string sqlSqlServer = @"SELECT u.Id, u.Nom, u.Prenom, u.Email, u.Role, u.Telephone FROM [User] u WHERE u.Id = @UserId";
        const string sqlPostgres = @"SELECT u.""Id"", u.""Nom"", u.""Prenom"", u.""Email"", u.""Role""::text AS Role, u.""Telephone"" FROM ""User"" u WHERE u.""Id"" = @UserId";

        string sql = _dbContext.SelectQuery(sqlSqlServer, sqlPostgres);

        var result = await connection.QueryFirstOrDefaultAsync<UserProfileDto>(sql, new { UserId = userId });
        return result!;
    }

    public async Task SaveResetTokenAsync(int userId, string token, DateTime expiry)
    {
        using IDbConnection connection = _dbContext.CreateConnection();

        const string sqlSqlServer = @"UPDATE [User] SET ResetPasswordToken = @Token, ResetPasswordTokenExpiry = @Expiry WHERE Id = @UserId";
        const string sqlPostgres = @"UPDATE ""User"" SET ""ResetPasswordToken"" = @Token, ""ResetPasswordTokenExpiry"" = @Expiry WHERE ""Id"" = @UserId";

        string sql = _dbContext.SelectQuery(sqlSqlServer, sqlPostgres);

        await connection.ExecuteAsync(sql, new { Token = token, Expiry = expiry, UserId = userId });
    }

    public async Task<UserDto?> GetByResetTokenAsync(string email, string token)
    {
        using IDbConnection connection = _dbContext.CreateConnection();

        const string sqlSqlServer = @"SELECT * FROM [User] WHERE Email = @Email AND ResetPasswordToken = @Token AND ResetPasswordTokenExpiry > GETDATE() AND IsDeleted = 0";
        const string sqlPostgres = @"SELECT * FROM ""User"" WHERE ""Email"" = @Email AND ""ResetPasswordToken"" = @Token AND ""ResetPasswordTokenExpiry"" > CURRENT_TIMESTAMP AND ""IsDeleted"" = FALSE";

        string sql = _dbContext.SelectQuery(sqlSqlServer, sqlPostgres);

        return await connection.QueryFirstOrDefaultAsync<UserDto>(sql, new { Email = email, Token = token });
    }

    public async Task UpdatePasswordAsync(int userId, string newPasswordHash)
    {
        using IDbConnection connection = _dbContext.CreateConnection();

        const string sqlSqlServer = @"UPDATE [User] SET PasswordHash = @PasswordHash, ResetPasswordToken = NULL, ResetPasswordTokenExpiry = NULL WHERE Id = @UserId";
        const string sqlPostgres = @"UPDATE ""User"" SET ""PasswordHash"" = @PasswordHash, ""ResetPasswordToken"" = NULL, ""ResetPasswordTokenExpiry"" = NULL WHERE ""Id"" = @UserId";

        string sql = _dbContext.SelectQuery(sqlSqlServer, sqlPostgres);

        await connection.ExecuteAsync(sql, new { PasswordHash = newPasswordHash, UserId = userId });
    }

    public async Task<List<UserDto>> GetAgentsByServiceAsync(string service)
    {
        var serviceMapping = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
        {
            { "Direction", "1" }, { "1", "1" },
            { "Service RH", "2" }, { "Service_RH", "2" }, { "ServiceRH", "2" }, { "2", "2" },
            { "Service Financier", "3" }, { "Service_Financier", "3" }, { "ServiceFinancier", "3" }, { "3", "3" },
            { "Service Informatique", "4" }, { "Service_Informatique", "4" }, { "ServiceInformatique", "4" }, { "4", "4" },
            { "Secrétariat", "5" }, { "Secretariat", "5" }, { "5", "5" },
            { "Nouveau Service", "6" }, { "NouveauService", "6" }, { "6", "6" }
        };

        string targetCode = serviceMapping.TryGetValue(service, out var code) ? code : service;

        using IDbConnection connection = _dbContext.CreateConnection();

        const string sqlSqlServer = @"SELECT Id, Nom, Prenom, CAST(Service AS NVARCHAR(50)) AS Service, CAST(Role AS NVARCHAR(50)) AS Role, Email, Telephone FROM [User] WHERE IsDeleted = 0";
        const string sqlPostgres = @"SELECT ""Id"", ""Nom"", ""Prenom"", ""Service""::text AS Service, ""Role""::text AS Role, ""Email"", ""Telephone"" FROM ""User"" WHERE ""IsDeleted"" = FALSE";

        string sql = _dbContext.SelectQuery(sqlSqlServer, sqlPostgres);

        var allUsers = await connection.QueryAsync<UserDto>(sql);

        return allUsers.Where(u => 
            (string.Equals(u.Role, "2", StringComparison.OrdinalIgnoreCase) || 
             string.Equals(u.Role, "Agent", StringComparison.OrdinalIgnoreCase)) &&
            (
                string.Equals(u.Service, service, StringComparison.OrdinalIgnoreCase) || 
                string.Equals(u.Service, targetCode, StringComparison.OrdinalIgnoreCase) ||
                (!string.IsNullOrEmpty(u.Service) && u.Service.Trim().Equals(service.Trim(), StringComparison.OrdinalIgnoreCase))
            )
        ).ToList();
    }
}