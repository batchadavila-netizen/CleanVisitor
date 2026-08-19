import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';

class NotificationService {
  static String get baseUrl => '${dotenv.env['API_BASE_URL']}/api/Notifications';

  Future<Map<String, String>> _getHeaders() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('token') ?? '';
    return {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer $token',
    };
  }

  Future<List<Map<String, dynamic>>> getByVisitor(String visitorId) async {
    final headers = await _getHeaders();
    final response = await http.get(
      Uri.parse('$baseUrl/visitor/$visitorId'),
      headers: headers,
    );

    if (response.statusCode == 200) {
      final dynamic body = jsonDecode(response.body);
      List<dynamic> list = body is List ? body : (body['\$values'] ?? []);
      return list.cast<Map<String, dynamic>>();
    } else {
      throw Exception('Erreur chargement notifications');
    }
  }
}