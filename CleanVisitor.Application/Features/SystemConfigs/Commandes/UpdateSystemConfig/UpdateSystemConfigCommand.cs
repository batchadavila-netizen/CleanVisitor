using CleanVisitor.Application.Features.SystemConfigs.Dtos;
using MediatR;

namespace Application.Features.SystemConfigs.Commands
{
    public record UpdateSystemConfigCommand(SystemConfigDto Config) : IRequest<SystemConfigDto>;
}