import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter_dotenv/flutter_dotenv.dart';

class VisitorService {
  static String get baseUrl => '${dotenv.env['API_BASE_URL']}/api/Visitor';

  Future<List<dynamic>> getAll() async {
    final response = await http.get(Uri.parse(baseUrl));
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    }
    throw Exception('Erreur lors du chargement des visiteurs');
  }

  Future<Map<String, dynamic>> getByEmail(String email) async {
    final response = await http.get(
      Uri.parse('${dotenv.env['API_BASE_URL']}/api/User/email/$email'),
    );
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    }
    throw Exception('Visiteur introuvable');
  }
}