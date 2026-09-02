import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import '../models/visit_model.dart';

class VisitService {
  static String get baseUrl => '${dotenv.env['API_BASE_URL']}/api/Visits';

  // Header partagé
  static Future<Map<String, String>> _getHeaders() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('token') ?? '';
    return {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer $token',
    };
  }

  // 1. Déclarée en STATIC pour correspondre à l'appel dans VisiteurDashboardScreen
  static Future<List<VisitModel>> getVisitorVisits(String visitorId) async {
    try {
      final headers = await _getHeaders();
      final response = await http.get(
        Uri.parse('$baseUrl/visitor/$visitorId'),
        headers: headers,
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        
        List dynamicList = [];
        if (data is Map && data.containsKey('listVisitClon')) {
          dynamicList = data['listVisitClon']['\$values'] ?? [];
        } else if (data is Map && data.containsKey('\$values')) {
          dynamicList = data['\$values'];
        } else if (data is List) {
          dynamicList = data;
        }

        List<VisitModel> visits = dynamicList.map((e) => VisitModel.fromJson(e)).toList();

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

  // 2. Méthode D'INSTANCE pour CreateVisitScreen
  Future<bool> create(Map<String, dynamic> payload) async {
    final headers = await _getHeaders();
    final response = await http.post(
      Uri.parse(baseUrl),
      headers: headers,
      body: jsonEncode(payload),
    );

    if (response.statusCode == 200 || response.statusCode == 201) {
      return true;
    } else {
      final error = jsonDecode(response.body);
      throw Exception(error['message'] ?? 'Erreur lors de la création');
    }
  }

  // 3. Méthode D'INSTANCE pour CreateVisitScreen (reprogrammation)
  Future<bool> updateVisit(Map<String, dynamic> payload) async {
    final headers = await _getHeaders();
    final String visitId = (payload['id'] ?? payload['Id'] ?? '').toString();

    final response = await http.put(
      Uri.parse('$baseUrl/$visitId'),
      headers: headers,
      body: jsonEncode(payload),
    );

    if (response.statusCode == 200 || response.statusCode == 204) {
      return true;
    } else {
      final error = jsonDecode(response.body);
      throw Exception(error['message'] ?? 'Erreur lors de la mise à jour');
    }
  }
}