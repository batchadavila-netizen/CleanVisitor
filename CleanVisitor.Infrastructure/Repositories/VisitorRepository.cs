using System.Data;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using Dapper;
using CleanVisitor.Application.Features.Visitors.Interfaces;
using CleanVisitor.Application.Features.Visitors.Dtos.StatJourDto;
using CleanVisitor.Application.Features.Visitors.Dtos.StatMoisDto;
using CleanVisitor.Application.Features.Visitors.Dtos.StatAnneeDto;
using CleanVisitor.Features.Visitors.Dtos.VisitCloneDto;
using CleanVisitor.Application.Features.Visitors.Dtos.VisitorVisitDto;
using CleanVisitor.Application.Features.Visitors.Dtos;
using CleanVisitor.Features.Visitors.Querries.GetVisitorJour;
using CleanVisitor.Core.Entities;
using CleanVisitor.Infrastructure.Data;

namespace CleanVisitor.Infrastructure.Repositories;


public class VisitorRepository :IVisitorRepository
{
    private readonly string _connectionString;


    public VisitorRepository(IConfiguration configuration)
    {
        _connectionString = configuration.GetConnectionString("DefaultConnection")!;
    }
    
       public async Task<VisitorDto?> AddAsync(Visitor visitor)
{
    var sql = @"
        INSERT INTO Visitors (Nom, Telephone, Email, DateEnregistrement) 
        OUTPUT INSERTED.*
        VALUES (@Nom, @Telephone, @Email, @DateEnregistrement);
        SELECT CAST(SCOPE_IDENTITY() as int);";
    using (var connection = new SqlConnection(_connectionString))
    {
         return await connection.QuerySingleAsync<VisitorDto?>(sql, visitor);
    }
}

        public async Task<Visitor?> GetByIdAsync(int id)
        {

                string sql = @"SELECT * FROM [Visitors] WHERE [Id] = @Id AND IsDeleted=0";
                using (var connection = new SqlConnection(_connectionString))
                
                return await connection.QueryFirstOrDefaultAsync<Visitor?>(sql, new { Id = id });
            }
        
       public async Task<List<Visitor>> GetAllAsync()
{
    var sql = @"SELECT * FROM [Visitors]
    WHERE IsDeleted=0";
    using var connection = new SqlConnection(_connectionString);
    var visitor= await connection.QueryAsync<Visitor>(sql);
    return visitor.ToList();

}

       public async Task<bool> DeleteAsync(int id)
{
    using var connection = new SqlConnection(_connectionString);
    // Pas besoin d'accolades supplémentaires après 'using var' en C# moderne
    
    // 1. On exécute l'UPDATE pour le Soft Delete
    var sql = @"UPDATE [Visitors] 
                SET IsDeleted = 1, 
                    DeletedAt = GETDATE() 
                WHERE Id = @Id";
    
    // On récupère le nombre de lignes modifiées
    var rowsAffected = await connection.ExecuteAsync(sql, new { Id = id });

    // 2. On retourne true si au moins une ligne a été mise à jour
    return rowsAffected > 0;
}
    public async Task<VisitorDto?>UpdateAsync(Visitor visitor)
    {
        using var connection = new SqlConnection(_connectionString);
        {
            string sql= @"UPDATE VISITORS SET Nom=@Nom, Telephone=@Telephone, Email=@Email,  WHERE Id=@Id";
            return await connection.QueryFirstOrDefaultAsync<VisitorDto?>(sql, visitor);
            
        }
    }
 public  async Task<VisitorVisitDto?>GetVisitorVisitAsync(int Id)
    {
        using var connection=new SqlConnection(_connectionString);
        {
            VisitorVisitDto? visitorDto = null;
            
       var sql = @"SELECT vi.Nom, vi.Telephone, vi.Email, vi.DateEnregistrement, 
            v.Motif, v.Date, v.HeureDepart, v.HeureArriver, v.Statut, v.Service
            FROM Visitors vi
            INNER JOIN Visit v ON vi.Id = v.IdVisitor
            WHERE vi.Id = @Id";
        
        await connection.QueryAsync<VisitorVisitDto, VisitClonDto, VisitorVisitDto?>(
        sql,
        (visitorVisit, visitClon) => {
            if (visitorDto == null) {
                visitorDto = visitorVisit;
                visitorDto.ListVisitClon = new List<VisitClonDto>();
            }
            if (visitClon != null) {
                visitorDto.ListVisitClon.Add(visitClon);
                return null;
            }
            return visitorVisit;
        },
        new { Id = Id },
        splitOn: "Motif" // On dit à Dapper : "À partir de la colonne Motif, c'est la table Visit"
    );

    return visitorDto;
}
        }
        public async Task<List<StatJourDto>> GetVisitorJourAsync()
    {
        using var connection= new SqlConnection(_connectionString);
        {
            var sql= @"SELECT CAST (DateEnregistrement AS DATE) AS DateJour,
            COUNT(*) AS TotalVisitorJour
            FROM[Visitors]
            GROUP BY DateEnregistrement; ";
            var statistique=await connection.QueryAsync<StatJourDto>(sql);
            return statistique.ToList();
        }
    }
    public async Task<List<StatMoisDto>> GetVisitorMoisAsync()
    {
        using var connection=new SqlConnection(_connectionString);
        {
            var sql=@"SELECT MONTH (DateEnregistrement) AS Mois,
            COUNT(*) AS TotalVisitor
            FROM[Visitors]
            GROUP BY MONTH(DateEnregistrement)
            ORDER BY Mois;";
            var stat=await connection.QueryAsync<StatMoisDto>(sql);
            return stat.ToList();
        }
    }
    public async Task<List<StatAnneeDto>> GetVisitorAnneeAsync()
    {
        using var connection=new SqlConnection(_connectionString);
        {
            var sql=@"SELECT YEAR (DateEnregistrement) AS Annee,
            COUNT(*) AS TotalVisitor
            FROM[Visitors]
            GROUP BY YEAR(DateEnregistrement)
            ORDER BY Annee;";
            var stat=await connection.QueryAsync<StatAnneeDto>(sql);
            return stat.ToList();
        }
    }
        public async Task<List<VisitorDto>> GetDeletedAsync()
         {
            var sql = @"SELECT * FROM [Visitors]
                    WHERE IsDeleted = 1";
                    using var connection = new SqlConnection(_connectionString);

            var visitors= await connection.QueryAsync<VisitorDto>(sql);
                        return visitors.ToList(); 
         }
public async Task<int> RestoreAsync(int id)
        {
          var sql = @"UPDATE [Visitors]
            SET IsDeleted = 0,
            DeletedAt = NULL
            OUTPUT inserted.*
            WHERE Id = @Id AND IsDeleted=1";
        using var connection = new SqlConnection(_connectionString);
     return await connection.QueryFirstOrDefaultAsync<int>(sql, new { Id = id });
        }
        public async Task<VisitorDto?> GetDeletedByIdAsync(int id)
    {

        // Requête SQL brute (Sécurisée contre les injections grâce aux paramètres @id)
        string sql = "SELECT * FROM Visitors WHERE Id = @id AND IsDeleted = 1";
             using var connection = new SqlConnection(_connectionString);

        // Dapper mappe automatiquement les colonnes vers les propriétés de l'objet User
        return await connection.QueryFirstOrDefaultAsync<VisitorDto>(sql, new { id });
    }
    }
