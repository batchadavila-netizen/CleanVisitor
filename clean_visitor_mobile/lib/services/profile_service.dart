import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';

class ProfileService {
  static String get baseUrl => '${dotenv.env['API_BASE_URL']}/api/user';

  Future<Map<String, String>> _getHeaders() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('token') ?? '';
    return {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer $token',
    };
  }

  Future<Map<String, dynamic>> getProfile(String userId) async {
    final headers = await _getHeaders();
    final response = await http.get(
      Uri.parse('$baseUrl/profile/$userId'),
      headers: headers,
    );
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    }
    throw Exception('Erreur lors du chargement du profil (${response.statusCode})');
  }

  Future<void> updateProfile(String userId, Map<String, dynamic> data) async {
    final headers = await _getHeaders();
    final response = await http.put(
      Uri.parse('$baseUrl/profile/$userId'),
      headers: headers,
      body: jsonEncode(data),
    );
    if (response.statusCode != 200) {
      throw Exception('Erreur lors de la mise à jour (${response.statusCode})');
    }
  }

  Future<void> changePassword(String userId, String currentPassword, String newPassword) async {
    final headers = await _getHeaders();
    final response = await http.put(
      Uri.parse('$baseUrl/profile/$userId'),
      headers: headers,
      body: jsonEncode({
        'CurrentPassword': currentPassword,
        'NewPassword': newPassword,
      }),
    );
    if (response.statusCode != 200) {
      throw Exception('Erreur lors du changement de mot de passe (${response.statusCode})');
    }
  }
}