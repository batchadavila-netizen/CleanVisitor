using MediatR;
using AutoMapper;
using CleanVisitor.Core.Entities.User;
using CleanVisitor.Application.Features.Users.Dtos;
using CleanVisitor.Application.Features.Users.Interfaces.IJwtTokenGenerator;
using CleanVisitor.Application.Features.Visite.Interfaces;
using CleanVisitor.Application.Features.Visite.Commande.RestoreUser;
namespace CleanVisitor.Application.Features.Visite.Commande.RestoreVisite.RestoreVisiteHandler;
public class RestoreVisiteHandler: IRequestHandler<RestoreVisiteCommand, int>
{
    private readonly IVisitRepository _repository;
    private readonly IMapper _mapper;

    public RestoreVisiteHandler(IVisitRepository repository, IMapper mapper)
    {
        _repository = repository;
        _mapper=mapper;
    }

    public async Task<int> Handle(RestoreVisiteCommand request, CancellationToken cancellationToken)
    {
        var visite = await _repository.GetDeletedByIdAsync(request.Id);

        if (visite == null)
            return 0;

        return await _repository.RestoreAsync(request.Id);

    }
}