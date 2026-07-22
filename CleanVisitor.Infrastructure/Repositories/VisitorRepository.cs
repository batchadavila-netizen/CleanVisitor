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
    using var connection = new SqlConnection(_connectionString);
    
    // 1. Insérer le visiteur dans la table Visitors
    var sqlInsert = @"
        INSERT INTO Visitors (Nom, Telephone, Email, DateEnregistrement, DateCreation, IsDeleted)
        VALUES (@Nom, @Telephone, @Email, @DateEnregistrement, GETDATE(), 0);
        SELECT CAST(SCOPE_IDENTITY() AS int);";
    
    var newVisitorId = await connection.QuerySingleAsync<int>(sqlInsert, visitor);

    // 2. Lier le visiteur à l'User via son Email
    var sqlUpdate = @"UPDATE [User] SET VisitorId = @VisitorId WHERE Email = @Email";
    await connection.ExecuteAsync(sqlUpdate, new { VisitorId = newVisitorId, Email = visitor.Email });

    // 3. Retourner le visiteur créé
    var sqlSelect = "SELECT * FROM Visitors WHERE Id = @Id";
    return await connection.QueryFirstOrDefaultAsync<VisitorDto>(sqlSelect, new { Id = newVisitorId });
}

       public async Task<Visitor?> GetByIdAsync(int id)
{
    string sql = @"
        SELECT v.Id, v.Nom, v.Telephone, v.Email, v.DateEnregistrement, v.IsDeleted, v.DeletedAt,
               u.Prenom
        FROM [Visitors] v
        LEFT JOIN [User] u ON u.VisitorId = v.Id
        WHERE v.Id = @Id AND v.IsDeleted = 0";

    using var connection = new SqlConnection(_connectionString);
    return await connection.QueryFirstOrDefaultAsync<Visitor>(sql, new { Id = id });
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
   public async Task<VisitorDto?> UpdateAsync(Visitor visitor)
{
    using var connection = new SqlConnection(_connectionString);

    // 1. Mise à jour dynamique de Visitors
    var visitorUpdates = new List<string>();
    var parameters = new DynamicParameters();
    parameters.Add("Id", visitor.Id);

    if (!string.IsNullOrEmpty(visitor.Nom))
    {
        visitorUpdates.Add("Nom = @Nom");
        parameters.Add("Nom", visitor.Nom);
    }
    if (!string.IsNullOrEmpty(visitor.Telephone))
    {
        visitorUpdates.Add("Telephone = @Telephone");
        parameters.Add("Telephone", visitor.Telephone);
    }
    if (!string.IsNullOrEmpty(visitor.Email))
    {
        visitorUpdates.Add("Email = @Email");
        parameters.Add("Email", visitor.Email);
    }

    if (visitorUpdates.Count > 0)
    {
        string sqlVisitor = $"UPDATE Visitors SET {string.Join(", ", visitorUpdates)} WHERE Id = @Id";
        await connection.ExecuteAsync(sqlVisitor, parameters);
    }

    // 2. Mise à jour dynamique de [User]
    var userUpdates = new List<string>();
    var userParameters = new DynamicParameters();
    userParameters.Add("Id", visitor.Id);

    if (!string.IsNullOrEmpty(visitor.Email))
    {
        userUpdates.Add("Email = @Email");
        userParameters.Add("Email", visitor.Email);
    }
    if (!string.IsNullOrEmpty(visitor.Prenom))
    {
        userUpdates.Add("Prenom = @Prenom");
        userParameters.Add("Prenom", visitor.Prenom);
    }
    if (!string.IsNullOrEmpty(visitor.Nom))
    {
        userUpdates.Add("Nom = @Nom");
        userParameters.Add("Nom", visitor.Nom);
    }
    if (!string.IsNullOrEmpty(visitor.Password))
    {
        // Hash du mot de passe avant sauvegarde
        userUpdates.Add("PasswordHash = @PasswordHash");
        userParameters.Add("PasswordHash", BCrypt.Net.BCrypt.HashPassword(visitor.Password));
    }

    if (userUpdates.Count > 0)
    {
        string sqlUser = $"UPDATE [User] SET {string.Join(", ", userUpdates)} WHERE VisitorId = @Id";
        await connection.ExecuteAsync(sqlUser, userParameters);
    }

    // 3. Retourner le visiteur mis à jour
    var sqlSelect = "SELECT * FROM Visitors WHERE Id = @Id";
    return await connection.QueryFirstOrDefaultAsync<VisitorDto>(sqlSelect, new { visitor.Id });
}
public async Task<VisitorVisitDto?> GetVisitorVisitAsync(int Id)
{
    using var connection = new SqlConnection(_connectionString);
    
    // On garde une trace du visiteur unique
    VisitorVisitDto? visitorDto = null;

    var sql = @"
    SELECT 
        vi.Nom, vi.Telephone, vi.Email, vi.DateEnregistrement, 
        v.Id, v.IdVisitor, v.Motif, v.Date, v.HeureDepart, v.HeureArriver, v.Statut, v.Service
    FROM Visitors vi
    INNER JOIN Visit v ON vi.Id = v.IdVisitor
    WHERE vi.Id = @Id AND v.IsDeleted = 0";

    await connection.QueryAsync<VisitorVisitDto, VisitClonDto, VisitorVisitDto>(
        sql,
        (visitor, visit) => 
        {
            // Initialisation du parent au premier passage
            if (visitorDto == null) 
            {
                visitorDto = visitor;
                visitorDto.ListVisitClon = new List<VisitClonDto>();
            }
            
            // Ajout de la visite à la liste du parent
            if (visit != null) 
            {
                visitorDto.ListVisitClon.Add(visit);
            }
            
            return visitor; // Dapper attend un retour, mais on utilise surtout visitorDto
        },
        new { Id = Id },
        splitOn: "Motif" 
    );

    return visitorDto;
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
        public async Task LinkVisitorToUserAsync(string email, int visitorId)
{
    // 1. Ta requête SQL pour mettre à jour la colonne VisitorId de l'User via son Email
    const string sql = @"
        UPDATE [User]
        SET VisitorId = @VisitorId 
        WHERE Email = @Email";

    using var connection = new SqlConnection(_connectionString);
    await connection.ExecuteAsync(sql, new { 
        VisitorId = visitorId, 
        Email = email 
    });
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