using CleanVisitor.Application.Features.Users.Dtos;
using CleanVisitor.Application.Features.Users.Interfaces;
using MediatR;
using AutoMapper;
using CleanVisitor.Application.Features.Users.Querries.GetAllUser;
namespace CleanVisitor.Application.Features.Users.Querries.QueryHandler;
public class GetAllUserHandler:IRequestHandler<GetAllUserQuery, List<UserDto>>
{
    private readonly IUserRepository _repository;
    private readonly IMapper _mapper;
    public GetAllUserHandler(IUserRepository repository, IMapper mapper)
    {
        _repository=repository;
        _mapper=mapper;
    }
    public async Task<List<UserDto>>Handle(GetAllUserQuery request, CancellationToken cancellationToken)
    {
      var user=await _repository.GetAllAsync();
      var dto=_mapper.Map<List<UserDto>>(user);
      return dto;
}
}