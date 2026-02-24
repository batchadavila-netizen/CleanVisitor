using MediatR;
using AutoMapper;
using CleanVisitor.Core.Entities.User;
using CleanVisitor.Application.Features.Users.Dtos;
using CleanVisitor.Application.Features.Users.Interfaces;
using CleanVisitor.Application.Features.Users.Commande.UpdateUser.UpdateUserCommand;
namespace CleanVisitor.Application.Feautures.Users.Commande.CommandHandler.UpdateUserHandler;
public class UpdateUserHandler:IRequestHandler<UpdateUserCommand, UserDto?>
{
    private readonly IUserRepository _repository;
    private readonly IMapper _mapper;
    public UpdateUserHandler(IUserRepository repository, IMapper mapper)
    {
        _repository=repository;
        _mapper=mapper;
    }
    public async Task<UserDto?>Handle(UpdateUserCommand request, CancellationToken cancellationToken)
    {
        var user=_mapper.Map<User?>(request);
        if (user== null) return null;
         await _repository.UpdateAsync(user);
         return _mapper.Map<UserDto>(user);
    }
}