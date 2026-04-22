using MediatR;
using CleanVisitor.Application.Features.Users.Dtos;

namespace CleanVisitor.Application.Features.Users.Queries.GetUserProfile;

public class GetUserProfileQuery : IRequest<UserProfileDto>
{
    public int UserId { get; set; }
}