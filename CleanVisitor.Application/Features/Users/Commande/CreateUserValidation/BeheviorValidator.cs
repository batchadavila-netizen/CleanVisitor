using FluentValidation;
using MediatR;
using CleanVisitor.Application.Feautures.Users.Commande.Command;
using CleanVisitor.Application.Feautures.Users.Commande.Command. CreateUserValidator;
namespace CleanVisitor.Application.Features.Users.Commande.CreateUserValidation. BeheviorValidator;
public class BeheviorValidator<TRequest, CreateUserValidator>: IPipelineBehavior<TRequest, CreateUserValidator>
where TRequest : IRequest<CreateUserValidator>
{
    private readonly IEnumerable<IValidator<TRequest>> _validator;
    public BeheviorValidator(IEnumerable<IValidator<TRequest>> validator)
    {
        _validator=validator;
    }
    public async Task<CreateUserValidator>Handle(TRequest request, RequestHandlerDelegate<CreateUserValidator> next, CancellationToken cancellationToken)
    {
        // Verifier s'il ya validation pour cette requete
        if (_validator.Any())
        {
            var context= new ValidationContext<TRequest>(request);
        
        // Execute Toute les validation en Parallelle
        var validationResult=await Task.WhenAll(_validator.Select(v=> v.ValidateAsync(context, cancellationToken)));

        // Recuper Toute Les Erreurs Trouver
        var faillures= validationResult.SelectMany(r=>r.Errors).Where(f=>f!=null).ToList();

        // S'il ya D'erreurs on lance exception personnaliser
        if(faillures.Count!=0)
        throw new ValidationException(faillures);
    }
    return await next();
}
}