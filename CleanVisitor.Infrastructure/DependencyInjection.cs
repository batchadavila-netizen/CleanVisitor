using CleanVisitor.Application.Features.Users.Interfaces.IJwtTokenGenerator;
using Microsoft.Extensions.DependencyInjection;
using System.Reflection;
using MediatR;
using  CleanVisitor.Infrastructure.AuthService.JwtTokenGenerator;

namespace CleanVisitor.Infrastructure.DependencyInjection;
public static class DependencyInjection {
public static IServiceCollection AddInfrastructure(this IServiceCollection services)
{
services.AddSingleton < IJwtTokenGenerator, JwtTokenGenerator > ();
return services;
}
}