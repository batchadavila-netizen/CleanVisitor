using MediatR;
using AutoMapper;
using CleanVisitor.Core.Entities;
using CleanVisitor.Application.Features.Visitors.Dtos;
using CleanVisitor.Application.Features.Visitors.Interfaces;
using CleanVisitor.Application.Features.Visitors.Commande.CreateVisitor;

namespace CleanVisitor.Application.Features.Visitors.Commande.CreateVisitor.CreateVisitorHandler
{
    public class CreateVisitorHandler : IRequestHandler<CreateVisitorCommand, VisitorDto?>
    {
        private readonly IVisitorRepository _repository;
        private readonly IMapper _mapper;

        // 1. Injection du repository ou service qui gère les utilisateurs pour faire la liaison
        // Note: Si ton IVisitorRepository possède déjà une méthode pour manipuler les Users ou si tu as un IUserRepository, 
        // assure-toi de l'injecter ici. Supposons ici qu'on utilise un mécanisme d'accès pour mettre à jour le User.
        public CreateVisitorHandler(IVisitorRepository repository, IMapper mapper)
        {
            _repository = repository;
            _mapper = mapper;
        }

        public async Task<VisitorDto?> Handle(CreateVisitorCommand request, CancellationToken cancellationToken)
        {
            // 2. Mappage et création du visiteur dans la table Visitors
            var visitor = _mapper.Map<Visitor>(request);
            var createdVisitorDto = await _repository.AddAsync(visitor);

            // Si la création du visiteur a échoué, on s'arrête
            if (createdVisitorDto == null) return null;

            try
            {
                // 3. LA LIAISON : On récupère l'ID généré par la base de données pour ce nouveau visiteur
                // Selon la structure de ton VisitorDto, assure-toi que la propriété s'appelle Id ou VisitorId
                var generatedVisitorId = createdVisitorDto.Id; 

                // 4. Mise à jour de l'entité User correspondante via l'email
                // On va chercher l'utilisateur créé avec cet email pour lui attribuer son VisitorId
                if (!string.IsNullOrEmpty(request.Email))
                {
                    await _repository.LinkVisitorToUserAsync(request.Email, generatedVisitorId);
                }
            }
            catch (Exception ex)
            {
                // Log l'erreur si nécessaire pour éviter de bloquer tout le processus en cas de souci de liaison
                Console.WriteLine($"Erreur lors de la liaison du VisitorId au User : {ex.Message}");
            }

            return createdVisitorDto;
        }
    }
}