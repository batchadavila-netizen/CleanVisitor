using MediatR;
using CleanVisitor.Application.Features.Users.Dtos;
using CleanVisitor.Application.Features.Users.Interfaces;
using AutoMapper;
using CleanVisitor.Application.Features.Users.Querries.GetDeleteByIdUser.GetDeleteByIdUserQuery;
namespace CleanVisitor.Application.Features.Users.Querries.GetDeleteByIdUser.GetDeleteByIdUserHandler;

public class GetDeletedByIdUserHandler:IRequestHandler<GetDeletedByIdUserQuery, UserDto>
{
    private readonly IUserRepository _repository;
    private readonly IMapper _mapper;

    public GetDeletedByIdUserHandler(IUserRepository repository, IMapper mapper)
    {
        _repository = repository;
        _mapper=mapper;
    }

    public async Task<UserDto> Handle(GetDeletedByIdUserQuery request, CancellationToken cancellationToken)
    {
        var user = await _repository.GetDeletedByIdAsync(request.Id);

        if (user == null )
        return null;

        return _mapper.Map<UserDto>(user);
    }
}