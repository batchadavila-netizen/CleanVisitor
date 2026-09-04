import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'package:google_sign_in/google_sign_in.dart';
import '../models/user_model.dart';

class AuthService {
  static const String baseUrl = 'http://192.168.1.111:5283/api/auth';
  final GoogleSignIn _googleSignIn = GoogleSignIn();

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

    final role = data['user']['role'];
    final roleInt = role is int ? role : int.tryParse(role.toString()) ?? 0;
    if (roleInt != 3) {
      throw Exception('Accès réservé aux visiteurs uniquement.');
    }

    await _saveUserSession(loginResponse, data['user']);
    return loginResponse;
  }

  Future<bool> register({
    required String nom,
    required String prenom,
    required String email,
    required String password,
    required String telephone,
  }) async {
    final response = await http.post(
      Uri.parse('$baseUrl/register'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'Nom': nom,
        'Prenom': prenom,
        'Email': email,
        'Password': password,
        'Telephone': telephone,
        'Role': 3,
      }),
    );

    if (response.statusCode == 200 || response.statusCode == 201) {
      return true;
    } else {
      final error = jsonDecode(response.body);
      throw Exception(error['message'] ?? 'Erreur lors de l\'inscription');
    }
  }

  Future<LoginResponse?> signInWithGoogle() async {
    final GoogleSignInAccount? googleUser = await _googleSignIn.signIn();
    if (googleUser == null) return null;

    final GoogleSignInAuthentication googleAuth = await googleUser.authentication;

    final response = await http.post(
      Uri.parse('$baseUrl/google-login'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'IdToken': googleAuth.idToken,
        'AccessToken': googleAuth.accessToken,
      }),
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      final loginResponse = LoginResponse.fromJson(data);
      await _saveUserSession(loginResponse, data['user']);
      return loginResponse;
    } else {
      final error = jsonDecode(response.body);
      throw Exception(error['message'] ?? 'Échec de l\'authentification Google.');
    }
  }

  Future<void> _saveUserSession(LoginResponse loginResponse, dynamic userData) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('token', loginResponse.token);
    await prefs.setInt('userId', loginResponse.user.id);
    await prefs.setInt('visitorId', loginResponse.user.visitorId ?? loginResponse.user.id);
    await prefs.setString('userName', '${loginResponse.user.prenom} ${loginResponse.user.nom}');
    await prefs.setString('user', jsonEncode(userData));
  }

  Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.clear();
    await _googleSignIn.signOut();
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