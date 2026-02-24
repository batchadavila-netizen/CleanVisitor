using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using Dapper;
using CleanVisitor.Core.Entities.User;
using CleanVisitor.Application.Features.Users.Dtos;
using CleanVisitor.Application.Features.Users.Interfaces;
namespace CleanVisitor.Infrastructure.Repositories;
public class UserRepository : IUserRepository
{
    private readonly string _connectionString;
    public UserRepository(IConfiguration configuration)
    {
        _connectionString=configuration.GetConnectionString("DefaultConnection")!;
    }
    public async Task<UserDto?>AddAsync(User user)
    {
        var sql=@"INSERT INTO [User] (Nom, Prenom, Email, PasswordHash, Role, IsActive, CreatedAt)
        VALUES (@Nom, @Prenom, @Email, @PasswordHash, @Role, @IsActive, @CreatedAt);
        SELECT CAST(SCOPE_IDENTITY() AS int);";
        using var connection= new SqlConnection(_connectionString);
        return await connection.QuerySingleAsync<UserDto>(sql, user);
    }
    public async Task<UserDto?> DeleteAsync(int id)
{
    using var connection = new SqlConnection(_connectionString);
    {
        // 1. On fait le Soft Delete
        var sql = "UPDATE [User] SET IsDeleted = 1, DeletedAt = GETDATE() WHERE Id = @Id AND IsDeleted = 0";
        await connection.ExecuteAsync(sql, new { Id = id });

        // 2. On récupère l'utilisateur mis à jour pour le renvoyer
        var sqlSelect = "SELECT * FROM [User] WHERE Id = @Id";
        return await connection.QueryFirstOrDefaultAsync<UserDto>(sqlSelect, new { Id = id });
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
        var sql=@"SELECT 
        Nom AS Nom, 
        Prenom AS Prenom, 
        Email AS Email, 
        Role AS Role, 
        IsActive AS IsActive, 
        CreatedAt AS CreatedAt,
        PasswordHash AS PasswordHash
        FROM [User]
        WHERE IsDeleted=0";
        using var connection=new SqlConnection(_connectionString);
var user = await connection.QueryAsync<UserDto>(sql);
return user.ToList();
    }
    public async Task<UserDto?>GetByIdAsync(int id)
    {
        var sql=@"SELECT Id, Nom, Prenom, Email, PasswordHash, Role, IsActive, CreatedAt
        FROM [User]
        WHERE Id=@Id AND IsDeleted=0";
        using var connection=new SqlConnection(_connectionString);
        return await connection.QueryFirstOrDefaultAsync<UserDto>(sql, new {Id=id});
    }
    public async Task<UserDto?>GetByEmailAsync(string email)
    {
        var sql=@"SELECT Id AS Id, Nom AS Nom, Prenom AS Prenom, Email AS Email, PasswordHash AS PasswordHash, Role As Role, IsActive AS IsActive, CreatedAt AS CreatedAt
        FROM [User]
        WHERE Email=@Email";
        using var connection=new SqlConnection(_connectionString);
        return await connection.QueryFirstOrDefaultAsync<UserDto>(sql, new{Email=email});
    }
}