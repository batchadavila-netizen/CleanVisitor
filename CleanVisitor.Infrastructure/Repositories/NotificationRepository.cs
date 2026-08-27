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

    public NotificationRepository(IConfiguration configuration, IRealTimeNotificationService signalRService)
    {
        _connectionString = configuration.GetConnectionString("DefaultConnection")!;
        _signalRService = signalRService;
    }

    public async Task AddAsync(Notification notification)
    {
        using var connection = new SqlConnection(_connectionString);
        
        var sql = @"INSERT INTO Notifications (Message, DateEnvoi, IsRead, IdVisitor, Type, ReceiverRole) 
                    VALUES (@Message, @DateEnvoi, @IsRead, @IdVisitor, @Type, @ReceiverRole)";
        
        await connection.ExecuteAsync(sql, notification);
    }

    public async Task<IEnumerable<Notification>> GetAllAsync()
    {
        using var connection = new SqlConnection(_connectionString);
        const string sql = "SELECT * FROM Notifications ORDER BY DateEnvoi DESC";
        return await connection.QueryAsync<Notification>(sql);
    }

    // 🔥 FIX ADMIN : Récupère les notifications marquées 'Admin' ET les 'NEW_VISIT' ou 'VISIT_UPDATE'
    public async Task<IEnumerable<Notification>> GetAdminNotificationsAsync()
    {
        using var connection = new SqlConnection(_connectionString);
        string sql = @"
            SELECT * FROM Notifications 
            WHERE ReceiverRole = 'Admin' 
               OR Type IN ('NEW_VISIT', 'VISIT_UPDATE')
            ORDER BY DateEnvoi DESC";
            
        return await connection.QueryAsync<Notification>(sql);
    }

    // 🔥 FIX VISITEUR : Supporte à la fois l'Id direct et l'Id utilisateur sans faire sauter les résultats
    public async Task<IEnumerable<Notification>> GetByVisitorIdAsync(int visitorOrUserId)
    {
        using var connection = new SqlConnection(_connectionString);
        
        string sql = @"
            SELECT DISTINCT n.* 
            FROM Notifications n
            LEFT JOIN [User] u ON u.Id = @Id OR u.VisitorId = @Id
            WHERE (n.IdVisitor = @Id OR n.IdVisitor = u.Id OR n.IdVisitor = u.VisitorId)
              AND (n.ReceiverRole = 'Visiteur' OR n.ReceiverRole IS NULL)
            ORDER BY n.DateEnvoi DESC";

        return await connection.QueryAsync<Notification>(sql, new { Id = visitorOrUserId });
    }
}