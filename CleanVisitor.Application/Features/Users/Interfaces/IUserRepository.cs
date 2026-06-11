using CleanVisitor.Core.Entities.User;
using CleanVisitor.Application.Features.Users.Dtos;
namespace CleanVisitor.Application.Features.Users.Interfaces;
public interface IUserRepository
{
    Task<UserDto?> GetByIdAsync(int id);
    Task<UserDto> GetByEmailAsync(string email); 
    Task<List<UserDto>> GetAllAsync();
    Task<UserDto> AddAsync(User user);
    Task<UserDto?> UpdateAsync(User user);
    Task<bool> DeleteAsync(int id);
    Task<List<UserDto>> GetDeletedAsync();
    Task<UserDto> GetDeletedByIdAsync(int id);
    Task<int>RestoreAsync(int id);
    Task<UserProfileDto> GetUserProfileAsync(int userId);
    Task SaveResetTokenAsync(int userId, string token, DateTime expiry);
Task<UserDto?> GetByResetTokenAsync(string email, string token);
Task UpdatePasswordAsync(int userId, string newPasswordHash);
}