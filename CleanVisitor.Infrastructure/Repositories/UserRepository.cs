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
        _connectionString=configuration.GetConnectionString("DefaultConnection")!;
    }
    public async Task<UserDto>AddAsync(User user)
    {
        var sql=@"INSERT INTO [User] (Nom, Prenom, Email, PasswordHash, IsActive, CreatedAt, Role)
        VALUES (@Nom, @Prenom, @Email, @PasswordHash, @IsActive, @CreatedAt, @Role);
        SELECT CAST(SCOPE_IDENTITY() AS int);";
        using var connection= new SqlConnection(_connectionString);
        return await connection.QuerySingleAsync<UserDto>(sql, user);
    }
    public async Task<bool> DeleteAsync(int id)
{
    using var connection = new SqlConnection(_connectionString);
    {
        // 1. On fait le Soft Delete
        var sql = @"UPDATE [User] SET IsDeleted = 1, DeletedAt = GETDATE() WHERE Id = @Id";
        await connection.ExecuteAsync(sql, new { Id = id });

        // 2. On récupère l'utilisateur mis à jour pour le renvoyer
        var sqlSelect = "SELECT * FROM [User] WHERE Id = @Id";
         await connection.QueryFirstOrDefaultAsync<bool>(sqlSelect, new { Id = id });
         return true;
    }
}
        
    public async Task<UserDto?>UpdateAsync(User user)
    {
        using var connection=new SqlConnection(_connectionString);
    
    {
        var sql=@"UPDATE [User] 
        SET Nom=@Nom, 
        Prenom=@Prenom, 
        Email=@Email, 
        Role=@Role, IsActive=@IsActive, 
        CreatedAt=@CreatedAt,
        PasswordHash=@PasswordHash
        WHERE Id=@Id;";
        return await connection.QueryFirstOrDefaultAsync<UserDto>(sql, user);
    }
    }
    public async Task<List<UserDto>> GetAllAsync()
    {
        var sql=@"SELECT * FROM[User]
        WHERE IsDeleted=0";
        using var connection=new SqlConnection(_connectionString);
var user = await connection.QueryAsync<UserDto>(sql);
return user.ToList();
    }
    public async Task<UserDto?>GetByIdAsync(int id)
    {
        var sql=@"SELECT *
        FROM [User]
        WHERE Id=@Id AND IsDeleted=0";
        using var connection=new SqlConnection(_connectionString);
        return await connection.QueryFirstOrDefaultAsync<UserDto>(sql, new {Id=id});
    }
    public async Task<User?> GetByEmailAsync(string email)
        {

                string sql = @"SELECT * FROM [User] WHERE [Email] = @Email AND IsDeleted=0";
                using (var connection = new SqlConnection(_connectionString))
                
                return await connection.QueryFirstOrDefaultAsync<User?>(sql, new { email});
            }
            public async Task<List<UserDto>> GetDeletedAsync()
         {
            var sql = @"SELECT * FROM [User]
                    WHERE IsDeleted = 1";
                    using var connection = new SqlConnection(_connectionString);

            var user= await connection.QueryAsync<UserDto>(sql);
                        return user.ToList(); 
         }
         public async Task<int> RestoreAsync(int id)
        {
          var sql = @"UPDATE [User]
            SET IsDeleted = 0,
            DeletedAt = NULL
            OUTPUT inserted.*
            WHERE Id = @Id AND IsDeleted=1";
        using var connection = new SqlConnection(_connectionString);
     return await connection.QueryFirstOrDefaultAsync<int>(sql, new { Id = id });
        }
        public async Task<UserDto?> GetDeletedByIdAsync(int id)
    {

        // Requête SQL brute (Sécurisée contre les injections grâce aux paramètres @id)
        string sql = @"SELECT * 
                FROM [User] 
                WHERE Id = @Id AND IsDeleted = 1";
             using var connection = new SqlConnection(_connectionString);

        // Dapper mappe automatiquement les colonnes vers les propriétés de l'objet User
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
            u.Role, -- Vérifier si c'est un Int ou String en base
            v.Telephone 
        FROM [User] u
        LEFT JOIN Visitors v ON u.Email = v.Email
        WHERE u.Id = @UserId";

    try 
    {
        using var connection = new SqlConnection(_connectionString);
        // Utiliser QuerySingleOrDefaultAsync pour éviter les erreurs si l'ID n'existe pas
        var result = await connection.QueryFirstOrDefaultAsync<UserProfileDto>(sql, new { UserId = userId });
        return result;
    }
    catch (Exception ex)
    {
        // Si ça plante ici, il verra l'erreur dans sa console
        Console.WriteLine($"Erreur SQL: {ex.Message}");
        throw; 
    }
}
}