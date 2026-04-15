using System.Data;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using Dapper;
using CleanVisitor.Application.Features.Visite.Interfaces;
using CleanVisitor.Application.Features.Visite.Dtos.ServiceDto;
using CleanVisitor.Application.Features.Visite.Dtos;
using CleanVisitor.Core.Entities.Visits;
using CleanVisitor.Infrastructure.Data;

namespace CleanVisitor.Infrastructure.Repositories;


public class VisitRepository :IVisitRepository
{
    private readonly string _connectionString;


    public VisitRepository(IConfiguration configuration)
    {
        _connectionString = configuration.GetConnectionString("DefaultConnection")!;
    }
    
       public async Task<VisitDto> AddAsync(Visit visit)
{
    // On enlève le SCOPE_IDENTITY car OUTPUT INSERTED fait déjà le travail
    var sql = @"
        INSERT INTO Visit (Motif, Date, HeureDepart, HeureArriver, Statut, Service, IdVisitor, IsDeleted) 
        OUTPUT INSERTED.*
        VALUES (@Motif, @Date, @HeureDepart, @HeureArriver, @Statut, @Service, @IdVisitor, 0);";
        
    using (var connection = new SqlConnection(_connectionString))
    {
        return await connection.QuerySingleAsync<VisitDto>(sql, visit);
    }
}

public async Task<VisitDto?> UpdateAsync(Visit visit)
{
    using var connection = new SqlConnection(_connectionString);
    // Correction de la virgule et du WHERE
    string sql = @"UPDATE [Visit] 
                   SET Motif=@Motif, Date=@Date, HeureDepart=@HeureDepart, 
                       HeureArriver=@HeureArriver, Statut=@Statut, Service=@Service 
                   WHERE Id=@Id;
                   SELECT * FROM [Visit] WHERE Id=@Id;";
                   
    return await connection.QueryFirstOrDefaultAsync<VisitDto>(sql, visit);
}

        public async Task<VisitDto?> GetByIdAsync(int id)
        {

                string sql = @"SELECT *
               FROM [Visit] 
               WHERE [Id] = @Id AND IsDeleted=0";
                using (var connection = new SqlConnection(_connectionString))
                
                return await connection.QueryFirstOrDefaultAsync<VisitDto?>(sql, new { Id = id });
            }
       public async Task<List<VisitDto?>> GetAllAsync()
{
    var sql = @"SELECT *
     FROM [Visit]
     WHERE IsDeleted=0";
    using var connection = new SqlConnection(_connectionString);
    var visit= await connection.QueryAsync<VisitDto?>(sql);
    return visit.ToList();

}
      public async Task<bool> DeleteAsync(int id)
{
    using var connection = new SqlConnection(_connectionString);
    {
        // 1. On fait le Soft Delete
        var sql = @"UPDATE [Visit] SET IsDeleted = 1, DeletedAt = GETDATE() WHERE Id = @Id";
        await connection.ExecuteAsync(sql, new { Id = id });

        // 2. On récupère l'utilisateur mis à jour pour le renvoyer
        var sqlSelect = "SELECT * FROM [Visit] WHERE Id = @Id";
         await connection.QueryFirstOrDefaultAsync<bool>(sqlSelect, new { Id = id });
         return true;
    }
}

     public async Task<VisitDto?>GetByDateAsync(DateTime Date)
    {
        using var connection = new SqlConnection(_connectionString);
        string sql=@"SELECT *
        FROM Visit
        WHERE Date=@Date;";
        return await connection.QueryFirstOrDefaultAsync<VisitDto?>(sql, new{Date=Date});
    }
    public async Task<List<ServiceDto>>GetVisitCountByServiceStatutAsync()
        {
        using var connection=new SqlConnection(_connectionString);
        {
            var sql=@"SELECT Service AS Service, Statut AS Statut,
             COUNT(*) AS Total_visit
            FROM [Visit]
            GROUP BY Service, Statut;";
            var service=await connection.QueryAsync<ServiceDto>(sql);
            return service.ToList();
        }
        }
        public async Task<List<VisitDto>> GetDeletedAsync()
         {
            var sql = @"SELECT * FROM [Visit]
                    WHERE IsDeleted = 1";
                    using var connection = new SqlConnection(_connectionString);

            var user= await connection.QueryAsync<VisitDto>(sql);
                        return user.ToList(); 
         }
public async Task<int> RestoreAsync(int id)
        {
          var sql = @"UPDATE [Visit]
            SET IsDeleted = 0,
            DeletedAt = NULL
            OUTPUT inserted.*
            WHERE Id = @Id AND IsDeleted=1";
        using var connection = new SqlConnection(_connectionString);
     return await connection.QueryFirstOrDefaultAsync<int>(sql, new { Id = id });
        }
        public async Task<VisitDto?> GetDeletedByIdAsync(int id)
    {

        // Requête SQL brute (Sécurisée contre les injections grâce aux paramètres @id)
        string sql = "SELECT * FROM Visit WHERE Id = @id AND IsDeleted = 1";
             using var connection = new SqlConnection(_connectionString);

        // Dapper mappe automatiquement les colonnes vers les propriétés de l'objet User
        return await connection.QueryFirstOrDefaultAsync<VisitDto>(sql, new { id });
    }
    public async Task<bool> UpdateStatusAsync(int id, int newStatus)
{
    // On met à jour le statut (1=En attente, 2=Terminé/Validé, 3=Annulé)
    const string sql = @"UPDATE [Visit] SET Statut = @Statut WHERE Id = @Id";
    
    using var connection = new SqlConnection(_connectionString);
    var rowsAffected = await connection.ExecuteAsync(sql, new { Statut = newStatus, Id = id });
    
    return rowsAffected > 0;
}
// Dans VisitRepository.cs
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
        FROM Visites v 
        INNER JOIN Visiteurs vt ON v.IdVisitor = vt.Id
        WHERE v.IsDeleted = 0";

    return await connection.QueryAsync<VisitDetailsDto>(sql);
}
    }