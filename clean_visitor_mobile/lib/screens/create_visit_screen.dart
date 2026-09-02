import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../services/visit_service.dart';

class CreateVisitScreen extends StatefulWidget {
  final Map<String, dynamic>? initialData;

  const CreateVisitScreen({super.key, this.initialData});

  @override
  State<CreateVisitScreen> createState() => _CreateVisitScreenState();
}

class _CreateVisitScreenState extends State<CreateVisitScreen> {
  final _motifController = TextEditingController();
  final _visitService = VisitService();

  bool _loading = false;
  bool get _isReprogramMode => widget.initialData != null;

  DateTime? _selectedDate;
  TimeOfDay? _selectedTime;
  int _selectedService = 1;
  int? _visitorId;
  String _visitorName = '';

  final Map<int, String> serviceNames = {
    1: "Direction",
    2: "Service RH",
    3: "Service Financier",
    4: "Service Informatique",
    5: "Secrétariat",
  };

  int _resolveServiceId(dynamic val) {
    if (val == null) return 1;
    final num = int.tryParse(val.toString());
    if (num != null && num > 0) return num;
    final normalized = val.toString().toLowerCase().replaceAll(RegExp(r'[\s_\-]'), '');
    for (final entry in serviceNames.entries) {
      if (entry.value.toLowerCase().replaceAll(RegExp(r'[\s_\-]'), '') == normalized) {
        return entry.key;
      }
    }
    return 1;
  }

  @override
  void initState() {
    super.initState();
    _loadVisitorInfo();

    if (_isReprogramMode && widget.initialData != null) {
      final data = widget.initialData!;
      _motifController.text = data['motif'] ?? data['Motif'] ?? '';
      _selectedService = _resolveServiceId(data['service'] ?? data['Service']);
      _selectedDate = null;
      _selectedTime = null;
    } else {
      _selectedDate = DateTime.now().add(const Duration(days: 2));
      _selectedTime = TimeOfDay.now();
    }
  }

  Future<void> _loadVisitorInfo() async {
    final prefs = await SharedPreferences.getInstance();
    setState(() {
      // Lecture unifiée : vérification de 'userId' puis 'visitorId'
      final idStr = prefs.getString('userId') ?? prefs.getString('visitorId') ?? '';
      final idInt = prefs.getInt('userId') ?? prefs.getInt('visitorId');
      
      _visitorId = idInt ?? int.tryParse(idStr);
      _visitorName = prefs.getString('userNom') ?? prefs.getString('userName') ?? 'Visiteur';
    });

    debugPrint('🔍 visitorId récupéré: $_visitorId');
    debugPrint('🔍 userName: $_visitorName');
  }

  Future<void> _pickDate() async {
    final minDate = DateTime.now().add(const Duration(days: 1));
    final picked = await showDatePicker(
      context: context,
      initialDate: _selectedDate != null && _selectedDate!.isAfter(minDate)
          ? _selectedDate!
          : minDate,
      firstDate: minDate,
      lastDate: DateTime.now().add(const Duration(days: 365)),
      builder: (context, child) => Theme(
        data: Theme.of(context).copyWith(
          colorScheme: const ColorScheme.light(primary: Color(0xFF2563EB)),
        ),
        child: child!,
      ),
    );
    if (picked != null) setState(() => _selectedDate = picked);
  }

  Future<void> _pickTime() async {
    final picked = await showTimePicker(
      context: context,
      initialTime: _selectedTime ?? TimeOfDay.now(),
      builder: (context, child) => Theme(
        data: Theme.of(context).copyWith(
          colorScheme: const ColorScheme.light(primary: Color(0xFF2563EB)),
        ),
        child: child!,
      ),
    );
    if (picked != null) setState(() => _selectedTime = picked);
  }

  Future<void> _handleSubmit() async {
    if (_motifController.text.trim().isEmpty) {
      _showError("Veuillez saisir un motif.");
      return;
    }
    if (_selectedDate == null) {
      _showError(_isReprogramMode
          ? "Veuillez choisir une nouvelle date."
          : "Veuillez choisir une date.");
      return;
    }
    if (_selectedTime == null) {
      _showError(_isReprogramMode
          ? "Veuillez choisir une nouvelle heure."
          : "Veuillez choisir une heure.");
      return;
    }

    // Deuxième vérification de sécurité sur le Stockage local
    if (_visitorId == null) {
      final prefs = await SharedPreferences.getInstance();
      final idStr = prefs.getString('userId') ?? prefs.getString('visitorId') ?? '';
      _visitorId = prefs.getInt('userId') ?? int.tryParse(idStr);
      debugPrint('🔁 Retry visitorId: $_visitorId');
    }

    if (_visitorId == null || _visitorId == 0) {
      _showError("Profil visiteur introuvable. Reconnectez-vous.");
      return;
    }

    setState(() => _loading = true);

    try {
      final dateStr =
          "${_selectedDate!.year.toString().padLeft(4, '0')}-"
          "${_selectedDate!.month.toString().padLeft(2, '0')}-"
          "${_selectedDate!.day.toString().padLeft(2, '0')}";

      final heureStr =
          "${_selectedTime!.hour.toString().padLeft(2, '0')}:"
          "${_selectedTime!.minute.toString().padLeft(2, '0')}:00";

      final payload = <String, dynamic>{
        'Motif': _motifController.text.trim(),
        'Service': _selectedService,
        'Date': dateStr,
        'HeureArriver': heureStr,
        'Statut': 1,
        'IdVisitor': _visitorId,
        'IsDeleted': false,
        'UpdatedByRole': 'Visiteur',
      };

      if (_isReprogramMode) {
        final visitId = widget.initialData!['id'] ?? widget.initialData!['Id'];
        payload['Id'] = visitId is int ? visitId : int.tryParse(visitId.toString()) ?? 0;
        await _visitService.updateVisit(payload);
        _showSuccess("Visite reprogrammée avec succès !");
      } else {
        await _visitService.create(payload);
        _showSuccess("Visite créée avec succès !");
      }

      if (mounted) Navigator.pop(context, true);
    } catch (e) {
      _showError("Erreur : ${e.toString().replaceAll('Exception: ', '')}");
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  void _showError(String msg) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(
      content: Text(msg),
      backgroundColor: const Color(0xFFDC2626),
      behavior: SnackBarBehavior.floating,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
    ));
  }

  void _showSuccess(String msg) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(
      content: Text(msg),
      backgroundColor: const Color(0xFF059669),
      behavior: SnackBarBehavior.floating,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
    ));
  }

  @override
  void dispose() {
    _motifController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_rounded, color: Color(0xFF0F172A)),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          _isReprogramMode ? "Reprogrammation" : "Nouvelle Visite",
          style: const TextStyle(
            color: Color(0xFF0F172A),
            fontWeight: FontWeight.w900,
            fontSize: 18,
          ),
        ),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              if (_isReprogramMode) ...[
                Container(
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: const Color(0xFFFFFBEB),
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: const Color(0xFFFCD34D)),
                  ),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Icon(Icons.info_outline_rounded,
                          color: Color(0xFFD97706), size: 18),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Reprogrammation : ${_motifController.text}',
                              style: const TextStyle(
                                color: Color(0xFF92400E),
                                fontWeight: FontWeight.w700,
                                fontSize: 13,
                              ),
                            ),
                            const SizedBox(height: 4),
                            const Text(
                              'Choisissez une nouvelle date et heure. La visite repassera en "En attente".',
                              style: TextStyle(
                                color: Color(0xFFB45309),
                                fontSize: 12,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 20),
              ],
              Container(
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(24),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.05),
                      blurRadius: 20,
                      offset: const Offset(0, 6),
                    ),
                  ],
                ),
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildLabel("Visiteur"),
                    const SizedBox(height: 8),
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.symmetric(
                          horizontal: 16, vertical: 14),
                      decoration: BoxDecoration(
                        color: const Color(0xFFEFF6FF),
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(color: const Color(0xFFBFDBFE)),
                      ),
                      child: Row(
                        children: [
                          const Icon(Icons.person_rounded,
                              color: Color(0xFF2563EB), size: 18),
                          const SizedBox(width: 10),
                          Text(
                            _visitorName,
                            style: const TextStyle(
                              fontWeight: FontWeight.w700,
                              color: Color(0xFF1D4ED8),
                              fontSize: 14,
                            ),
                          ),
                          const Spacer(),
                          const Text(
                            'Moi',
                            style: TextStyle(
                              fontSize: 10,
                              color: Color(0xFF2563EB),
                              fontWeight: FontWeight.w800,
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 20),
                    _buildLabel("Service à visiter"),
                    const SizedBox(height: 8),
                    _isReprogramMode
                        ? Container(
                            width: double.infinity,
                            padding: const EdgeInsets.symmetric(
                                horizontal: 16, vertical: 14),
                            decoration: BoxDecoration(
                              color: const Color(0xFFF1F5F9),
                              borderRadius: BorderRadius.circular(14),
                              border: Border.all(color: const Color(0xFFE2E8F0)),
                            ),
                            child: Text(
                              serviceNames[_selectedService] ?? 'Direction',
                              style: const TextStyle(
                                fontWeight: FontWeight.w600,
                                color: Color(0xFF94A3B8),
                                fontSize: 14,
                              ),
                            ),
                          )
                        : Container(
                            decoration: BoxDecoration(
                              color: const Color(0xFFF8FAFC),
                              borderRadius: BorderRadius.circular(14),
                            ),
                            child: DropdownButtonFormField<int>(
                              value: _selectedService,
                              decoration: const InputDecoration(
                                border: InputBorder.none,
                                contentPadding: EdgeInsets.symmetric(
                                    horizontal: 16, vertical: 14),
                              ),
                              items: serviceNames.entries
                                  .map((e) => DropdownMenuItem(
                                        value: e.key,
                                        child: Text(e.value,
                                            style: const TextStyle(
                                                fontWeight: FontWeight.w600)),
                                      ))
                                  .toList(),
                              onChanged: (val) =>
                                  setState(() => _selectedService = val!),
                            ),
                          ),
                    const SizedBox(height: 20),
                    _buildLabel(_isReprogramMode ? "Nouvelle Date *" : "Date *"),
                    const SizedBox(height: 8),
                    GestureDetector(
                      onTap: _pickDate,
                      child: Container(
                        width: double.infinity,
                        padding: const EdgeInsets.symmetric(
                            horizontal: 16, vertical: 16),
                        decoration: BoxDecoration(
                          color: _selectedDate == null
                              ? const Color(0xFFFEF3C7)
                              : const Color(0xFFF8FAFC),
                          borderRadius: BorderRadius.circular(14),
                          border: Border.all(
                            color: _selectedDate == null
                                ? const Color(0xFFFCD34D)
                                : Colors.transparent,
                          ),
                        ),
                        child: Row(
                          children: [
                            Icon(
                              Icons.calendar_today_rounded,
                              color: _selectedDate == null
                                  ? const Color(0xFFD97706)
                                  : const Color(0xFF2563EB),
                              size: 18,
                            ),
                            const SizedBox(width: 12),
                            Text(
                              _selectedDate == null
                                  ? (_isReprogramMode
                                      ? "Choisir une nouvelle date"
                                      : "Choisir une date")
                                  : "${_selectedDate!.day.toString().padLeft(2, '0')}/"
                                      "${_selectedDate!.month.toString().padLeft(2, '0')}/"
                                      "${_selectedDate!.year}",
                              style: TextStyle(
                                color: _selectedDate == null
                                    ? const Color(0xFFD97706)
                                    : const Color(0xFF0F172A),
                                fontWeight: FontWeight.w600,
                                fontSize: 14,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(height: 20),
                    _buildLabel(_isReprogramMode
                        ? "Nouvelle Heure *"
                        : "Heure d'arrivée *"),
                    const SizedBox(height: 8),
                    GestureDetector(
                      onTap: _pickTime,
                      child: Container(
                        width: double.infinity,
                        padding: const EdgeInsets.symmetric(
                            horizontal: 16, vertical: 16),
                        decoration: BoxDecoration(
                          color: _selectedTime == null
                              ? const Color(0xFFFEF3C7)
                              : const Color(0xFFF8FAFC),
                          borderRadius: BorderRadius.circular(14),
                          border: Border.all(
                            color: _selectedTime == null
                                ? const Color(0xFFFCD34D)
                                : Colors.transparent,
                          ),
                        ),
                        child: Row(
                          children: [
                            Icon(
                              Icons.access_time_rounded,
                              color: _selectedTime == null
                                  ? const Color(0xFFD97706)
                                  : const Color(0xFF2563EB),
                              size: 18,
                            ),
                            const SizedBox(width: 12),
                            Text(
                              _selectedTime == null
                                  ? (_isReprogramMode
                                      ? "Choisir une nouvelle heure"
                                      : "Choisir une heure")
                                  : "${_selectedTime!.hour.toString().padLeft(2, '0')}:"
                                      "${_selectedTime!.minute.toString().padLeft(2, '0')}",
                              style: TextStyle(
                                color: _selectedTime == null
                                    ? const Color(0xFFD97706)
                                    : const Color(0xFF0F172A),
                                fontWeight: FontWeight.w600,
                                fontSize: 14,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(height: 20),
                    _buildLabel("Motif de la visite"),
                    const SizedBox(height: 8),
                    _isReprogramMode
                        ? Container(
                            width: double.infinity,
                            padding: const EdgeInsets.all(16),
                            decoration: BoxDecoration(
                              color: const Color(0xFFF1F5F9),
                              borderRadius: BorderRadius.circular(14),
                              border: Border.all(color: const Color(0xFFE2E8F0)),
                            ),
                            child: Text(
                              _motifController.text,
                              style: const TextStyle(
                                fontWeight: FontWeight.w600,
                                color: Color(0xFF94A3B8),
                                fontSize: 14,
                              ),
                            ),
                          )
                        : TextField(
                            controller: _motifController,
                            maxLines: 3,
                            style: const TextStyle(
                              fontWeight: FontWeight.w600,
                              color: Color(0xFF0F172A),
                            ),
                            decoration: InputDecoration(
                              hintText: "Ex: Entretien d'embauche...",
                              hintStyle:
                                  const TextStyle(color: Color(0xFFCBD5E1)),
                              filled: true,
                              fillColor: const Color(0xFFF8FAFC),
                              border: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(14),
                                borderSide: BorderSide.none,
                              ),
                              contentPadding: const EdgeInsets.all(16),
                            ),
                          ),
                    const SizedBox(height: 24),
                    SizedBox(
                      width: double.infinity,
                      height: 54,
                      child: ElevatedButton(
                        onPressed: _loading ? null : _handleSubmit,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF2563EB),
                          foregroundColor: Colors.white,
                          disabledBackgroundColor: const Color(0xFF93C5FD),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(16),
                          ),
                          elevation: 0,
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
                            : Text(
                                _isReprogramMode
                                    ? "CONFIRMER LA REPROGRAMMATION"
                                    : "VALIDER",
                                style: const TextStyle(
                                  fontWeight: FontWeight.w900,
                                  fontSize: 14,
                                  letterSpacing: 0.5,
                                ),
                              ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildLabel(String text) {
    return Text(
      text.toUpperCase(),
      style: const TextStyle(
        fontSize: 10,
        fontWeight: FontWeight.w800,
        color: Color(0xFF94A3B8),
        letterSpacing: 1.5,
      ),
    );
  }
}