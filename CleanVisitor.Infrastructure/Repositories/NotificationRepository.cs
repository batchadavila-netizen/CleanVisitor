using Dapper;
using System.Data;
using CleanVisitor.Infrastructure.Data;
using CleanVisitor.Application.Features.Notifications.Interfaces;
using CleanVisitor.Application.Features.Notifications.Interfaces.IRealTimeNotificationService;
using CleanVisitor.Core.Entities.Notification;

namespace CleanVisitor.Infrastructure.Repositories;

public class NotificationRepository : INotificationService
{
    private readonly DbContext _dbContext;
    private readonly IRealTimeNotificationService _signalRService;

    public NotificationRepository(DbContext dbContext, IRealTimeNotificationService signalRService)
    {
        _dbContext = dbContext;
        _signalRService = signalRService;
    }

    public async Task AddAsync(Notification notification)
    {
        using IDbConnection connection = _dbContext.CreateConnection();
        
        const string sqlSqlServer = @"
            INSERT INTO [Notifications] ([Message], [DateEnvoi], [IsRead], [IdVisitor], [Type], [ReceiverRole]) 
            VALUES (@Message, @DateEnvoi, @IsRead, @IdVisitor, @Type, @ReceiverRole)";

        const string sqlPostgres = @"
            INSERT INTO ""Notifications"" (""Message"", ""DateEnvoi"", ""IsRead"", ""IdVisitor"", ""Type"", ""ReceiverRole"") 
            VALUES (@Message, @DateEnvoi, @IsRead, @IdVisitor, @Type, @ReceiverRole)";
        
        string sql = _dbContext.SelectQuery(sqlSqlServer, sqlPostgres);
        await connection.ExecuteAsync(sql, notification);
    }

    public async Task<IEnumerable<Notification>> GetAllAsync()
    {
        using IDbConnection connection = _dbContext.CreateConnection();
        
        const string sqlSqlServer = @"SELECT * FROM [Notifications] ORDER BY [DateEnvoi] DESC";
        const string sqlPostgres = @"SELECT * FROM ""Notifications"" ORDER BY ""DateEnvoi"" DESC";

        string sql = _dbContext.SelectQuery(sqlSqlServer, sqlPostgres);
        return await connection.QueryAsync<Notification>(sql);
    }

    public async Task<IEnumerable<Notification>> GetAdminNotificationsAsync()
    {
        using IDbConnection connection = _dbContext.CreateConnection();
        
        const string sqlSqlServer = @"
            SELECT * FROM [Notifications] 
            WHERE [ReceiverRole] = 'Admin' 
               OR [Type] IN ('NEW_VISIT', 'VISIT_UPDATE')
            ORDER BY [DateEnvoi] DESC";

        const string sqlPostgres = @"
            SELECT * FROM ""Notifications"" 
            WHERE ""ReceiverRole"" = 'Admin' 
               OR ""Type"" IN ('NEW_VISIT', 'VISIT_UPDATE')
            ORDER BY ""DateEnvoi"" DESC";

        string sql = _dbContext.SelectQuery(sqlSqlServer, sqlPostgres);
        return await connection.QueryAsync<Notification>(sql);
    }

    public async Task<IEnumerable<Notification>> GetByVisitorIdAsync(int visitorOrUserId)
    {
        using IDbConnection connection = _dbContext.CreateConnection();
        
        const string sqlSqlServer = @"
            SELECT DISTINCT n.* 
            FROM Notifications n
            LEFT JOIN [User] u ON u.Id = @Id OR u.VisitorId = @Id
            WHERE (n.IdVisitor = @Id OR n.IdVisitor = u.Id OR n.IdVisitor = u.VisitorId)
              AND (n.ReceiverRole = 'Visiteur' OR n.ReceiverRole IS NULL)
            ORDER BY n.DateEnvoi DESC";

        const string sqlPostgres = @"
            SELECT DISTINCT n.* 
            FROM ""Notifications"" n
            LEFT JOIN ""User"" u ON u.""Id"" = @Id OR u.""VisitorId"" = @Id
            WHERE (n.""IdVisitor"" = @Id OR n.""IdVisitor"" = u.""Id"" OR n.""IdVisitor"" = u.""VisitorId"")
              AND (n.""ReceiverRole"" = 'Visiteur' OR n.""ReceiverRole"" IS NULL)
            ORDER BY n.""DateEnvoi"" DESC";

        string sql = _dbContext.SelectQuery(sqlSqlServer, sqlPostgres);
        return await connection.QueryAsync<Notification>(sql, new { Id = visitorOrUserId });
    }
}