using CleanVisitor.Infrastructure.Repositories;
using FluentValidation;
using System.Reflection;
using CleanVisitor.Application.Features.Visitors.Interfaces;
using CleanVisitor.Application.Features.Visite.Interfaces;
using CleanVisitor.Application.Features.Users.Interfaces;
using CleanVisitor.Application.Features.Users.Interfaces.IJwtTokenGenerator;
using CleanVisitor.Application.DependencecyInjection;
using CleanVisitor.Infrastructure.AuthService.JwtTokenGenerator;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddAutoMapper(cfg => {}, AppDomain.CurrentDomain.GetAssemblies());
builder.Services.AddControllers()
.AddJsonOptions(options =>
{
options.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
});
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddAuthentication("Bearer").AddJwtBearer();
builder.Services.AddAuthorization();
// Cette ligne enregistre automatiquement TOUS les validateurs présents dans ce projet
builder.Services.AddApplication();
builder.Services.AddScoped<IVisitorRepository, VisitorRepository>();
builder.Services.AddScoped<IVisitRepository, VisitRepository>();
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IJwtTokenGenerator, JwtTokenGenerator>();
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
string connectionString = builder.Configuration.GetConnectionString("DefaultConnection")!;

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

app.Run();