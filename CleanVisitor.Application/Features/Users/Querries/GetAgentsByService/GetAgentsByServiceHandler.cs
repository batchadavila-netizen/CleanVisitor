using MediatR;
using CleanVisitor.Application.Features.Users.Dtos;
using CleanVisitor.Application.Features.Users.Interfaces;

namespace CleanVisitor.Application.Features.Users.Queries.GetAgentsByService;

public class GetAgentsByServiceHandler : IRequestHandler<GetAgentsByServiceQuery, List<UserDto>>
{
    private readonly IUserRepository _userRepository;

    public GetAgentsByServiceHandler (IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<List<UserDto>> Handle(GetAgentsByServiceQuery request, CancellationToken cancellationToken)
    {
        return await _userRepository.GetAgentsByServiceAsync(request.Service);
    }
}