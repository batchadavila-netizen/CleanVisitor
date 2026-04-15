using MediatR;
using AutoMapper;
using CleanVisitor.Core.Entities.User;
using CleanVisitor.Application.Features.Users.Dtos;
using CleanVisitor.Application.Features.Users.Interfaces.IJwtTokenGenerator;
using CleanVisitor.Application.Features.Visitors.Interfaces;
using CleanVisitor.Application.Features.Visitors.Commande.RestoreUser;
namespace CleanVisitor.Application.Features.Visitors.Commande.RestoreVisitor.RestoreVisitorHandler;
public class RestoreVisitorHandler: IRequestHandler<RestoreVisitorCommand, int>
{
    private readonly IVisitorRepository _repository;
    private readonly IMapper _mapper;

    public RestoreVisitorHandler(IVisitorRepository repository, IMapper mapper)
    {
        _repository = repository;
        _mapper=mapper;
    }

    public async Task<int> Handle(RestoreVisitorCommand request, CancellationToken cancellationToken)
    {
        var visitor = await _repository.GetDeletedByIdAsync(request.Id);

        if (visitor == null)
            return 0;

        return await _repository.RestoreAsync(request.Id);

    }
}