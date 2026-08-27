using CleanVisitor.Application.Features.SystemConfigs.Dtos;
using MediatR;

namespace Application.Features.SystemConfig.Queries
{
    public record GetSystemConfigQuery() : IRequest<SystemConfigDto>;
}