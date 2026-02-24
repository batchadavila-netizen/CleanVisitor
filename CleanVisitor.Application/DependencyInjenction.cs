using Microsoft.Extensions.DependencyInjection;
using FluentValidation;
using System.Reflection;
using MediatR;
using CleanVisitor.Application.Features.Users.Interfaces.IJwtTokenGenerator;
using CleanVisitor.Application.FluentValiddation.ValidationBehavior;
namespace CleanVisitor.Application.DependencecyInjection;
public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        // Scanne tous les validateurs du projet
        services.AddValidatorsFromAssembly(Assembly.GetExecutingAssembly());

        // LA LIGNE MAGIQUE : Une seule pour TOUTES tes entités
        // On utilise typeof car ce sont des types génériques ouverts
        services.AddTransient(typeof(IPipelineBehavior<,>), typeof(ValidationBehavior<,>));

        return services;
    }
}