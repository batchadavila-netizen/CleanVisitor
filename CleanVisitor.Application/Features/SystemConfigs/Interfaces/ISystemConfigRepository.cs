using CleanVisitor.Application.Features.SystemConfigs.Dtos;
using CleanVisitor.Core.Entities.SystemConfigs;

namespace CleanVisitor.Application.Features.SystemConfigs.Interfaces;

public interface ISystemConfigRepository
{
    Task<SystemConfigDto?> GetConfigAsync();
    Task<SystemConfigDto> SaveConfigAsync(CleanVisitor.Core.Entities.SystemConfigs.SystemConfigs config);
}