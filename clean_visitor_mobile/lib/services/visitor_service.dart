import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';

class VisitorService {
  static String get baseUrl => '${dotenv.env['API_BASE_URL']}/api';

  Future<Map<String, String>> _getHeaders() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('token') ?? '';
    return {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer $token',
    };
  }

  Future<List<dynamic>> getAll() async {
    final headers = await _getHeaders();
    final response = await http.get(
      Uri.parse('$baseUrl/Visitor'),
      headers: headers,
    );
    
    if (response.statusCode == 200) {
      final dynamic body = jsonDecode(response.body);
      if (body is Map && body.containsKey('\$values')) {
        return body['\$values'];
      }
      return body is List ? body : [];
    }
    throw Exception('Erreur lors du chargement des visiteurs');
  }

  Future<Map<String, dynamic>> getByEmail(String email) async {
    final headers = await _getHeaders();
    final response = await http.get(
      Uri.parse('$baseUrl/User/email/$email'),
      headers: headers,
    );
    
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    }
    throw Exception('Visiteur introuvable');
  }
}