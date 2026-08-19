import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../services/profile_service.dart';
import '../widgets/app_drawer.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  final ProfileService _profileService = ProfileService();

  bool _loading = true;
  String? _error;

  Map<String, dynamic> _user = {
    'id': '', 'nom': '', 'prenom': '', 'email': '', 'telephone': '', 'role': ''
  };

  bool _isEditing = false;
  final _nomController = TextEditingController();
  final _prenomController = TextEditingController();
  final _emailController = TextEditingController();
  final _telephoneController = TextEditingController();
  bool _saving = false;
  String? _saveError;

  bool _showPasswordForm = false;
  final _currentPasswordController = TextEditingController();
  final _newPasswordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();
  bool _passwordSaving = false;
  String? _passwordError;

  @override
  void initState() {
    super.initState();
    _fetchProfile();
  }

  @override
  void dispose() {
    _nomController.dispose();
    _prenomController.dispose();
    _emailController.dispose();
    _telephoneController.dispose();
    _currentPasswordController.dispose();
    _newPasswordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }

  Future<void> _fetchProfile() async {
  setState(() {
    _loading = true;
    _error = null;
  });
  try {
    final prefs = await SharedPreferences.getInstance();
    final userId = prefs.getString('userId') ?? '';
    if (userId.isEmpty) {
      setState(() {
        _error = "Session expirée. Veuillez vous reconnecter.";
        _loading = false;
      });
      return;
    }

    final data = await _profileService.getProfile(userId);

    final mapped = {
      'id': (data['id'] ?? data['userId'] ?? userId).toString(),
      'nom': (data['nom'] ?? data['Nom'] ?? data['lastName'] ?? '').toString(),
      'prenom': (data['prenom'] ?? data['Prenom'] ?? data['firstName'] ?? '').toString(),
      'email': (data['email'] ?? data['Email'] ?? '').toString(),
      'telephone': (data['telephone'] ?? data['Telephone'] ?? data['phoneNumber'] ?? '').toString(),
      'role': 'Visiteur', // toujours Visiteur sur mobile
    };

    setState(() {
      _user = mapped;
      _nomController.text = mapped['nom']!;
      _prenomController.text = mapped['prenom']!;
      _emailController.text = mapped['email']!;
      _telephoneController.text = mapped['telephone']!;
      _loading = false;
    });
  } catch (e) {
    setState(() {
      _error = "Impossible de contacter le serveur.";
      _loading = false;
    });
  }
}

  void _cancelEdit() {
    setState(() {
      _nomController.text = _user['nom'];
      _prenomController.text = _user['prenom'];
      _emailController.text = _user['email'];
      _telephoneController.text = _user['telephone'];
      _isEditing = false;
      _saveError = null;
    });
  }

  Future<void> _saveProfile() async {
    setState(() {
      _saving = true;
      _saveError = null;
    });
    try {
      final prefs = await SharedPreferences.getInstance();
      final userId = prefs.getString('userId') ?? '';

      await _profileService.updateProfile(userId, {
        'Id': userId,
        'Nom': _nomController.text,
        'Prenom': _prenomController.text,
        'Email': _emailController.text,
        'Telephone': _telephoneController.text,
      });

      setState(() {
        _user = {
          ..._user,
          'nom': _nomController.text,
          'prenom': _prenomController.text,
          'email': _emailController.text,
          'telephone': _telephoneController.text,
        };
        _isEditing = false;
      });

      await prefs.setString('userName', '${_prenomController.text} ${_nomController.text}');

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Profil mis à jour avec succès.'), backgroundColor: Colors.green),
        );
      }
    } catch (e) {
      setState(() => _saveError = e.toString());
    } finally {
      setState(() => _saving = false);
    }
  }

  Future<void> _changePassword() async {
    setState(() => _passwordError = null);

    if (_currentPasswordController.text.isEmpty ||
        _newPasswordController.text.isEmpty ||
        _confirmPasswordController.text.isEmpty) {
      setState(() => _passwordError = "Tous les champs sont obligatoires.");
      return;
    }
    if (_newPasswordController.text.length < 6) {
      setState(() => _passwordError = "Le nouveau mot de passe doit contenir au moins 6 caractères.");
      return;
    }
    if (_newPasswordController.text != _confirmPasswordController.text) {
      setState(() => _passwordError = "Les mots de passe ne correspondent pas.");
      return;
    }

    setState(() => _passwordSaving = true);
    try {
      final prefs = await SharedPreferences.getInstance();
      final userId = prefs.getString('userId') ?? '';

      await _profileService.changePassword(
        userId,
        _currentPasswordController.text,
        _newPasswordController.text,
      );

      _currentPasswordController.clear();
      _newPasswordController.clear();
      _confirmPasswordController.clear();

      setState(() => _showPasswordForm = false);

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Mot de passe modifié avec succès.'), backgroundColor: Colors.green),
        );
      }
    } catch (e) {
      setState(() => _passwordError = e.toString());
    } finally {
      setState(() => _passwordSaving = false);
    }
  }

  String _getInitials() {
    final n = (_user['nom'] as String).isNotEmpty ? _user['nom'][0] : '';
    final p = (_user['prenom'] as String).isNotEmpty ? _user['prenom'][0] : '';
    return '$p$n'.toUpperCase();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: const Text('Mon Profil'),
        backgroundColor: Colors.white,
        foregroundColor: const Color(0xFF1E293B),
        elevation: 0,
      ),
      drawer: const AppDrawer(),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? Center(
                  child: Padding(
                    padding: const EdgeInsets.all(24.0),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.error_outline, color: Colors.red, size: 48),
                        const SizedBox(height: 12),
                        Text(_error!, textAlign: TextAlign.center),
                        const SizedBox(height: 16),
                        ElevatedButton(
                          onPressed: _fetchProfile,
                          child: const Text('Réessayer'),
                        ),
                      ],
                    ),
                  ),
                )
              : RefreshIndicator(
                  onRefresh: _fetchProfile,
                  child: SingleChildScrollView(
                    physics: const AlwaysScrollableScrollPhysics(),
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      children: [
                        // CARTE PROFIL
                        Container(
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(color: const Color(0xFFF1F5F9)),
                          ),
                          child: Column(
                            children: [
                              Container(
                                height: 70,
                                decoration: const BoxDecoration(
                                  gradient: LinearGradient(
                                    colors: [Color(0xFF2563EB), Color(0xFF4338CA)],
                                  ),
                                  borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
                                ),
                              ),
                              Transform.translate(
                                offset: const Offset(0, -35),
                                child: Column(
                                  children: [
                                    Container(
                                      width: 70,
                                      height: 70,
                                      decoration: BoxDecoration(
                                        color: const Color(0xFF1E293B),
                                        borderRadius: BorderRadius.circular(16),
                                        border: Border.all(color: Colors.white, width: 4),
                                      ),
                                      child: Center(
                                        child: Text(
                                          _getInitials(),
                                          style: const TextStyle(
                                            color: Colors.white,
                                            fontSize: 22,
                                            fontWeight: FontWeight.bold,
                                          ),
                                        ),
                                      ),
                                    ),
                                    const SizedBox(height: 8),
                                    Text(
                                      '${_user['prenom']} ${_user['nom']}',
                                      style: const TextStyle(fontSize: 17, fontWeight: FontWeight.w600),
                                    ),
                                    const SizedBox(height: 6),
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                      decoration: BoxDecoration(
                                        color: const Color(0xFFEFF6FF),
                                        borderRadius: BorderRadius.circular(8),
                                        border: Border.all(color: const Color(0xFFDBEAFE)),
                                      ),
                                      child: Text(
                                        _user['role'],
                                        style: const TextStyle(
                                          fontSize: 11,
                                          fontWeight: FontWeight.bold,
                                          color: Color(0xFF2563EB),
                                        ),
                                      ),
                                    ),
                                    const SizedBox(height: 8),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ),

                        const SizedBox(height: 4),

                        // FICHE D'IDENTIFICATION
                        Container(
                          width: double.infinity,
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(color: const Color(0xFFF1F5F9)),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  const Text(
                                    "Fiche d'identification",
                                    style: TextStyle(fontWeight: FontWeight.w700, fontSize: 15),
                                  ),
                                  if (!_isEditing)
                                    TextButton.icon(
                                      onPressed: () => setState(() => _isEditing = true),
                                      icon: const Icon(Icons.edit, size: 15),
                                      label: const Text('Modifier'),
                                    )
                                  else
                                    Row(
                                      children: [
                                        TextButton(
                                          onPressed: _saving ? null : _cancelEdit,
                                          child: const Text('Annuler'),
                                        ),
                                        ElevatedButton(
                                          onPressed: _saving ? null : _saveProfile,
                                          style: ElevatedButton.styleFrom(
                                            backgroundColor: const Color(0xFF2563EB),
                                            foregroundColor: Colors.white,
                                          ),
                                          child: _saving
                                              ? const SizedBox(
                                                  width: 14,
                                                  height: 14,
                                                  child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                                                )
                                              : const Text('Enregistrer'),
                                        ),
                                      ],
                                    ),
                                ],
                              ),
                              if (_saveError != null) ...[
                                const SizedBox(height: 8),
                                Container(
                                  padding: const EdgeInsets.all(10),
                                  decoration: BoxDecoration(
                                    color: Colors.red.shade50,
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                  child: Text(_saveError!, style: TextStyle(color: Colors.red.shade700, fontSize: 12)),
                                ),
                              ],
                              const SizedBox(height: 14),
                              _buildField('Nom', _nomController, _isEditing),
                              const SizedBox(height: 12),
                              _buildField('Prénom', _prenomController, _isEditing),
                              const SizedBox(height: 12),
                              _buildField('Email', _emailController, _isEditing, keyboardType: TextInputType.emailAddress),
                              const SizedBox(height: 12),
                              _buildField('Téléphone', _telephoneController, _isEditing, keyboardType: TextInputType.phone),
                            ],
                          ),
                        ),

                        const SizedBox(height: 16),

                        // SÉCURITÉ
                        Container(
                          width: double.infinity,
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: const Color(0xFF1E293B),
                            borderRadius: BorderRadius.circular(16),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  const Text(
                                    'Sécurité',
                                    style: TextStyle(color: Colors.white, fontWeight: FontWeight.w600, fontSize: 15),
                                  ),
                                  if (!_showPasswordForm)
                                    TextButton(
                                      onPressed: () => setState(() => _showPasswordForm = true),
                                      child: const Text('Changer le mot de passe', style: TextStyle(color: Colors.white70)),
                                    ),
                                ],
                              ),
                              if (_showPasswordForm) ...[
                                const SizedBox(height: 12),
                                if (_passwordError != null) ...[
                                  Container(
                                    padding: const EdgeInsets.all(10),
                                    decoration: BoxDecoration(
                                      color: Colors.red.withOpacity(0.15),
                                      borderRadius: BorderRadius.circular(8),
                                    ),
                                    child: Text(_passwordError!, style: const TextStyle(color: Colors.redAccent, fontSize: 12)),
                                  ),
                                  const SizedBox(height: 10),
                                ],
                                _buildDarkField('Mot de passe actuel', _currentPasswordController),
                                const SizedBox(height: 10),
                                _buildDarkField('Nouveau mot de passe', _newPasswordController),
                                const SizedBox(height: 10),
                                _buildDarkField('Confirmer', _confirmPasswordController),
                                const SizedBox(height: 14),
                                Row(
                                  children: [
                                    ElevatedButton(
                                      onPressed: _passwordSaving ? null : _changePassword,
                                      style: ElevatedButton.styleFrom(
                                        backgroundColor: const Color(0xFF2563EB),
                                        foregroundColor: Colors.white,
                                      ),
                                      child: _passwordSaving
                                          ? const SizedBox(
                                              width: 14,
                                              height: 14,
                                              child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                                            )
                                          : const Text('Confirmer'),
                                    ),
                                    const SizedBox(width: 8),
                                    TextButton(
                                      onPressed: _passwordSaving
                                          ? null
                                          : () => setState(() {
                                                _showPasswordForm = false;
                                                _passwordError = null;
                                                _currentPasswordController.clear();
                                                _newPasswordController.clear();
                                                _confirmPasswordController.clear();
                                              }),
                                      child: const Text('Annuler', style: TextStyle(color: Colors.white70)),
                                    ),
                                  ],
                                ),
                              ],
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
    );
  }

  Widget _buildField(String label, TextEditingController controller, bool editable, {TextInputType? keyboardType}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.grey)),
        const SizedBox(height: 4),
        editable
            ? TextField(
                controller: controller,
                keyboardType: keyboardType,
                decoration: const InputDecoration(border: OutlineInputBorder(), isDense: true),
              )
            : Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                decoration: BoxDecoration(
                  color: const Color(0xFFF8FAFC),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: const Color(0xFFE2E8F0)),
                ),
                child: Text(
                  controller.text.isNotEmpty ? controller.text : '—',
                  style: const TextStyle(fontWeight: FontWeight.w500),
                ),
              ),
      ],
    );
  }

  Widget _buildDarkField(String label, TextEditingController controller) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.white54)),
        const SizedBox(height: 4),
        TextField(
          controller: controller,
          obscureText: true,
          style: const TextStyle(color: Colors.white),
          decoration: InputDecoration(
            isDense: true,
            filled: true,
            fillColor: Colors.white.withOpacity(0.08),
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: BorderSide.none),
          ),
        ),
      ],
    );
  }
}