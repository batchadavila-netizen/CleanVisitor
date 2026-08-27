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
        // 🟢 AJOUT : Prise en compte du champ Service lors de la création
        var sql = @"INSERT INTO [User] (Nom, Prenom, Email, PasswordHash, IsActive, CreatedAt, Role, Service)
        VALUES (@Nom, @Prenom, @Email, @PasswordHash, @IsActive, @CreatedAt, @Role, @Service);
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
        
        // 🟢 AJOUT : Prise en compte du champ Service lors de la mise à jour
        var sql = @"UPDATE [User] 
        SET Nom = @Nom, 
            Prenom = @Prenom, 
            Email = @Email, 
            Role = @Role, 
            Service = @Service,
            IsActive = @IsActive, 
            CreatedAt = @CreatedAt,
            PasswordHash = @PasswordHash
        WHERE Id = @Id;";

        return await connection.QueryFirstOrDefaultAsync<UserDto>(sql, user);
    }

    public async Task<List<UserDto>> GetAllAsync()
    {
        var sql = @"SELECT * FROM [User] WHERE IsDeleted = 0";
        using var connection = new SqlConnection(_connectionString);
        var user = await connection.QueryAsync<UserDto>(sql);
        return user.ToList();
    }

    public async Task<UserDto?> GetByIdAsync(int id)
    {
        var sql = @"SELECT * FROM [User] WHERE Id = @Id AND IsDeleted = 0";
        using var connection = new SqlConnection(_connectionString);
        return await connection.QueryFirstOrDefaultAsync<UserDto>(sql, new { Id = id });
    }

    public async Task<UserDto?> GetByEmailAsync(string email)
    {
        // 🟢 CORRECTION CLEF : Ajout de u.Service dans la sélection SQL !
        string sql = @"
            SELECT u.Id, u.Nom, u.Prenom, u.Email, u.Role, u.Service, u.IsActive, u.CreatedAt, u.IsDeleted, u.DeletedAt,
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
        const string sql = @"
            SELECT 
                u.Id, 
                u.Nom, 
                u.Prenom, 
                u.Email, 
                u.Role, 
                v.Telephone 
            FROM [User] u
            LEFT JOIN Visitors v ON u.Email = v.Email
            WHERE u.Id = @UserId";

        try 
        {
            using var connection = new SqlConnection(_connectionString);
            var result = await connection.QueryFirstOrDefaultAsync<UserProfileDto>(sql, new { UserId = userId });
            return result;
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
    // Mapping souple des identifiants et libellés du Service Financier
    var serviceMapping = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
    {
        { "Direction", "1" }, { "1", "1" },
        { "Service RH", "2" }, { "Service_RH", "2" }, { "ServiceRH", "2" }, { "2", "2" },
        { "Service Financier", "3" }, { "Service_Financier", "3" }, { "ServiceFinancier", "3" }, { "3", "3" },
        { "Service Informatique", "4" }, { "Service_Informatique", "4" }, { "ServiceInformatique", "4" }, { "4", "4" },
        { "Secrétariat", "5" }, { "Secretariat", "5" }, { "5", "5" }
    };

    string targetCode = serviceMapping.TryGetValue(service, out var code) ? code : service;

    const string sql = @"
        SELECT Id, Nom, Prenom, Service, Role, Email 
        FROM [User] 
        WHERE IsDeleted = 0";

    using var connection = new SqlConnection(_connectionString);
    var allUsers = await connection.QueryAsync<UserDto>(sql);

    // Filtrage insensible à la casse et tolérant aux Enums (ID "3" vs "Service Financier")
    return allUsers.Where(u => 
        // 1. Vérification du Rôle Agent
        (string.Equals(u.Role, "2", StringComparison.OrdinalIgnoreCase) || 
         string.Equals(u.Role, "Agent", StringComparison.OrdinalIgnoreCase)) &&
        
        // 2. Vérification du Service
        (string.Equals(u.Service, service, StringComparison.OrdinalIgnoreCase) || 
         string.Equals(u.Service, targetCode, StringComparison.OrdinalIgnoreCase) ||
         (serviceMapping.TryGetValue(u.Service ?? "", out var uCode) && uCode == targetCode))
    ).ToList();
}
}