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
        CreateMap<CreateUserCommand, User>().ReverseMap();
        CreateMap<DeleteUserCommand, User>();
        CreateMap<GetByEmailUserQuery, User>();
         CreateMap<GetByEmailUserQuery, UserDto>();
        CreateMap<UpdateUserCommand, User>().ReverseMap();
        CreateMap<UserRegistrationDto, User>().ReverseMap();
        CreateMap<RegisterUserCommand, User>();// Dans ton MappingProfile.cs (si nécessaire)
      CreateMap<RegisterUserCommand, Visitor>()
    .ForMember(dest => dest.Prenom, opt => opt.MapFrom(src => src.Prenom));
    }
}