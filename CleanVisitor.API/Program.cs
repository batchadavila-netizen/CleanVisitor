using CleanVisitor.Infrastructure.Repositories;
using FluentValidation;
using System.Reflection;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Swashbuckle.AspNetCore.SwaggerGen;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using CleanVisitor.Api.Hubs;
using CleanVisitor.Api.Services;
using System.Text;
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
using CleanVisitor.Infrastructure.Services;
using CleanVisitor.Application.Features.Notifications.Interfaces.IRealTimeNotificationService;

var builder = WebApplication.CreateBuilder(args);

// --- 1. SERVICES DE BASE ---
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
    });

builder.Services.AddEndpointsApiExplorer();

// --- 2. CONFIGURATION CORS (UNE SEULE FOIS) ---
builder.Services.AddCors(options =>
{
    // Politique pour les requêtes HTTP normales (React + Flutter)
    options.AddPolicy("ApiPolicy", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });

    // Politique pour SignalR (exige AllowCredentials donc origine explicite)
    options.AddPolicy("SignalRPolicy", policy =>
    {
        policy.WithOrigins("http://localhost:5173") // React uniquement
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

builder.Services.AddSignalR();

// --- 3. AUTHENTIFICATION JWT ---
var jwtKey = builder.Configuration["Jwt:Key"];
if (string.IsNullOrEmpty(jwtKey)) throw new Exception("Jwt:Key manquante dans appsettings.json");

builder.Services.AddAuthentication(options => {
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidAudience = builder.Configuration["Jwt:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
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

// --- 5. DEPENDENCY INJECTION ---
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
// Ajoute cette ligne pour l'Email
builder.Services.Configure<EmailCommande>(builder.Configuration.GetSection("EmailCommand"));
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<IRealTimeNotificationService, NotificationService>();

var app = builder.Build();

// --- 6. PIPELINE MIDDLEWARE (L'ORDRE EST CRUCIAL) ---

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// 1. CORS en premier
app.UseCors("ApiPolicy");

// 2. Routing
app.UseRouting();

// 3. Auth
app.UseAuthentication();
app.UseAuthorization();

// 4. Endpoints
app.MapControllers();
app.MapHub<VisitHub>("/visitHub");

// 🔥 SignalR avec sa propre politique CORS
app.MapHub<VisitHub>("/visitHub").RequireCors("SignalRPolicy");

app.Run();