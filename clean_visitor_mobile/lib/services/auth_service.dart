import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../models/user_model.dart';

class AuthService {
  // 🔥 Remplace X par ton IP locale (ipconfig dans le terminal)
  static const String baseUrl = 'http://localhost:5283/api/auth';
  Future<LoginResponse> login(String email, String password) async {
    final response = await http.post(
      Uri.parse('$baseUrl/login'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'Email': email, 'Password': password}),
    );

    if (response.statusCode != 200) {
      final error = jsonDecode(response.body);
      throw Exception(error['message'] ?? 'Identifiants invalides');
    }

    final data = jsonDecode(response.body);
    final loginResponse = LoginResponse.fromJson(data);

    // 🔥 Seuls les visiteurs (role = 3) peuvent accéder à l'app mobile
    final role = data['user']['role'];
    final roleInt = role is int ? role : int.tryParse(role.toString()) ?? 0;
    if (roleInt != 3) {
      throw Exception('Accès réservé aux visiteurs uniquement.');
    }

    // Sauvegarde locale
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('token', loginResponse.token);
    await prefs.setInt('userId', loginResponse.user.id);
    await prefs.setInt('visitorId', loginResponse.user.visitorId ?? loginResponse.user.id);
    await prefs.setString('userName', '${loginResponse.user.prenom} ${loginResponse.user.nom}');
    await prefs.setString('user', jsonEncode(data['user']));

    return loginResponse;
  }

  Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.clear();
  }

  Future<bool> isLoggedIn() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('token') != null;
  }

  Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('token');
  }
}