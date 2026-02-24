using AutoMapper;
using CleanVisitor.Core.Entities;
using CleanVisitor.Application.Features.Visitors.Commande.CreateVisitor;
using CleanVisitor.Application.Features.Visitors.Dtos;
using CleanVisitor.Application.Features.Visitors.Commande.UpdateVisitor;
using CleanVisitor.Application.Features.Visitors.Commande.DeleteVisitor;
public class MappingProfile : Profile
{
    public MappingProfile()
    {
        CreateMap<VisitorDto, Visitor>().ReverseMap();
        CreateMap<CreateVisitorCommand, Visitor>();
        CreateMap<DeleteVisitorCommand, VisitorDto>();
        CreateMap<UpdateVisitorCommand, Visitor>();  
    }
}