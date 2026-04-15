using MediatR;
using CleanVisitor.Application.Features.Users.Dtos;
using CleanVisitor.Application.Features.Users.Interfaces;
using AutoMapper;
using CleanVisitor.Core.Entities.User;
using  CleanVisitor.Application.Features.Users.Querries.GetDeleteUser;
namespace CleanVisitor.Application.Features.Users.Querries.GetDeleteUser.GetDeleteUserHandler;

public class GetDeletedUserHandler:IRequestHandler<GetDeletedUsersQuery, List<UserDto>>
{
    private readonly IUserRepository _repository;
    private readonly IMapper _mapper;

    public GetDeletedUserHandler(IUserRepository repository, IMapper mapper)
    {
        _repository = repository;
        _mapper=mapper;
    }

    public async Task<List<UserDto>> Handle(GetDeletedUsersQuery request, CancellationToken cancellationToken)
    {
        var users = await _repository.GetDeletedAsync();

        return _mapper.Map<List<UserDto>>(users);
    }
}