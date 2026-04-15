using MediatR;
using CleanVisitor.Application.Features.Users.Dtos;
using CleanVisitor.Application.Features.Users.Interfaces;
using AutoMapper;
using CleanVisitor.Core.Entities.User;
 using CleanVisitor.Application.Features.Users.Querries.GetByEmailUser.GetByEmailUserQuery;
namespace CleanVisitor.Application.Features.Users.Querries.QueryHandler.GetByEmailUserHandler;
public class GetByEmailUserHandler:IRequestHandler<GetByEmailUserQuery, User?>
{
    private readonly IUserRepository _repository;
    private readonly IMapper _mapper;
    public GetByEmailUserHandler(IUserRepository repository, IMapper mapper)
    {
        _repository=repository;
        _mapper=mapper;
    }
    public async Task<User?>Handle(GetByEmailUserQuery request, CancellationToken cancellationToken)
    {
        var user=_mapper.Map<UserDto>(request);
        if (user==null) return null;
        return await _repository.GetByEmailAsync(user.Email);
    }
}