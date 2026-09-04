import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';

class NotificationService {
  // Construit l'URL à partir du .env (cible http://.../api/Notifications)
  static String get baseUrl => '${dotenv.env['API_BASE_URL']}/api/Notifications';

  Future<Map<String, String>> _getHeaders() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('token') ?? '';
    return {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer $token',
    };
  }

  // Accepte un String ou un int et gère la route /api/Notifications/visitor/{id}
  Future<List<Map<String, dynamic>>> getByVisitor(dynamic visitorId) async {
    final headers = await _getHeaders();
    
    // S'assurer de nettoyer la valeur de l'identifiant pour la route
    final String parsedId = visitorId.toString().trim();

    final response = await http.get(
      Uri.parse('$baseUrl/visitor/$parsedId'),
      headers: headers,
    );

    if (response.statusCode == 200) {
      final dynamic body = jsonDecode(response.body);
      
      // Extraction de la liste selon la présence éventuelle du wrapper $values (System.Text.Json / Newtonsoft)
      List<dynamic> list = [];
      if (body is Map && body.containsKey('\$values')) {
        list = body['\$values'];
      } else if (body is List) {
        list = body;
      }

      return list.cast<Map<String, dynamic>>();
    } else {
      throw Exception('Erreur chargement notifications (${response.statusCode})');
    }
  }
}