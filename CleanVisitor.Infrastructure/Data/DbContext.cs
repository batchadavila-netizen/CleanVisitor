using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using System.Data;
namespace CleanVisitor.Infrastructure.Data;
public class DbContext
{
    private readonly IConfiguration _configuration;
    public DbContext(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public IDbConnection CreateSqlServerConnection()
        {
            var connectionString = _configuration.GetConnectionString("SqlServerConnection")
            ?? throw new InvalidOperationException("Chaine de connexion manquante");
            
            return new SqlConnection(connectionString);
    }
    }
    