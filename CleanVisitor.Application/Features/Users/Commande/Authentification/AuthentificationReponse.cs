using CleanVisitor.Core.Entities.User;
using CleanVisitor.Application.Features.Users.Dtos;

public record AuthenticationResponse(
    UserDto user, 
    string token, 
    string Role, 
    string Service
);