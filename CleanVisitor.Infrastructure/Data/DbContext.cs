using System.Data;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using Npgsql;

namespace CleanVisitor.Infrastructure.Data;

public class DbContext
{
    private readonly IConfiguration _configuration;
    private readonly string _provider;

    public DbContext(IConfiguration configuration)
    {
        _configuration = configuration;
        // On lit DatabaseProvider, avec "PostgreSQL" par défaut puisque c'est ton choix actuel
        _provider = _configuration["ConnectionStrings:DatabaseProvider"] 
                    ?? _configuration["DatabaseProvider"] 
                    ?? "PostgreSQL";
    }

    public IDbConnection CreateConnection()
    {
        return _provider.Equals("PostgreSQL", StringComparison.OrdinalIgnoreCase)
            ? CreatePostgresConnection()
            : CreateSqlServerConnection();
    }

    public IDbConnection CreateSqlServerConnection()
    {
        // Utilise "DefaultConnection" qui correspond à ton appsettings.json
        var connectionString = _configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("Chaîne de connexion SQL Server manquante.");

        return new SqlConnection(connectionString);
    }

    public IDbConnection CreatePostgresConnection()
    {
        var connectionString = _configuration.GetConnectionString("SupabaseConnection")
            ?? throw new InvalidOperationException("Chaîne de connexion Supabase manquante.");

        return new NpgsqlConnection(connectionString);
    }

    public string SelectQuery(string sqlServerQuery, string postgresQuery)
    {
        return _provider.Equals("PostgreSQL", StringComparison.OrdinalIgnoreCase) 
            ? postgresQuery 
            : sqlServerQuery;
    }
}