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
    var sql = @"
        INSERT INTO Visit (Motif, Date, HeureDepart, HeureArriver, Statut, Service, IdVisitor) 
        OUTPUT INSERTED.*
        VALUES (@Motif, @Date, @HeureDepart, @HeureArriver, @Statut, @Service, @IdVisitor);
        SELECT CAST(SCOPE_IDENTITY() as int);";
    using (var connection = new SqlConnection(_connectionString))
    {
         return await connection.QuerySingleAsync<VisitDto>(sql, visit);
    }
}

        public async Task<VisitDto?> GetByIdAsync(int id)
        {

                string sql = @"SELECT 
                [Id], 
                [Motif], 
                [Date], 
                CAST([HeureDepart] AS TIME) AS HeureDepart, 
                CAST([HeureArriver] AS TIME) AS HeureArriver, 
                [Statut],
                [Service]
               FROM [Visit] 
               WHERE [Id] = @Id";
                using (var connection = new SqlConnection(_connectionString))
                
                return await connection.QueryFirstOrDefaultAsync<VisitDto?>(sql, new { Id = id });
            }
        
       public async Task<List<VisitDto?>> GetAllAsync()
{
    var sql = @"SELECT Motif As Motif, Date As Date, HeureDepart As HeureDepart, HeureArriver As HeureArriver, Statut As Statut, Service As Service
     FROM [Visit]";
    using var connection = new SqlConnection(_connectionString);
    var visit= await connection.QueryAsync<VisitDto?>(sql);
    return visit.ToList();

}

       public async Task<Visit?> DeleteAsync(int id)
{
    const string sql = @"DELETE FROM Visit WHERE Id = @Id";

    using var connection = new SqlConnection(_connectionString);
    
     return await connection.QueryFirstOrDefaultAsync<Visit?>(sql, new { Id = id });
     }

     public async Task<VisitDto?>GetByDateAsync(DateTime Date)
    {
        using var connection = new SqlConnection(_connectionString);
        string sql=@"SELECT Motif, Date, HeureDepart, HeureArriver, Statut, Service
        FROM Visit
        WHERE Date=@Date;";
        return await connection.QueryFirstOrDefaultAsync<VisitDto?>(sql, new{Date=Date});
    }
    
    public async Task<VisitDto?>UpdateAsync(Visit visit)
    {
        using var connection = new SqlConnection(_connectionString);
        {
            string sql= @"UPDATE [Visit] SET Motif=@Motif, Date=@Date, HeureDepart=@HeureDepart, HeureArriver=@HeureArriver, Statut=@Statut, Service=@Service, Id  WHERE Id=@Id";
            return await connection.QueryFirstOrDefaultAsync<VisitDto?>(sql, visit);
            
        }
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

    }