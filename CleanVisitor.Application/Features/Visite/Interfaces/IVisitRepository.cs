using CleanVisitor.Core.Entities.Visits;
using CleanVisitor.Application.Features.Visite.Dtos;
using CleanVisitor.Application.Features.Visite.Dtos.ServiceDto;
namespace CleanVisitor.Application.Features.Visite.Interfaces;
public interface IVisitRepository{

Task<List<VisitDto?>>GetAllAsync();
Task<VisitDto?>GetByDateAsync(DateTime Date);
    Task<VisitDto?> GetByIdAsync(int Id);
    Task<VisitDto> AddAsync(Visit visit);
    Task<VisitDto?> UpdateAsync(Visit visit);
    Task<Visit?> DeleteAsync(int Id);
    Task<List<ServiceDto>> GetVisitCountByServiceStatutAsync();
    }