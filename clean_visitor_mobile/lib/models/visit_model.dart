import 'package:flutter/material.dart';

class VisitModel {
  final int id;
  final String motif;
  final String date;
  final String heureArriver;
  final dynamic statut;

  VisitModel({
    required this.id,
    required this.motif,
    required this.date,
    required this.heureArriver,
    required this.statut,
  });

  factory VisitModel.fromJson(Map<String, dynamic> json) {
    return VisitModel(
      id: json['id'] ?? json['Id'] ?? 0,
      motif: json['motif'] ?? json['Motif'] ?? 'Visite standard',
      date: json['date'] ?? json['Date'] ?? '',
      heureArriver: json['heureArriver'] ?? json['HeureArriver'] ?? '00:00',
      statut: json['statut'] ?? json['Statut'] ?? 1,
    );
  }

  // Code correspondant à enumToCode & getEffectiveStatus
  int get effectiveStatus {
    const enumToCode = {
      "En_attente": 1,
      "Accepter": 2,
      "Terminee": 3,
      "Annulé": 4,
    };

    int code = enumToCode[statut] ?? (int.tryParse(statut.toString()) ?? 1);

    String dateStr = date.contains('T') ? date.split('T')[0] : date;
    String timeStr = heureArriver.isNotEmpty ? heureArriver : "00:00";

    if (dateStr.isNotEmpty) {
      try {
        DateTime visitDateTime = DateTime.parse("${dateStr}T$timeStr");
        DateTime now = DateTime.now();

        if (visitDateTime.isBefore(now)) {
          if (code == 2) return 3; // Acceptée -> Terminée si dépassée
          if (code == 1) return 4; // En attente -> Annulée si dépassée
        }
      } catch (e) {
        // En cas d'erreur de parsing date
      }
    }
    return code;
  }

  String get statusLabel {
    switch (effectiveStatus) {
      case 1:
        return "⏳ En attente";
      case 2:
        return "✅ Acceptée";
      case 3:
        return "🏁 Terminée";
      case 4:
        return "❌ Annulée";
      default:
        return "❓ $effectiveStatus";
    }
  }

  Color get statusBgColor {
    final label = statusLabel;
    if (label.contains("attente")) return const Color(0xFFFEF3C7); // amber-100
    if (label.contains("Accept")) return const Color(0xFFD1FAE5); // emerald-100
    if (label.contains("Termin")) return const Color(0xFFDBEAFE); // blue-100
    if (label.contains("Annul")) return const Color(0xFFFEE2E2); // red-100
    return const Color(0xFFF1F5F9);
  }

  Color get statusTextColor {
    final label = statusLabel;
    if (label.contains("attente")) return const Color(0xFFD97706); // amber-600
    if (label.contains("Accept")) return const Color(0xFF059669); // emerald-600
    if (label.contains("Termin")) return const Color(0xFF2563EB); // blue-600
    if (label.contains("Annul")) return const Color(0xFFDC2626); // red-600
    return const Color(0xFF94A3B8);
  }
}