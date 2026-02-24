using MediatR;
using AutoMapper;
using CleanVisitor.Core.Entities.User;
using CleanVisitor.Application.Features.Users.Dtos;
using CleanVisitor.Application.Features.Users.Interfaces;
using CleanVisitor.Application.Features.Users.Commande.CreateUser;
namespace CleanVisitor.Application.Feautures.Users.Commande.CommandHandler;
public class CreateUserHandler:IRequestHandler<CreateUserCommand, UserDto>
{
    private readonly IUserRepository _repository;
    private readonly IMapper _mapper;
    public CreateUserHandler(IUserRepository repository, IMapper mapper)
    {
        _repository=repository;
        _mapper=mapper;
    }
    public async Task<UserDto>Handle(CreateUserCommand request, CancellationToken cancellationToken)
    {
        
        var user=_mapper.Map<User>(request);
         await _repository.AddAsync(user);
         return _mapper.Map<UserDto>(user);
    }
}