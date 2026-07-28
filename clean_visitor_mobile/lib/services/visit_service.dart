import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/visit_model.dart';

class VisitService {
  static const String baseUrl = 'http://votre-api-url.com/api'; // Remplacez par votre URL

  static Future<List<VisitModel>> getVisitorVisits(String visitorId) async {
    try {
      final response = await http.get(Uri.parse('$baseUrl/visits/visitor/$visitorId'));

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        
        // Gestion de la structure $values (Newtonsoft JSON C#)
        List dynamicList = [];
        if (data is Map && data.containsKey('listVisitClon')) {
          dynamicList = data['listVisitClon']['\$values'] ?? [];
        } else if (data is Map && data.containsKey('\$values')) {
          dynamicList = data['\$values'];
        } else if (data is List) {
          dynamicList = data;
        }

        List<VisitModel> visits = dynamicList.map((e) => VisitModel.fromJson(e)).toList();

        // Tri décroissant par date
        visits.sort((a, b) {
          DateTime dateA = DateTime.tryParse(a.date) ?? DateTime(1970);
          DateTime dateB = DateTime.tryParse(b.date) ?? DateTime(1970);
          return dateB.compareTo(dateA);
        });

        return visits;
      } else {
        throw Exception('Erreur serveur: ${response.statusCode}');
      }
    } catch (e) {
      rethrow;
    }
  }
}