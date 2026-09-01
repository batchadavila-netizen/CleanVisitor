using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using Dapper;
using CleanVisitor.Core.Entities.User;
using CleanVisitor.Application.Features.Users.Dtos;
using CleanVisitor.Application.Features.Users.Interfaces;

namespace CleanVisitor.Infrastructure.Repositories.UserRepository;

public class UserRepository : IUserRepository
{
    private readonly string _connectionString;

    public UserRepository(IConfiguration configuration)
    {
        _connectionString = configuration.GetConnectionString("DefaultConnection")!;
    }

    public async Task<UserDto> AddAsync(User user)
    {
        // 🟢 FIX 1 : Inclusion de la colonne Telephone lors de la création
        var sql = @"INSERT INTO [User] (Nom, Prenom, Email, Telephone, PasswordHash, IsActive, CreatedAt, Role, Service)
        VALUES (@Nom, @Prenom, @Email, @Telephone, @PasswordHash, @IsActive, @CreatedAt, @Role, @Service);
        SELECT CAST(SCOPE_IDENTITY() AS int);";

        using var connection = new SqlConnection(_connectionString);
        return await connection.QuerySingleAsync<UserDto>(sql, user);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        using var connection = new SqlConnection(_connectionString);
        var sql = @"UPDATE [User] SET IsDeleted = 1, DeletedAt = GETDATE() WHERE Id = @Id";
        await connection.ExecuteAsync(sql, new { Id = id });

        return true;
    }

    public async Task<UserDto?> UpdateAsync(User user)
{
    using var connection = new SqlConnection(_connectionString);
    
    var sql = @"
        UPDATE [User] 
        SET Nom = @Nom, 
            Prenom = @Prenom, 
            Email = @Email, 
            Telephone = @Telephone, 
            Role = @Role, 
            Service = @Service,
            IsActive = @IsActive
        WHERE Id = @Id;

        SELECT 
            Id, 
            Nom, 
            Prenom, 
            Email, 
            Telephone, 
            CAST(Role AS NVARCHAR(50)) AS Role, 
            CAST(Service AS NVARCHAR(50)) AS Service, 
            IsActive 
        FROM [User] 
        WHERE Id = @Id;";

    return await connection.QueryFirstOrDefaultAsync<UserDto>(sql, user);
}
    public async Task<List<UserDto>> GetAllAsync()
{
    // 🟢 S'assurer que Telephone est bien sélectionné
    var sql = @"SELECT Id, Nom, Prenom, Email, Telephone, Role, Service, IsActive, CreatedAt 
                FROM [User] 
                WHERE IsDeleted = 0";

    using var connection = new SqlConnection(_connectionString);
    var users = await connection.QueryAsync<UserDto>(sql);
    return users.ToList();
}

   public async Task<UserDto?> GetByIdAsync(int id)
{
    // 🟢 SÉLECTION EXPLICITE DES COLONNES AVEC CONVERSION DE ROLE EN STRING
    var sql = @"
        SELECT 
            Id, 
            Nom, 
            Prenom, 
            Email, 
            Telephone, 
            CAST(Role AS NVARCHAR(50)) AS Role, 
            CAST(Service AS NVARCHAR(50)) AS Service, 
            IsActive, 
            CreatedAt, 
            IsDeleted, 
            DeletedAt, 
            VisitorId, 
            PasswordHash
        FROM [User] 
        WHERE Id = @Id AND IsDeleted = 0";

    using var connection = new SqlConnection(_connectionString);
    return await connection.QueryFirstOrDefaultAsync<UserDto>(sql, new { Id = id });
}

    public async Task<UserDto?> GetByEmailAsync(string email)
    {
        // 🟢 FIX 3 : Sélection directe de Telephone depuis [User]
        string sql = @"
            SELECT u.Id, u.Nom, u.Prenom, u.Email, u.Telephone, u.Role, u.Service, u.IsActive, u.CreatedAt, u.IsDeleted, u.DeletedAt,
                   u.VisitorId, u.PasswordHash
            FROM [User] u
            WHERE u.Email = @Email AND u.IsDeleted = 0";

        using var connection = new SqlConnection(_connectionString);
        return await connection.QueryFirstOrDefaultAsync<UserDto?>(sql, new { Email = email });
    }

    public async Task<List<UserDto>> GetDeletedAsync()
    {
        var sql = @"SELECT * FROM [User] WHERE IsDeleted = 1";
        using var connection = new SqlConnection(_connectionString);
        var user = await connection.QueryAsync<UserDto>(sql);
        return user.ToList(); 
    }

    public async Task<int> RestoreAsync(int id)
    {
        var sql = @"UPDATE [User]
            SET IsDeleted = 0,
                DeletedAt = NULL
            OUTPUT inserted.Id
            WHERE Id = @Id AND IsDeleted = 1";

        using var connection = new SqlConnection(_connectionString);
        return await connection.QueryFirstOrDefaultAsync<int>(sql, new { Id = id });
    }

    public async Task<UserDto?> GetDeletedByIdAsync(int id)
    {
        string sql = @"SELECT * FROM [User] WHERE Id = @Id AND IsDeleted = 1";
        using var connection = new SqlConnection(_connectionString);
        return await connection.QueryFirstOrDefaultAsync<UserDto>(sql, new { id });
    }

    public async Task<UserProfileDto> GetUserProfileAsync(int userId)
    {
        // 🟢 FIX 4 : Lecture de u.Telephone directement depuis [User]
        const string sql = @"
            SELECT 
                u.Id, 
                u.Nom, 
                u.Prenom, 
                u.Email, 
                u.Role, 
                u.Telephone 
            FROM [User] u
            WHERE u.Id = @UserId";

        try 
        {
            using var connection = new SqlConnection(_connectionString);
            var result = await connection.QueryFirstOrDefaultAsync<UserProfileDto>(sql, new { UserId = userId });
            return result!;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Erreur SQL: {ex.Message}");
            throw; 
        }
    }

    public async Task SaveResetTokenAsync(int userId, string token, DateTime expiry)
    {
        var sql = @"UPDATE [User] 
                    SET ResetPasswordToken = @Token, 
                        ResetPasswordTokenExpiry = @Expiry 
                    WHERE Id = @UserId";

        using var connection = new SqlConnection(_connectionString);
        await connection.ExecuteAsync(sql, new { Token = token, Expiry = expiry, UserId = userId });
    }

    public async Task<UserDto?> GetByResetTokenAsync(string email, string token)
    {
        var sql = @"SELECT * FROM [User] 
                    WHERE Email = @Email 
                    AND ResetPasswordToken = @Token 
                    AND ResetPasswordTokenExpiry > GETDATE()
                    AND IsDeleted = 0";

        using var connection = new SqlConnection(_connectionString);
        return await connection.QueryFirstOrDefaultAsync<UserDto>(sql, new { Email = email, Token = token });
    }

    public async Task UpdatePasswordAsync(int userId, string newPasswordHash)
    {
        var sql = @"UPDATE [User] 
                    SET PasswordHash = @PasswordHash, 
                        ResetPasswordToken = NULL, 
                        ResetPasswordTokenExpiry = NULL 
                    WHERE Id = @UserId";

        using var connection = new SqlConnection(_connectionString);
        await connection.ExecuteAsync(sql, new { PasswordHash = newPasswordHash, UserId = userId });
    }

   public async Task<List<UserDto>> GetAgentsByServiceAsync(string service)
{
    // 1. Dictionnaire de secours pour les services historiques
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

    const string sql = @"
        SELECT Id, Nom, Prenom, CAST(Service AS NVARCHAR(50)) AS Service, CAST(Role AS NVARCHAR(50)) AS Role, Email, Telephone 
        FROM [User] 
        WHERE IsDeleted = 0";

    using var connection = new SqlConnection(_connectionString);
    var allUsers = await connection.QueryAsync<UserDto>(sql);

    // 🟢 Filtrage tolérant : gère le code Enum (1, 2...), le nom d'origine et les nouveaux services texte
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