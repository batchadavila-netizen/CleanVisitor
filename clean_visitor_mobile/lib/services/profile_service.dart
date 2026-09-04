import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';

class ProfileService {
  // Ajustement de la route vers /api/User ou /api/Users selon votre backend
  static String get baseUrl => '${dotenv.env['API_BASE_URL']}/api/Users';

  Future<Map<String, String>> _getHeaders() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('token') ?? '';
    return {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer $token',
    };
  }

  // Récupérer le profil utilisateur
  Future<Map<String, dynamic>> getProfile(String userId) async {
    final headers = await _getHeaders();
    
    // Si votre contrôleur C# utilise [HttpGet("{id}")] sur UsersController
    final response = await http.get(
      Uri.parse('$baseUrl/$userId'),
      headers: headers,
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body) as Map<String, dynamic>;
    }
    
    throw Exception('Erreur serveur (${response.statusCode}) : ${response.body}');
  }

  // Mettre à jour les informations du profil
  Future<void> updateProfile(String userId, Map<String, dynamic> data) async {
    final headers = await _getHeaders();
    final response = await http.put(
      Uri.parse('$baseUrl/$userId'),
      headers: headers,
      body: jsonEncode(data),
    );

    if (response.statusCode != 200 && response.statusCode != 204) {
      throw Exception('Erreur de mise à jour (${response.statusCode})');
    }
  }

  // Changer le mot de passe
  Future<void> changePassword(String userId, String currentPassword, String newPassword) async {
    final headers = await _getHeaders();
    final response = await http.put(
      Uri.parse('$baseUrl/change-password/$userId'),
      headers: headers,
      body: jsonEncode({
        'CurrentPassword': currentPassword,
        'NewPassword': newPassword,
      }),
    );

    if (response.statusCode != 200 && response.statusCode != 204) {
      throw Exception('Erreur lors du changement de mot de passe (${response.statusCode})');
    }
  }
}