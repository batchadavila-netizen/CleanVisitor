using System.Data;
using System.Text.Json;
using CleanVisitor.Application.Features.SystemConfigs.Dtos;
using CleanVisitor.Application.Features.SystemConfigs.Interfaces;
using CleanVisitor.Core.Entities.SystemConfigs;
using CleanVisitor.Infrastructure.Data;
using Dapper;

namespace CleanVisitor.Infrastructure.Repositories;

public class SystemConfigRepository : ISystemConfigRepository
{
    private readonly DbContext _dbContext;

    public SystemConfigRepository(DbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<SystemConfigDto?> GetConfigAsync()
    {
        using IDbConnection connection = _dbContext.CreateConnection();

        const string sqlSqlServer = @"
            SELECT company_name AS CompanyName, 
                   contact_email AS ContactEmail, 
                   pass_validity_hours AS PassValidityHours, 
                   max_concurrent_visitors AS MaxConcurrentVisitors, 
                   auto_expire_hours AS AutoExpireHours, 
                   enable_email_notifs AS EnableEmailNotifs, 
                   company_services_json AS CompanyServicesJson
            FROM system_configs 
            WHERE id = 1;";

        const string sqlPostgres = @"
            SELECT company_name AS ""CompanyName"", 
                   contact_email AS ""ContactEmail"", 
                   pass_validity_hours AS ""PassValidityHours"", 
                   max_concurrent_visitors AS ""MaxConcurrentVisitors"", 
                   auto_expire_hours AS ""AutoExpireHours"", 
                   enable_email_notifs AS ""EnableEmailNotifs"", 
                   company_services_json AS ""CompanyServicesJson""
            FROM system_configs 
            WHERE id = 1;";

        string sql = _dbContext.SelectQuery(sqlSqlServer, sqlPostgres);

        var result = await connection.QueryFirstOrDefaultAsync<dynamic>(sql);
        if (result == null) return null;

        string jsonServices = result.CompanyServicesJson ?? "[]";
        var services = JsonSerializer.Deserialize<List<string>>(jsonServices) ?? new List<string>();

        return new SystemConfigDto
        {
            CompanyName = result.CompanyName,
            ContactEmail = result.ContactEmail,
            PassValidityHours = Convert.ToInt32(result.PassValidityHours),
            MaxConcurrentVisitors = Convert.ToInt32(result.MaxConcurrentVisitors),
            AutoExpireHours = Convert.ToInt32(result.AutoExpireHours),
            EnableEmailNotifs = Convert.ToBoolean(result.EnableEmailNotifs),
            CompanyServices = services
        };
    }

    public async Task<SystemConfigDto> SaveConfigAsync(SystemConfigs config)
    {
        using IDbConnection connection = _dbContext.CreateConnection();

        string jsonServices = JsonSerializer.Serialize(config.CompanyServices);

        // 1. Syntaxe Upsert SQL Server
        const string sqlSqlServer = @"
            MERGE INTO system_configs WITH (HOLDLOCK) AS Target
            USING (SELECT 1 AS id) AS Source
            ON (Target.id = Source.id)
            WHEN MATCHED THEN
                UPDATE SET 
                    company_name = @CompanyName,
                    contact_email = @ContactEmail,
                    pass_validity_hours = @PassValidityHours,
                    max_concurrent_visitors = @MaxConcurrentVisitors,
                    auto_expire_hours = @AutoExpireHours,
                    enable_email_notifs = @EnableEmailNotifs,
                    company_services_json = @CompanyServicesJson
            WHEN NOT MATCHED THEN
                INSERT (id, company_name, contact_email, pass_validity_hours, max_concurrent_visitors, auto_expire_hours, enable_email_notifs, company_services_json)
                VALUES (1, @CompanyName, @ContactEmail, @PassValidityHours, @MaxConcurrentVisitors, @AutoExpireHours, @EnableEmailNotifs, @CompanyServicesJson);";

        // 2. Syntaxe Upsert PostgreSQL (Supabase)
        const string sqlPostgres = @"
            INSERT INTO system_configs (id, company_name, contact_email, pass_validity_hours, max_concurrent_visitors, auto_expire_hours, enable_email_notifs, company_services_json)
            VALUES (1, @CompanyName, @ContactEmail, @PassValidityHours, @MaxConcurrentVisitors, @AutoExpireHours, @EnableEmailNotifs, @CompanyServicesJson)
            ON CONFLICT (id) DO UPDATE SET
                company_name = EXCLUDED.company_name,
                contact_email = EXCLUDED.contact_email,
                pass_validity_hours = EXCLUDED.pass_validity_hours,
                max_concurrent_visitors = EXCLUDED.max_concurrent_visitors,
                auto_expire_hours = EXCLUDED.auto_expire_hours,
                enable_email_notifs = EXCLUDED.enable_email_notifs,
                company_services_json = EXCLUDED.company_services_json;";

        string sql = _dbContext.SelectQuery(sqlSqlServer, sqlPostgres);

        await connection.ExecuteAsync(sql, new
        {
            CompanyName = config.CompanyName,
            ContactEmail = config.ContactEmail,
            PassValidityHours = config.PassValidityHours,
            MaxConcurrentVisitors = config.MaxConcurrentVisitors,
            AutoExpireHours = config.AutoExpireHours,
            EnableEmailNotifs = config.EnableEmailNotifs,
            CompanyServicesJson = jsonServices
        });

        return new SystemConfigDto
        {
            CompanyName = config.CompanyName,
            ContactEmail = config.ContactEmail,
            PassValidityHours = config.PassValidityHours,
            MaxConcurrentVisitors = config.MaxConcurrentVisitors,
            AutoExpireHours = config.AutoExpireHours,
            EnableEmailNotifs = config.EnableEmailNotifs,
            CompanyServices = config.CompanyServices
        };
    }
}