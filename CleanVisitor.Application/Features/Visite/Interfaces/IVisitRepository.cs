using CleanVisitor.Core.Entities.Visits;
using CleanVisitor.Application.Features.Visite.Dtos;
using CleanVisitor.Application.Features.Visite.Dtos.ServiceDto;
using CleanVisitor.Core.Entities;
namespace CleanVisitor.Application.Features.Visite.Interfaces;
public interface IVisitRepository{

Task<List<VisitDto?>>GetAllAsync();
Task<VisitDto?>GetByDateAsync(DateTime Date);
    Task<VisitDto?> GetByIdAsync(int Id);
    Task<VisitDto> AddAsync(Visit visit);
    Task<VisitDto?> UpdateAsync(Visit visit);
    Task<bool> DeleteAsync(int Id);
    Task<List<VisitDto>> GetDeletedAsync();
    Task<VisitDto> GetDeletedByIdAsync(int id);
    Task<int>RestoreAsync(int id);
    Task<List<ServiceDto>> GetVisitCountByServiceStatutAsync();
    Task<bool> UpdateStatusAsync(int id, int newStatus);
    Task<IEnumerable<VisitDetailsDto>> GetAllVisitsWithDetailsAsync();
    Task<List<VisitDto>> GetUserVisitsAsync(int userId);
    Task<List<VisitDto>> GetByServiceAsync(int serviceId);
    Task<IEnumerable<(Visit visit, Visitor visitor)>> GetTodayVisitsByAgentOrServiceAsync(int userId, string service);
    Task<IEnumerable<Visit>> GetVisitsByHostAndDateAsync(int userId, DateTime date);
    }
    