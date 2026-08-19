import 'package:flutter/material.dart';
import '../screens/create_visit_screen.dart';
import '../models/visit_model.dart';

class DetailVisitDialog extends StatelessWidget {
  final Map<String, dynamic> visit;

  const DetailVisitDialog({
    super.key,
    required this.visit,
  });

  @override
  Widget build(BuildContext context) {
    // 1. Récupération du statut initial
    final dynamic s = visit['statut'] ?? visit['Statut'];

    // 2. Calcul de la date/heure de la visite
    final String rawDate = visit['date'] ?? visit['Date'] ?? '';
    final String rawHeure = visit['heureArriver'] ?? visit['HeureArriver'] ?? '00:00';

    DateTime visitDateTime = DateTime.now();
    if (rawDate.isNotEmpty) {
      final dateOnly = rawDate.split('T')[0];
      visitDateTime = DateTime.tryParse('${dateOnly}T$rawHeure') ?? DateTime.now();
    }

    final DateTime now = DateTime.now();

    // 3. Calcul du statut effectif selon les règles
    dynamic statutEffectif = s;
    if (visitDateTime.isBefore(now)) {
      if (s == 2 || s == "Accepter") {
        statutEffectif = 3; // Terminé
      } else if (s == 1 || s == "En attente") {
        statutEffectif = 4; // Rejeté
      }
    }

    // 4. Définition des états
    final bool isAcceptee = statutEffectif == 2 || statutEffectif == "Accepter";
    final bool isTerminee = statutEffectif == 3 || statutEffectif == "Terminé" || statutEffectif == "Terminee";
    final bool isRejetee = statutEffectif == 4 || statutEffectif == "Annulé" || statutEffectif == "Rejeter";

    // Règle d'autorisation de reprogrammation
    final List<dynamic> allowedStatuses = [1, 2, 4, "En attente", "Accepter", "Annulé"];
    final bool canReschedule = allowedStatuses.contains(statutEffectif);

    // Dynamic Colors & Texts
    final Color headerColor = isRejetee
        ? Colors.red.shade600
        : isTerminee
            ? Colors.green.shade600
            : Colors.indigo.shade600;

    final String titleText = isRejetee
        ? 'VISITE REJETÉE'
        : isTerminee
            ? 'VISITE TERMINÉE'
            : 'DÉTAILS DE LA VISITE';

    final String visitId = (visit['id'] ?? visit['Id'] ?? '').toString();
    final String serviceName = (visit['service'] ?? visit['Service'] ?? 'Non spécifié').toString();
    final String motifText = (visit['motif'] ?? visit['Motif'] ?? '').toString();

    return Dialog(
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(32.0),
      ),
      clipBehavior: Clip.antiAlias,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // HEADER DYNAMIQUE
          Container(
            color: headerColor,
            padding: const EdgeInsets.all(24.0),
            child: Stack(
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      titleText,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 18,
                        fontWeight: FontWeight.w900,
                        letterSpacing: -0.5,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'RÉFÉRENCE : #VIS-$visitId',
                      style: TextStyle(
                        color: Colors.white.withOpacity(0.8),
                        fontSize: 10,
                        fontWeight: FontWeight.w900,
                        letterSpacing: 1.2,
                      ),
                    ),
                  ],
                ),
                Positioned(
                  top: 0,
                  right: 0,
                  child: IconButton(
                    icon: const Icon(Icons.close, color: Colors.white),
                    onPressed: () => Navigator.pop(context),
                  ),
                ),
              ],
            ),
          ),

          // BODY
          Padding(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Alerte si rejetée
                if (isRejetee) ...[
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: Colors.red.shade50,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: Colors.red.shade100),
                    ),
                    child: Row(
                      children: [
                        Icon(Icons.error_outline, size: 18, color: Colors.red.shade600),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            "Cette demande a été refusée. Vous pouvez la reprogrammer pour proposer un nouveau créneau.",
                            style: TextStyle(
                              color: Colors.red.shade600,
                              fontSize: 12,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 20),
                ],

                // DATE & HEURE
                Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            "DATE",
                            style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: Colors.grey),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            rawDate.isNotEmpty ? rawDate.split('T')[0] : '--/--/----',
                            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                          ),
                        ],
                      ),
                    ),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            "HEURE",
                            style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: Colors.grey),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            rawHeure,
                            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 16),

                // SERVICE
                const Text(
                  "SERVICE",
                  style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: Colors.grey),
                ),
                const SizedBox(height: 2),
                Text(
                  serviceName,
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 14,
                    color: Colors.indigo.shade600,
                  ),
                ),

                const SizedBox(height: 16),

                // MOTIF
                const Text(
                  "MOTIF",
                  style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: Colors.grey),
                ),
                const SizedBox(height: 6),
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.grey.shade100,
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Text(
                    '"$motifText"',
                    style: TextStyle(
                      fontStyle: FontStyle.italic,
                      fontSize: 13,
                      color: Colors.grey.shade700,
                    ),
                  ),
                ),

                const SizedBox(height: 24),

                // BOUTONS D'ACTION
                if (canReschedule)
                  SizedBox(
                    width: double.infinity,
                    height: 50,
                    child: ElevatedButton.icon(
                      icon: const Icon(Icons.refresh, size: 18),
                      label: const Text(
                        "Reprogrammer maintenant",
                        style: TextStyle(fontWeight: FontWeight.bold),
                      ),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: isRejetee ? Colors.red.shade600 : Colors.indigo.shade600,
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(16),
                        ),
                      ),
                      onPressed: () {
                        // 1. Fermer le modal
                        Navigator.pop(context);

                        // 2. Rediriger vers l'écran de création/reprogrammation
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) => CreateVisitScreen(
                            initialData: visit,
                            ),
                          ),
                        );
                      },
                    ),
                  )
                else
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: Colors.grey.shade100,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: Colors.grey.shade300, style: BorderStyle.solid),
                    ),
                    child: Text(
                      isTerminee
                          ? "✅ Visite terminée"
                          : isRejetee
                              ? "❌ Visite rejetée"
                              : "⏳ En attente de décision",
                      textAlign: TextAlign.center,
                      style: const TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.w900,
                        color: Colors.grey,
                      ),
                    ),
                  ),

                const SizedBox(height: 8),

                // Bouton Fermer
                SizedBox(
                  width: double.infinity,
                  child: TextButton(
                    onPressed: () => Navigator.pop(context),
                    child: const Text(
                      "FERMER",
                      style: TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.w900,
                        color: Colors.grey,
                        letterSpacing: 1.2,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}