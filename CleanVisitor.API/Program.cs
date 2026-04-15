using CleanVisitor.Infrastructure.Repositories;
using FluentValidation;
using System.Reflection;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Swashbuckle.AspNetCore.SwaggerGen;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;
using System.Text.Json.Serialization;
using CleanVisitor.Application.Features.Visitors.Interfaces;
using CleanVisitor.Application.Features.Dashboard.Interfaces;
using CleanVisitor.Application.Features.Visite.Interfaces;
using CleanVisitor.Application.Features.Users.Interfaces;
using CleanVisitor.Application.Features.Users.Interfaces.IJwtTokenGenerator;
using CleanVisitor.Application.DependencecyInjection;
using CleanVisitor.Infrastructure.AuthService.JwtTokenGenerator;
using CleanVisitor.Infrastructure.Repositories.UserRepository;

var builder = WebApplication.CreateBuilder(args);

// Controllers + Swagger
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
// 1. Récupération de la clé depuis builder.Configuration
var jwtKey = builder.Configuration["Jwt:Key"];

if (string.IsNullOrEmpty(jwtKey))
{
    throw new Exception("Jwt:Key est null ou vide dans appsettings.json");
}

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

        // On utilise builder.Configuration pour être raccord avec le générateur
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidAudience = builder.Configuration["Jwt:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
    };
});

builder.Services.AddAuthorization();

// AutoMapper
builder.Services.AddAutoMapper(AppDomain.CurrentDomain.GetAssemblies());
builder.Services.AddAutoMapper(typeof(MapperVisit));
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(
            new JsonStringEnumConverter());
    });


   builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo { Title = "API Title", Version = "v1" });

    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Entrez 'Bearer' [espace] et votre token"
    });
    
    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] {}
        }
    });
});


// Assure-toi d'injecter IConfiguration dans le constructeur de ton service


// MediatR
builder.Services.AddMediatR(cfg=>
{
  cfg.RegisterServicesFromAssembly(typeof(CleanVisitor.Application.Features.Users.Querries.GetAllUser.GetAllUserQuery).Assembly);  
});
builder.Services.AddMediatR(cfg => {
    cfg.RegisterServicesFromAssembly(typeof(CleanVisitor.Application.Features.Visitors.Querries.GetAllVisitor.GetAllVisitorQuery).Assembly);
});
builder.Services.AddMediatR(cfg => {
    cfg.RegisterServicesFromAssembly(typeof(CleanVisitor.Application.Features.Visite.Querries.GetAllVisit.GetAllVisitQuery).Assembly);
});

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        // Empêche les boucles infinies lors de la lecture des entités liées
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
    });

// DbContext, repository et service
builder.Services.AddApplication();
builder.Services.AddScoped<IVisitorRepository, VisitorRepository>();
builder.Services.AddScoped<IVisitRepository, VisitRepository>();
builder.Services.AddScoped<IUserRepository, UserRepository>();
// Dans Program.cs
builder.Services.AddScoped<IDashboardRepository, DashboardRepository>();

builder.Services.AddScoped<IJwtTokenGenerator, JwtTokenGenerator>();
// Dans Program.cs (C#)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReact", policy =>
    {
        policy.WithOrigins("http://localhost:5173") // L'URL de ton Vite/React
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

// Pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors();
app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.UseCors(policy => policy
    .AllowAnyOrigin()
    .AllowAnyMethod()
    .AllowAnyHeader());

app.Run();