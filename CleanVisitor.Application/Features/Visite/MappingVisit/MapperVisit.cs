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
        CreateMap<VisitDto, Visit>().ReverseMap();
        CreateMap<CreateVisitCommand, Visit>();
        CreateMap<UpdateVisitCommand, Visit>();  
        CreateMap<UpdateVisitCommand, VisitDto>();   
        CreateMap<DeleteVisitCommand, VisitDto>(); 
    }
}