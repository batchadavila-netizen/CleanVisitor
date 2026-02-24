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
    Task<Visitor?> UpdateAsync(Visitor visitor);
    Task <Visitor?>DeleteAsync(int Id);
    Task <VisitorVisitDto?> GetVisitorVisitAsync(int Id);
    Task<List<StatJourDto>> GetVisitorJourAsync();
    Task<List<StatMoisDto>> GetVisitorMoisAsync();
    Task<List<StatAnneeDto>>GetVisitorAnneeAsync();

    }