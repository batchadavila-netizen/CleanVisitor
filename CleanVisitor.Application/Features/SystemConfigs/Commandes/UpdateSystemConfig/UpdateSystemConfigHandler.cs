using CleanVisitor.Application.Features.SystemConfigs.Dtos;
using CleanVisitor.Application.Features.SystemConfigs.Interfaces;
using MediatR;
// Import direct de la classe pour éviter toute ambiguïté
using SystemConfigEntity = CleanVisitor.Core.Entities.SystemConfigs.SystemConfigs;

namespace Application.Features.SystemConfigs.Commands
{
    public class UpdateSystemConfigCommandHandler : IRequestHandler<UpdateSystemConfigCommand, SystemConfigDto>
    {
        private readonly ISystemConfigRepository _repository;

        public UpdateSystemConfigCommandHandler(ISystemConfigRepository repository)
        {
            _repository = repository;
        }

        public async Task<SystemConfigDto> Handle(UpdateSystemConfigCommand request, CancellationToken cancellationToken)
        {
            var dto = request.Config;

            // Instanciation directe de l'entité
            var entity = new SystemConfigEntity
            {
                Id = 1,
                CompanyName = dto.CompanyName,
                ContactEmail = dto.ContactEmail,
                PassValidityHours = dto.PassValidityHours,
                MaxConcurrentVisitors = dto.MaxConcurrentVisitors,
                AutoExpireHours = dto.AutoExpireHours,
                EnableEmailNotifs = dto.EnableEmailNotifs,
                CompanyServices = dto.CompanyServices
            };

            await _repository.SaveConfigAsync(entity);

            return dto;
        }
    }
}