using MediatR;
using CleanVisitor.Application.Features.Users.Dtos;
using CleanVisitor.Application.Features.Users.Interfaces;
using AutoMapper;
using CleanVisitor.Core.Entities.User;
 using CleanVisitor.Application.Features.Users.Querries.GetByIdUser.GetByIdUserQuery;
namespace CleanVisitor.Application.Features.Users.Querries.QueryHandler.GetByIdUserHandler;
public class GetByIdUserHandler:IRequestHandler<GetByIdUserQuery, UserDto>
{
    private readonly IUserRepository _repository;
    private readonly IMapper _mapper;
    public GetByIdUserHandler(IUserRepository repository, IMapper mapper)
    {
        _repository=repository;
        _mapper=mapper;
    }
    public async Task<UserDto>Handle(GetByIdUserQuery request, CancellationToken cancellationToken)
    {
       var user= await _repository.GetByIdAsync(request.Id);
        return _mapper.Map<UserDto>(user);
    }
}