using System.Data;
using System.Text.Json;
using CleanVisitor.Application.Features.SystemConfigs.Dtos;
using CleanVisitor.Application.Features.SystemConfigs.Interfaces;
using CleanVisitor.Core.Entities.SystemConfigs;
using Dapper;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;

namespace CleanVisitor.Infrastructure.Repositories;

public class SystemConfigRepository : ISystemConfigRepository
{
    private readonly string _connectionString;

    public SystemConfigRepository(IConfiguration configuration)
    {
        _connectionString = configuration.GetConnectionString("DefaultConnection") 
            ?? throw new InvalidOperationException("Chaîne de connexion 'DefaultConnection' introuvable.");
    }

    private IDbConnection CreateConnection() => new SqlConnection(_connectionString);

    public async Task<SystemConfigDto?> GetConfigAsync()
    {
        using var connection = CreateConnection();
        const string sql = @"
            SELECT company_name AS CompanyName, 
                   contact_email AS ContactEmail, 
                   pass_validity_hours AS PassValidityHours, 
                   max_concurrent_visitors AS MaxConcurrentVisitors, 
                   auto_expire_hours AS AutoExpireHours, 
                   enable_email_notifs AS EnableEmailNotifs, 
                   company_services_json AS CompanyServicesJson
            FROM system_configs 
            WHERE id = 1;";

        var result = await connection.QueryFirstOrDefaultAsync<dynamic>(sql);
        if (result == null) return null;

        string jsonServices = result.CompanyServicesJson ?? "[]";
        var services = JsonSerializer.Deserialize<List<string>>(jsonServices) ?? new List<string>();

        return new SystemConfigDto
        {
            CompanyName = result.CompanyName,
            ContactEmail = result.ContactEmail,
            PassValidityHours = (int)result.PassValidityHours,
            MaxConcurrentVisitors = (int)result.MaxConcurrentVisitors,
            AutoExpireHours = (int)result.AutoExpireHours,
            EnableEmailNotifs = (bool)result.EnableEmailNotifs,
            CompanyServices = services
        };
    }

    public async Task<SystemConfigDto> SaveConfigAsync(SystemConfigs config)
    {
        using var connection = CreateConnection();
        string jsonServices = JsonSerializer.Serialize(config.CompanyServices);

        // Requête compatible SQL Server (Upsert via MERGE)
        const string sql = @"
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