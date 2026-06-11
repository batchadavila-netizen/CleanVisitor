using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using Dapper;
using CleanVisitor.Application.Features.Notifications.Interfaces;
using CleanVisitor.Application.Features.Notifications.Interfaces.IRealTimeNotificationService;
using CleanVisitor.Core.Entities.Notification;
using System.Data;

public class NotificationRepository : INotificationService
{
    private readonly string _connectionString;
    private readonly IRealTimeNotificationService _signalRService;

    // On retire IEmailService car l'envoi se fait maintenant dans les Handlers
    public NotificationRepository(IConfiguration configuration, IRealTimeNotificationService signalRService)
    {
        _connectionString = configuration.GetConnectionString("DefaultConnection")!;
        _signalRService = signalRService;
        
    }

    // Version simplifiée avec Dapper (puisque tu l'as déjà importé)
    public async Task AddAsync(Notification notification)
{
    using var connection = new SqlConnection(_connectionString);
    
    // Ajout de ReceiverRole dans les colonnes et les valeurs
    var sql = @"INSERT INTO Notifications (Message, DateEnvoi, IsRead, IdVisitor, Type, ReceiverRole) 
                VALUES (@Message, @DateEnvoi, @IsRead, @IdVisitor, @Type, @ReceiverRole)";
    
    // Dapper va maintenant envoyer la valeur de notification.ReceiverRole
    await connection.ExecuteAsync(sql, notification);
}
    // Cette méthode peut servir à l'Admin pour voir TOUT l'historique
    public async Task<IEnumerable<Notification>> GetAllAsync()
    {
        using var connection = new SqlConnection(_connectionString);
        const string sql = "SELECT * FROM Notifications ORDER BY DateEnvoi DESC";
        return await connection.QueryAsync<Notification>(sql);
    }
    public async Task<IEnumerable<Notification>> GetAdminNotificationsAsync()
    {
         using var connection = new SqlConnection(_connectionString);
        // Requête SQL directe avec Dapper
        string sql = "SELECT * FROM Notifications WHERE ReceiverRole = 'Admin'";
        return await connection.QueryAsync<Notification>(sql);
    }

   // CleanVisitor.Infrastructure/Repositories/NotificationRepository.cs

public async Task<IEnumerable<Notification>> GetByVisitorIdAsync(int userId)
{
    // On joint la table Users pour faire le pont entre l'ID 40 et l'ID 1012
    string sql = @"
        SELECT n.* 
        FROM Notifications n
        INNER JOIN [User] u ON n.IdVisitor = u.VisitorId
        WHERE u.Id = @UserId
        ORDER BY n.DateEnvoi DESC";

    using var connection = new SqlConnection(_connectionString);
    {
        // On passe l'Id de l'utilisateur (40) et Dapper fera le reste
        return await connection.QueryAsync<Notification>(sql, new { UserId = userId });
    }
}
}