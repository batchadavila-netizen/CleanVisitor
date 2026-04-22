using MediatR;
using AutoMapper;
using CleanVisitor.Application.Features.Visite.Interfaces;
using CleanVisitor.Core.Entities.Visits;
using CleanVisitor.Application.Features.Visite.Dtos;
using CleanVisitor.Application.Features.Visite.Querries.GetAllVisit;
namespace CleanVisitor.Application.Features.Visite.Querries.GetAllVisit.GetAllVisitHandler;
public class GetAllVisitHandler:IRequestHandler<GetAllVisitQuery, List<VisitDto>>
{
    private readonly IVisitRepository _repository;
    private readonly IMapper _mapper;
    public GetAllVisitHandler(IVisitRepository repository, IMapper mapper)
    {
        _repository=repository;
        _mapper=mapper;
    }
    public async Task<List<VisitDto>> Handle(GetAllVisitQuery request, CancellationToken cancellationToken)
{
    // Récupération des entités depuis le repository
    var visits = await _repository.GetAllAsync();
    
    // Mapping manuel : on force la copie de l'Id
    return visits.Select(v => new VisitDto 
    {
        Id = v.Id, // Assure-toi que dans ton entité 'v', le champ s'appelle bien Id
        Nom_visitor = v.Nom_visitor,
        Email_visitor = v.Email_visitor,
        Motif = v.Motif,
        Date=v.Date,
        HeureDepart = v.HeureDepart,
        HeureArriver = v.HeureArriver,
         Statut = v.Statut,
         Service = v.Service,
         IsDeleted=v.IsDeleted,
         DeletedAt=v.DeletedAt

        
    }).ToList();
}
    }
