using MediatR;
using AutoMapper;
using CleanVisitor.Core.Entities.User;
using CleanVisitor.Application.Features.Users.Dtos;
using CleanVisitor.Application.Features.Users.Interfaces;
using CleanVisitor.Application.Features.Users.Commande.DeleteUser.DeleteUserCommand;
namespace CleanVisitor.Application.Feautures.Users.Commande.CommandHandler.DeleteUserHandler;
public class DeleteUserHandler:IRequestHandler<DeleteUserCommand, bool>
{
    private readonly IUserRepository _repository;
    private readonly IMapper _mapper;
    public DeleteUserHandler(IUserRepository repository, IMapper mapper)
    {
        _repository=repository;
        _mapper=mapper;
    }
    public async Task<bool>Handle(DeleteUserCommand request, CancellationToken cancellationToken)
    {
        var user=_mapper.Map<User>(request);
         await _repository.DeleteAsync(user.Id);
         return true; 
    }
}