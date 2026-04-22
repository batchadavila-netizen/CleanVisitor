using AutoMapper;
using CleanVisitor.Core.Entities.User;
using CleanVisitor.Core.Entities;
using CleanVisitor.Application.Features.Users.Dtos;
using CleanVisitor.Application.Features.Users.Commande.CreateUser;
using CleanVisitor.Application.Features.Users.Commande.DeleteUser.DeleteUserCommand;
using CleanVisitor.Application.Features.Users.Commande.UpdateUser.UpdateUserCommand;
using CleanVisitor.Application.Features.Users.Dtos.UserRegistrationDto;
using CleanVisitor.Application.Features.Users.Commande.RegistreUser;
using CleanVisitor.Application.Features.Users.Querries.GetByEmailUser.GetByEmailUserQuery;

public class MapperUserProfile : Profile
{
    public MapperUserProfile()
    {
CreateMap<UserDto, User>().ReverseMap();
        CreateMap<CreateUserCommand, User>()
            .ForMember(dest => dest.PasswordHash, opt => opt.Ignore()) 
            .AfterMap((src, dest) => 
{
    // On vérifie que PasswordHash n'est pas null avant de l'utiliser
    if (!string.IsNullOrEmpty(src.PasswordHash)) 
    {
            {
                // On applique la logique de hachage ici
                using var sha256 = System.Security.Cryptography.SHA256.Create();
                byte[] bytes = System.Text.Encoding.UTF8.GetBytes(src.PasswordHash);
                dest.AddPassword(sha256.ComputeHash(bytes));
            }
    }
            });
        CreateMap<DeleteUserCommand, User>();
        CreateMap<GetByEmailUserQuery, User>();
         CreateMap<GetByEmailUserQuery, UserDto>();
        CreateMap<UpdateUserCommand, User>()
        .ForMember(dest=> dest.PasswordHash, opt=>opt.Ignore())
        .AfterMap((src, dest) =>{
        if (!string.IsNullOrEmpty(src.PasswordHash))
        {
            using var sha256= System.Security.Cryptography.SHA256.Create();
            byte[] bytes= System.Text.Encoding.UTF8.GetBytes(src.PasswordHash);
            dest.UpdatePassword(sha256.ComputeHash(bytes));
        }
        });
        
        CreateMap<UserRegistrationDto, User>().ReverseMap();
        CreateMap<RegisterUserCommand, User>();// Dans ton MappingProfile.cs (si nécessaire)
      CreateMap<RegisterUserCommand, Visitor>()
    .ForMember(dest => dest.Prenom, opt => opt.MapFrom(src => src.Prenom));
    }
}