using MediatR;
using AutoMapper;
using CleanVisitor.Core.Entities.User;
using CleanVisitor.Application.Features.Users.Dtos;
using CleanVisitor.Application.Features.Users.Interfaces.IJwtTokenGenerator;
using CleanVisitor.Application.Features.Users.Interfaces;
using CleanVisitor.Application.Features.Users.Commande.RestoreUser;
namespace CleanVisitor.Application.Features.Users.Commande.RestoreUser.RestoreUserHandler;
public class RestoreUserHandler: IRequestHandler<RestoreUserCommand, int>
{
    private readonly IUserRepository _repository;
    private readonly IMapper _mapper;

    public RestoreUserHandler(IUserRepository repository, IMapper mapper)
    {
        _repository = repository;
        _mapper=mapper;
    }

    public async Task<int> Handle(RestoreUserCommand request, CancellationToken cancellationToken)
    {
        var user = await _repository.GetDeletedByIdAsync(request.Id);

        if (user == null)
            return 0;

        return await _repository.RestoreAsync(request.Id);

    }
}