using FluentValidation;
using MediatR;
namespace CleanVisitor.Application.FluentValiddation.ValidationBehavior;
public class ValidationBehavior<TRequest, TResponse>: IPipelineBehavior<TRequest, TResponse >
where TRequest : IRequest<TResponse>
{
    private readonly IEnumerable<IValidator<TRequest>> _validator;
    public ValidationBehavior(IEnumerable<IValidator<TRequest>> validator)
    {
        _validator=validator;
    }
    public async Task<TResponse>Handle(TRequest request, RequestHandlerDelegate<TResponse> next, CancellationToken cancellationToken)
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