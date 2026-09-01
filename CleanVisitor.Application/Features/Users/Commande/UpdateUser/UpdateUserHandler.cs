using MediatR;
using AutoMapper;
using CleanVisitor.Core.Entities.User;
using CleanVisitor.Application.Features.Users.Dtos;
using CleanVisitor.Application.Features.Users.Interfaces;
using CleanVisitor.Core.Enum.ServiceVisitor;
using CleanVisitor.Application.Features.Users.Commande.UpdateUser.UpdateUserCommand;

namespace CleanVisitor.Application.Feautures.Users.Commande.CommandHandler.UpdateUserHandler;

public class UpdateUserHandler : IRequestHandler<UpdateUserCommand, UserDto?>
{
    private readonly IUserRepository _repository;

    public UpdateUserHandler(IUserRepository repository)
    {
        _repository = repository;
    }

    public async Task<UserDto?> Handle(UpdateUserCommand request, CancellationToken cancellationToken)
    {
        var existingUserDto = await _repository.GetByIdAsync(request.Id);
        if (existingUserDto == null) return null;

      
        ServiceVisitor? targetService = null;
        if (!string.IsNullOrEmpty(request.Service) && Enum.TryParse<ServiceVisitor>(request.Service, true, out var parsedService))
        {
            targetService = parsedService;
        }

        var user = new User
        {
            Id = request.Id,
            Nom = request.Nom,
            Prenom = request.Prenom,
            Email = request.Email,
            Telephone = request.Telephone,
            Role = request.Role,
            Service = targetService,
            IsActive = request.IsActive,
            PasswordHash = string.IsNullOrEmpty(request.PasswordHash) ? existingUserDto.PasswordHash : request.PasswordHash
        };

        return await _repository.UpdateAsync(user);
    }
}