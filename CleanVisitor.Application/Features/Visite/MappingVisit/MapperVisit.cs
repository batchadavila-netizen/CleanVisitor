using AutoMapper;
using CleanVisitor.Core.Entities.Visits;
using CleanVisitor.Application.Features.Visite.Commande.CreateVisit;
using CleanVisitor.Application.Features.Visite.Commande.DeleteVisit;
using CleanVisitor.Application.Features.Visite.Commande.UpdateVisit.UpdateVisitCommand;
using CleanVisitor.Application.Features.Visite.Dtos;
public class MapperVisit : Profile
{
    public MapperVisit()
    {
        CreateMap<Visit, VisitDto>()
            // On force le mapping de l'ID au cas où les noms diffèrent 
            // ou si AutoMapper ignore la clé primaire par défaut
            .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.Id))
            .ReverseMap();
        CreateMap<CreateVisitCommand, Visit>();
        CreateMap<UpdateVisitCommand, Visit>();  
        CreateMap<UpdateVisitCommand, VisitDto>();   
        CreateMap<DeleteVisitCommand, VisitDto>(); 
    }
}