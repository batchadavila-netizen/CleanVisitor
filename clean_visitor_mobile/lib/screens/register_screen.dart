import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _nomController = TextEditingController();
  final _prenomController = TextEditingController();
  final _emailController = TextEditingController();
  final _telephoneController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _loading = false;
  bool _showPassword = false;
  String? _error;

  @override
  void dispose() {
    _nomController.dispose();
    _prenomController.dispose();
    _emailController.dispose();
    _telephoneController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _handleRegister() async {
    if (_nomController.text.trim().isEmpty ||
        _prenomController.text.trim().isEmpty ||
        _emailController.text.trim().isEmpty ||
        _passwordController.text.trim().isEmpty ||
        _telephoneController.text.trim().isEmpty) {
      setState(() => _error = 'Veuillez remplir tous les champs.');
      return;
    }

    setState(() {
      _loading = true;
      _error = null;
    });

    try {
      const String apiBaseUrl = 'http://192.168.1.111:5283'; 

      final response = await http.post(
        Uri.parse('$apiBaseUrl/api/auth/register'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'Nom': _nomController.text.trim(),
          'Prenom': _prenomController.text.trim(),
          'Email': _emailController.text.trim(),
          'Password': _passwordController.text.trim(),
          'Telephone': _telephoneController.text.trim(),
          'Role': 3,
        }),
      );

      if (response.statusCode == 201 || response.statusCode == 200) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Inscription réussie ! Connectez-vous.'),
              backgroundColor: Color(0xFF10B981),
            ),
          );
          Navigator.pushReplacementNamed(context, '/login');
        }
      } else {
        final errorData = jsonDecode(response.body);
        setState(() => _error = errorData['message'] ?? "Erreur lors de l'inscription");
      }
    } catch (e) {
      setState(() => _error = "Impossible de contacter le serveur backend.");
    } finally {
      if (mounted) {
        setState(() => _loading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      body: Stack(
        children: [
          Positioned(
            top: -50,
            right: -30,
            child: Container(
              width: 250,
              height: 250,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: Colors.transparent,
                boxShadow: [
                  BoxShadow(
                    color: const Color(0xFF2563EB).withValues(alpha: 0.2),
                    blurRadius: 90,
                    spreadRadius: 30,
                  ),
                ],
              ),
            ),
          ),
          Positioned(
            bottom: -50,
            left: -40,
            child: Container(
              width: 260,
              height: 260,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: Colors.transparent,
                boxShadow: [
                  BoxShadow(
                    color: const Color(0xFF7C3AED).withValues(alpha: 0.2),
                    blurRadius: 100,
                    spreadRadius: 35,
                  ),
                ],
              ),
            ),
          ),
          SafeArea(
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  IconButton(
                    onPressed: () => Navigator.pop(context),
                    icon: const Icon(Icons.arrow_back_ios_new_rounded, color: Colors.white70, size: 20),
                    style: IconButton.styleFrom(
                      backgroundColor: Colors.white.withValues(alpha: 0.05),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                  ),
                  const SizedBox(height: 20),
                  const Text(
                    'Créer un compte',
                    style: TextStyle(
                      fontSize: 28,
                      fontWeight: FontWeight.w900,
                      color: Colors.white,
                      letterSpacing: -0.8,
                    ),
                  ),
                  const SizedBox(height: 6),
                  const Text(
                    'Rejoignez Gestion des visites en tant que visiteur',
                    style: TextStyle(
                      fontSize: 14,
                      color: Color(0xFF94A3B8),
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                  const SizedBox(height: 28),
                  Container(
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.05),
                      borderRadius: BorderRadius.circular(24),
                      border: Border.all(color: Colors.white.withValues(alpha: 0.1)),
                    ),
                    padding: const EdgeInsets.all(20),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Expanded(child: _buildField('Nom', _nomController, Icons.person_outline)),
                            const SizedBox(width: 12),
                            Expanded(child: _buildField('Prénom', _prenomController, Icons.person_outline)),
                          ],
                        ),
                        const SizedBox(height: 16),
                        _buildField('Email', _emailController, Icons.email_outlined,
                            keyboardType: TextInputType.emailAddress),
                        const SizedBox(height: 16),
                        _buildField('Téléphone', _telephoneController, Icons.phone_outlined,
                            keyboardType: TextInputType.phone),
                        const SizedBox(height: 16),
                        _buildLabel('Mot de passe'),
                        const SizedBox(height: 8),
                        TextField(
                          controller: _passwordController,
                          obscureText: !_showPassword,
                          style: const TextStyle(fontWeight: FontWeight.w600, color: Colors.white),
                          decoration: InputDecoration(
                            prefixIcon: const Icon(Icons.lock_outline_rounded, color: Color(0xFF64748B), size: 20),
                            hintText: '••••••••',
                            hintStyle: const TextStyle(color: Color(0xFF475569)),
                            filled: true,
                            fillColor: Colors.white.withValues(alpha: 0.04),
                            enabledBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(14),
                              borderSide: BorderSide(color: Colors.white.withValues(alpha: 0.08)),
                            ),
                            focusedBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(14),
                              borderSide: const BorderSide(color: Color(0xFF38BDF8), width: 1.5),
                            ),
                            contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
                            suffixIcon: IconButton(
                              icon: Icon(
                                _showPassword ? Icons.visibility_off_rounded : Icons.visibility_rounded,
                                color: const Color(0xFF64748B),
                                size: 20,
                              ),
                              onPressed: () => setState(() => _showPassword = !_showPassword),
                            ),
                          ),
                        ),
                        const SizedBox(height: 20),
                        if (_error != null) ...[
                          Container(
                            width: double.infinity,
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: const Color(0xFFEF4444).withValues(alpha: 0.15),
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(color: const Color(0xFFEF4444).withValues(alpha: 0.3)),
                            ),
                            child: Row(
                              children: [
                                const Icon(Icons.error_outline_rounded, color: Color(0xFFFCA5A5), size: 18),
                                const SizedBox(width: 8),
                                Expanded(
                                  child: Text(
                                    _error!,
                                    style: const TextStyle(
                                      color: Color(0xFFFCA5A5),
                                      fontSize: 13,
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(height: 16),
                        ],
                        Container(
                          width: double.infinity,
                          height: 52,
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(14),
                            gradient: const LinearGradient(
                              colors: [Color(0xFF2563EB), Color(0xFF4F46E5)],
                            ),
                            boxShadow: [
                              BoxShadow(
                                color: const Color(0xFF2563EB).withValues(alpha: 0.35),
                                blurRadius: 16,
                                offset: const Offset(0, 6),
                              )
                            ],
                          ),
                          child: ElevatedButton(
                            onPressed: _loading ? null : _handleRegister,
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.transparent,
                              shadowColor: Colors.transparent,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(14),
                              ),
                            ),
                            child: _loading
                                ? const SizedBox(
                                    width: 22,
                                    height: 22,
                                    child: CircularProgressIndicator(
                                      color: Colors.white,
                                      strokeWidth: 2.5,
                                    ),
                                  )
                                : const Text(
                                    "S'INSCRIRE",
                                    style: TextStyle(
                                      fontWeight: FontWeight.w800,
                                      fontSize: 15,
                                      color: Colors.white,
                                      letterSpacing: 0.5,
                                    ),
                                  ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 24),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Text(
                        'Déjà un compte ? ',
                        style: TextStyle(color: Color(0xFF94A3B8), fontSize: 14),
                      ),
                      GestureDetector(
                        onTap: () => Navigator.pushReplacementNamed(context, '/login'),
                        child: const Text(
                          'Se connecter',
                          style: TextStyle(
                            color: Color(0xFF38BDF8),
                            fontSize: 14,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 24),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildField(
    String label,
    TextEditingController controller,
    IconData icon, {
    TextInputType keyboardType = TextInputType.text,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildLabel(label),
        const SizedBox(height: 8),
        TextField(
          controller: controller,
          keyboardType: keyboardType,
          style: const TextStyle(fontWeight: FontWeight.w600, color: Colors.white),
          decoration: InputDecoration(
            prefixIcon: Icon(icon, color: const Color(0xFF64748B), size: 20),
            filled: true,
            fillColor: Colors.white.withValues(alpha: 0.04),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(14),
              borderSide: BorderSide(color: Colors.white.withValues(alpha: 0.08)),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(14),
              borderSide: const BorderSide(color: Color(0xFF38BDF8), width: 1.5),
            ),
            contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
          ),
        ),
      ],
    );
  }

  Widget _buildLabel(String text) {
    return Text(
      text.toUpperCase(),
      style: const TextStyle(
        fontSize: 11,
        fontWeight: FontWeight.w800,
        color: Color(0xFF94A3B8),
        letterSpacing: 1.2,
      ),
    );
  }
}