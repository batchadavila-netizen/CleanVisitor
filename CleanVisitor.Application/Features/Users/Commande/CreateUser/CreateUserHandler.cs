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
    public async Task<UserDto> Handle(CreateUserCommand request, CancellationToken cancellationToken)
{
    // 1. Mapping du Command vers l'entité User
    var user = _mapper.Map<User>(request);

    // 2. AddAsync retourne déjà le UserDto complet (avec l'ID généré par la BDD)
    var userDto = await _repository.AddAsync(user);

    // 3. Retourner directement le DTO renvoyé par le repository
    return userDto;
}
}