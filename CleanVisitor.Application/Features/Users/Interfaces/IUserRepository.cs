using CleanVisitor.Core.Entities.User;
using CleanVisitor.Application.Features.Users.Dtos;
namespace CleanVisitor.Application.Features.Users.Interfaces;
public interface IUserRepository
{
    Task<UserDto?> GetByIdAsync(int id);
    Task<UserDto?> GetByEmailAsync(string email); 
    Task<List<UserDto>> GetAllAsync();
    Task<UserDto?> AddAsync(User user);
    Task<UserDto?> UpdateAsync(User user);
    Task<UserDto?> DeleteAsync(int id);
}