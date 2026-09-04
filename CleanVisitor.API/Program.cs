using CleanVisitor.Infrastructure.Repositories;
using FluentValidation;
using System.Reflection;
using CleanVisitor.Infrastructure.Data;
using Npgsql;
using System.Data;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Swashbuckle.AspNetCore.SwaggerGen;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using CleanVisitor.Api.Hubs;
using CleanVisitor.Api.Services;
using System.Text;
using Microsoft.Data.SqlClient;
using System.Text.Json.Serialization;
using CleanVisitor.Application.Features.Visitors.Interfaces;
using CleanVisitor.Application.Features.Dashboard.Interfaces;
using CleanVisitor.Application.Features.Visite.Interfaces;
using CleanVisitor.Application.Features.Notifications.Interfaces;
using CleanVisitor.Application.Features.Users.Interfaces;
using CleanVisitor.Application.Features.Users.Interfaces.IJwtTokenGenerator;
using CleanVisitor.Application.DependencecyInjection;
using CleanVisitor.Infrastructure.Services.JwtTokenGenerator;
using CleanVisitor.Infrastructure.Repositories.UserRepository;
using CleanVisitor.Application.Features.Visite.Commande.EmailSetting;
using CleanVisitor.Application.Features.SystemConfigs.Interfaces;
using CleanVisitor.Infrastructure.Services;
using CleanVisitor.Application.Features.Notifications.Interfaces.IRealTimeNotificationService;

var builder = WebApplication.CreateBuilder(args);

// --- 1. SERVICES DE BASE ---
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
    });

builder.Services.AddEndpointsApiExplorer();

// --- 2. CONFIGURATION CORS (UNIFIÉE REACT & SIGNALR) ---
// builder.Services.AddCors(options =>
// {
//     options.AddPolicy("GlobalCorsPolicy", policy =>
//     {
//         policy.WithOrigins("http://localhost:5173") // Origine React frontend
//               .AllowAnyHeader()
//               .AllowAnyMethod()
//               .AllowCredentials(); // Requis pour les sessions/handshakes SignalR
//     });
// });
// --- 1. CONFIGURATION DU SERVEUR KESTREL ---
builder.WebHost.ConfigureKestrel(options =>
{
    options.ListenAnyIP(5283); // Écoute sur 0.0.0.0:5283
});

// --- 2. CONFIGURATION CORS ---
builder.Services.AddCors(options =>
{
    options.AddPolicy("GlobalCorsPolicy", policy =>
    {
        policy.SetIsOriginAllowed(origin => true) // Autorise le téléphone et React
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

builder.Services.AddSignalR();
builder.Services.AddScoped<DbContext>();

// --- 3. AUTHENTIFICATION JWT (HYBRIDE : C# LOCAL + CLERK GOOGLE) ---
var jwtKey = builder.Configuration["Jwt:Key"];
if (string.IsNullOrEmpty(jwtKey)) throw new Exception("Jwt:Key manquante dans appsettings.json");

// Récupération de l'Issuer Clerk depuis appsettings.json (avec fallback sur ton domaine exact)
var clerkIssuer = builder.Configuration["Clerk:Issuer"] ?? "https://glad-collie-7683.clerk.accounts.dev";
var localIssuer = builder.Configuration["Jwt:Issuer"] ?? "CleanVisitorApi";
var supabaseConnectionString = builder.Configuration.GetConnectionString("SupabaseConnection") 
    ?? builder.Configuration.GetConnectionString("DefaultConnection");

builder.Services.AddScoped<IDbConnection>(sp => new NpgsqlConnection(supabaseConnectionString));

builder.Services.AddAuthentication(options => {
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.Authority = clerkIssuer; // Pour télécharger automatiquement la clé publique Clerk (OpenID)
    
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        // Acceptation simultanée des jetons locaux C# et des jetons Clerk
        ValidIssuers = new[] { localIssuer, clerkIssuer },
        
        ValidateAudience = false, // Désactivé pour la compatibilité des jetons SSO Clerk
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        
        // Clé de signature locale pour les jetons générés par C# (Admin/Agent)
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
    };

    // CONFIGURATION SIGNALR POUR JWT (Transmission du token via QueryString)
    options.Events = new JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
            var accessToken = context.Request.Query["access_token"];
            var path = context.HttpContext.Request.Path;
            if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/visitHub"))
            {
                context.Token = accessToken;
            }
            return Task.CompletedTask;
        }
    };
});

builder.Services.AddAuthorization();

// --- 4. SWAGGER ---
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo { Title = "CleanVisitor API", Version = "v1" });
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Entrez votre token JWT"
    });
    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme { Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" } },
            new string[] {}
        }
    });
});

// --- 5. INJECTION DE DÉPENDANCES ---
builder.Services.AddAutoMapper(AppDomain.CurrentDomain.GetAssemblies());
builder.Services.AddApplication();
builder.Services.AddMediatR(cfg => {
    cfg.RegisterServicesFromAssemblies(
        typeof(CleanVisitor.Application.Features.Users.Querries.GetAllUser.GetAllUserQuery).Assembly,
        typeof(CleanVisitor.Application.Features.Visitors.Querries.GetAllVisitor.GetAllVisitorQuery).Assembly,
        typeof(CleanVisitor.Application.Features.Visite.Querries.GetAllVisit.GetAllVisitQuery).Assembly
    );
});

builder.Services.AddScoped<IVisitorRepository, VisitorRepository>();
builder.Services.AddScoped<IVisitRepository, VisitRepository>();
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IDashboardRepository, DashboardRepository>();
builder.Services.AddScoped<INotificationService, NotificationRepository>();
builder.Services.AddScoped<IJwtTokenGenerator, JwtTokenGenerator>();
builder.Services.Configure<EmailCommande>(builder.Configuration.GetSection("EmailCommand"));
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<IRealTimeNotificationService, NotificationService>();
builder.Services.AddScoped<ISystemConfigRepository, SystemConfigRepository>();

var app = builder.Build();

// --- 6. PIPELINE MIDDLEWARE ---

app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "CleanVisitor API V1");
    c.RoutePrefix = string.Empty; // Permet d'ouvrir Swagger directement sur la racine https://cleanvisitor.onrender.com/
});

// 1. Activation globale du CORS
app.UseCors("GlobalCorsPolicy");

// 2. Routing
app.UseRouting();

// 3. Authentification & Autorisation
app.UseAuthentication();
app.UseAuthorization();

// 4. Endpoints
app.MapControllers();
app.MapHub<VisitHub>("/visitHub");

app.Run();