using MediatR;
using CleanVisitor.Application.Features.Visite.Querries;
using CleanVisitor.Application.Features.Visite.Dtos;
using CleanVisitor.Application.Features.Visite.Interfaces;

namespace CleanVisitor.Application.Features.Visite.Querries.GetTodayAgentVisits;

public class GetTodayAgentVisitsQueryHandler : IRequestHandler<GetTodayAgentVisitsQuery, IEnumerable<VisitDto>>
{
    private readonly IVisitRepository _visitRepository;

    public GetTodayAgentVisitsQueryHandler(IVisitRepository visitRepository)
    {
        _visitRepository = visitRepository;
    }

    public async Task<IEnumerable<VisitDto>> Handle(GetTodayAgentVisitsQuery request, CancellationToken cancellationToken)
{
    var records = await _visitRepository.GetTodayVisitsByAgentOrServiceAsync(request.UserId, request.Service);
    
    return records.Select(r => new VisitDto
    {
        Id = r.visit.Id,
        IdVisitor = r.visit.IdVisitor,
        Motif = r.visit.Motif,
        Date = r.visit.Date,
        HeureArriver = r.visit.HeureArriver,
        HeureDepart = r.visit.HeureDepart,
        Statut = r.visit.Statut,
        Service = r.visit.Service,
        UserId = r.visit.UserId,
        AccessCode = r.visit.AccessCode,
        
        // Mapping direct du Nom complet
        Nom_visitor = r.visitor?.Nom ?? "",
        Prenom_visitor = "",
        Email_visitor = r.visitor?.Email ?? ""
    });
}
}