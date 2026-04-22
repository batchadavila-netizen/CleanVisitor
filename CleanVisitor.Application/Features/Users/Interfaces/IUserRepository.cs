using CleanVisitor.Core.Entities.User;
using CleanVisitor.Application.Features.Users.Dtos;
namespace CleanVisitor.Application.Features.Users.Interfaces;
public interface IUserRepository
{
    Task<UserDto?> GetByIdAsync(int id);
    Task<User> GetByEmailAsync(string email); 
    Task<List<UserDto>> GetAllAsync();
    Task<UserDto> AddAsync(User user);
    Task<UserDto?> UpdateAsync(User user);
    Task<bool> DeleteAsync(int id);
    Task<List<UserDto>> GetDeletedAsync();
    Task<UserDto> GetDeletedByIdAsync(int id);
    Task<int>RestoreAsync(int id);
    Task<UserProfileDto> GetUserProfileAsync(int userId);
}