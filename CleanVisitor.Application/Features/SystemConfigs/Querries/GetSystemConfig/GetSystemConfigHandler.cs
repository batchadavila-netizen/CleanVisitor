using CleanVisitor.Application.Features.SystemConfigs.Dtos;
using CleanVisitor.Application.Features.SystemConfigs.Interfaces;
using MediatR;

namespace Application.Features.SystemConfig.Queries
{
    public class GetSystemConfigQueryHandler : IRequestHandler<GetSystemConfigQuery, SystemConfigDto>
    {
        private readonly ISystemConfigRepository _repository;

        public GetSystemConfigQueryHandler(ISystemConfigRepository repository)
        {
            _repository = repository;
        }

        public async Task<SystemConfigDto> Handle(GetSystemConfigQuery request, CancellationToken cancellationToken)
        {
            var entity = await _repository.GetConfigAsync();

            if (entity == null)
            {
                // Fallback si la BDD est encore vide
                return new SystemConfigDto
                {
                    CompanyName = "Davila Entreprise",
                    ContactEmail = "contact@davila.com",
                    PassValidityHours = 2,
                    MaxConcurrentVisitors = 50,
                    AutoExpireHours = 24,
                    EnableEmailNotifs = true,
                    CompanyServices = new List<string> { "Direction", "Service RH", "Service Financier", "Service Informatique", "Secrétariat" }
                };
            }

            return new SystemConfigDto
            {
                CompanyName = entity.CompanyName,
                ContactEmail = entity.ContactEmail,
                PassValidityHours = entity.PassValidityHours,
                MaxConcurrentVisitors = entity.MaxConcurrentVisitors,
                AutoExpireHours = entity.AutoExpireHours,
                EnableEmailNotifs = entity.EnableEmailNotifs,
                CompanyServices = entity.CompanyServices
            };
        }
    }
}