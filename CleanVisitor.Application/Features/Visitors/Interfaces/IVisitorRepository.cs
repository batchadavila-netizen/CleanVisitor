using CleanVisitor.Core.Entities;
using CleanVisitor.Application.Features.Visitors.Dtos.VisitorVisitDto;
using CleanVisitor.Application.Features.Visitors.Dtos.StatJourDto;
using CleanVisitor.Application.Features.Visitors.Dtos.StatMoisDto;
using CleanVisitor.Application.Features.Visitors.Dtos.StatAnneeDto;
using CleanVisitor.Application.Features.Visitors.Dtos;
namespace CleanVisitor.Application.Features.Visitors.Interfaces;
public interface IVisitorRepository{

Task<List<Visitor>> GetAllAsync();
    Task<Visitor?> GetByIdAsync(int Id);
    Task<VisitorDto?> AddAsync(Visitor visitor);
    Task<VisitorDto?> UpdateAsync(Visitor visitor);
    Task LinkVisitorToUserAsync(string email, int visitorId);
    Task <bool>DeleteAsync(int Id);
     Task<List<VisitorDto>> GetDeletedAsync();
    Task<VisitorDto> GetDeletedByIdAsync(int id);
    Task<int>RestoreAsync(int id);
    Task <VisitorVisitDto?> GetVisitorVisitAsync(int Id);
    Task<List<StatJourDto>> GetVisitorJourAsync();
    Task<List<StatMoisDto>> GetVisitorMoisAsync();
    Task<List<StatAnneeDto>>GetVisitorAnneeAsync();

    }