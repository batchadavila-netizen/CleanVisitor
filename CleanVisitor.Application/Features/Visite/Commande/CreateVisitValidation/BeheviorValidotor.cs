using FluentValidation;
using MediatR;
using CleanVisitor.Application.Features.Visite.Commande.CreateVisit;
using CleanVisitor.Application.Features.Visite.Commande.CreateVisitValidator;
namespace CleanVisitor.Application.Features.Visite.Commande.CommandHandler. BeheviorValidator;
public class BeheviorValidator<TRequest, CreateVisitValidator>: IPipelineBehavior<TRequest, CreateVisitValidator>
where TRequest : IRequest<CreateVisitValidator>
{
    private readonly IEnumerable<IValidator<TRequest>> _validator;
    public BeheviorValidator(IEnumerable<IValidator<TRequest>> validator)
    {
        _validator=validator;
    }
    public async Task<CreateVisitValidator>Handle(TRequest request, RequestHandlerDelegate<CreateVisitValidator> next, CancellationToken cancellationToken)
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