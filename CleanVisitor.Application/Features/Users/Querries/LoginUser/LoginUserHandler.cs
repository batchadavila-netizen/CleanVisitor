using MediatR;
using AutoMapper;
using CleanVisitor.Application.Features.Users.Interfaces.IJwtTokenGenerator;
using CleanVisitor.Application.Features.Users.Dtos;
using CleanVisitor.Core.Entities.User;
using CleanVisitor.Application.Features.Users.Interfaces;
using CleanVisitor.Application.Features.Users.Querries.LoginUser;
namespace CleanVisitor.Application.Features.Users.Querries.LoginUser.LoginUserHandler; 
public class LoginUserHandler:IRequestHandler<LoginUserQuery, AuthenticationResponse>
{
    private readonly IUserRepository _repository;
    private readonly IJwtTokenGenerator _jwtTokenGenerator;
    private readonly IMapper _mapper;
    public LoginUserHandler(IUserRepository repository, IMapper mapper, IJwtTokenGenerator jwtTokenGenerator)
    {
        _repository=repository;
        _mapper=mapper;
        _jwtTokenGenerator=jwtTokenGenerator;
    }
    public async Task<AuthenticationResponse> Handle(LoginUserQuery request, CancellationToken cancellationToken)
{
    var user = await _repository.GetByEmailAsync(request.Email);

    if (user == null)
        throw new Exception("Identifiants incorrects");

    string roleName = user.Role.ToString();

    var token = _jwtTokenGenerator.GenerateToken(user);


    var userDto = _mapper.Map<UserDto>(user);

    return new AuthenticationResponse(userDto, token, roleName);
}
}