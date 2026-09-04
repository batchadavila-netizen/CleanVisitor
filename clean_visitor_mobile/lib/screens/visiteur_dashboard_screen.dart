import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/visit_model.dart';
import '../services/visit_service.dart';
import '../services/notification_service.dart';
import '../widgets/app_drawer.dart';

class VisiteurDashboardScreen extends StatefulWidget {
  const VisiteurDashboardScreen({Key? key}) : super(key: key);

  @override
  State<VisiteurDashboardScreen> createState() => _VisiteurDashboardScreenState();
}

class _VisiteurDashboardScreenState extends State<VisiteurDashboardScreen> {
  String visitorId = '';
  String userNom = 'Visiteur';
  String userEmail = '';

  List<VisitModel> visits = [];
  int notificationCount = 0;
  bool isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadUserDataAndVisits();
  }

  Future<void> _loadUserDataAndVisits() async {
    final prefs = await SharedPreferences.getInstance();
    setState(() {
      visitorId = prefs.getString('userId') ?? '';
      userNom = prefs.getString('userNom') ?? prefs.getString('userName') ?? 'Visiteur';
      userEmail = prefs.getString('userEmail') ?? '';
    });

    await fetchVisits();
    await _loadNotificationsCount();
  }

  Future<void> fetchVisits() async {
    setState(() => isLoading = true);
    try {
      if (visitorId.isNotEmpty) {
        final fetchedVisits = await VisitService.getVisitorVisits(visitorId);
        setState(() => visits = fetchedVisits);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Erreur lors du chargement des visites: $e')),
        );
      }
    } finally {
      setState(() => isLoading = false);
    }
  }

  Future<void> _loadNotificationsCount() async {
    try {
      if (visitorId.isNotEmpty) {
        final notifService = NotificationService();
        final notifs = await notifService.getByVisitor(visitorId);
        setState(() {
          notificationCount = notifs.length;
        });
      }
    } catch (_) {}
  }

  int get pendingCount {
    return visits.where((v) => v.statusLabel.contains('attente')).length;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      drawer: const AppDrawer(),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: Builder(
          builder: (context) => IconButton(
            icon: const Icon(Icons.menu, color: Color(0xFF1E293B)),
            onPressed: () => Scaffold.of(context).openDrawer(),
          ),
        ),
        title: const Text(
          "Mon Espace",
          style: TextStyle(color: Color(0xFF1E293B), fontWeight: FontWeight.w900, fontSize: 24),
        ),
        actions: [
          Stack(
            alignment: Alignment.center,
            children: [
              IconButton(
                icon: const Icon(Icons.notifications_outlined, color: Color(0xFF64748B)),
                onPressed: () {
                  // Action ou navigation vers les notifications si nécessaire
                },
              ),
              if (notificationCount > 0)
                Positioned(
                  right: 10,
                  top: 10,
                  child: Container(
                    padding: const EdgeInsets.all(4),
                    decoration: const BoxDecoration(
                      color: Colors.red,
                      shape: BoxShape.circle,
                    ),
                    child: Text(
                      '$notificationCount',
                      style: const TextStyle(color: Colors.white, fontSize: 8, fontWeight: FontWeight.bold),
                    ),
                  ),
                ),
            ],
          ),
          IconButton(
            icon: const Icon(Icons.refresh, color: Color(0xFF64748B)),
            onPressed: () {
              fetchVisits();
              _loadNotificationsCount();
            },
          )
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          await fetchVisits();
          await _loadNotificationsCount();
        },
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.all(20.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text.rich(
                TextSpan(
                  text: 'Heureux de vous revoir, ',
                  style: const TextStyle(color: Color(0xFF64748B), fontSize: 16),
                  children: [
                    TextSpan(
                      text: userNom,
                      style: const TextStyle(color: Color(0xFF2563EB), fontWeight: FontWeight.bold),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),

              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed: () async {
                    final result = await Navigator.pushNamed(context, '/create-visit');
                    if (result == true && context.mounted) {
                      fetchVisits();
                    }
                  },
                  icon: const Icon(Icons.add, color: Colors.white),
                  label: const Text(
                    "Nouvelle Visite", 
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                  ),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF2563EB),
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                    elevation: 2,
                  ),
                ),
              ),
              const SizedBox(height: 24),

              Row(
                children: [
                  Expanded(
                    child: _buildStatCard(
                      icon: Icons.history,
                      title: "TOTAL VISITES",
                      value: visits.length.toString(),
                      color: const Color(0xFF2563EB),
                      bgColor: const Color(0xFFEFF6FF),
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: _buildStatCard(
                      icon: Icons.access_time,
                      title: "EN ATTENTE",
                      value: pendingCount.toString(),
                      color: const Color(0xFFD97706),
                      bgColor: const Color(0xFFFFFBEB),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 28),

              Container(
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(24),
                  border: Border.all(color: const Color(0xFFF1F5F9)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Padding(
                      padding: const EdgeInsets.all(20.0),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text("Mes Demandes", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                          if (visits.length > 10)
                            Text("10 / ${visits.length}", style: const TextStyle(fontSize: 12, color: Colors.grey)),
                        ],
                      ),
                    ),
                    const Divider(height: 1, color: Color(0xFFF1F5F9)),
                    
                    isLoading
                        ? const Padding(
                            padding: EdgeInsets.all(30.0),
                            child: Center(child: CircularProgressIndicator()),
                          )
                        : visits.isEmpty
                            ? const Padding(
                                padding: EdgeInsets.all(30.0),
                                child: Center(child: Text("Aucune visite enregistrée.", style: TextStyle(color: Colors.grey))),
                              )
                            : ListView.separated(
                                shrinkWrap: true,
                                physics: const NeverScrollableScrollPhysics(),
                                itemCount: visits.take(10).length,
                                separatorBuilder: (_, __) => const Divider(height: 1, color: Color(0xFFF1F5F9)),
                                itemBuilder: (context, index) {
                                  final v = visits[index];
                                  return ListTile(
                                    contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                                    leading: Container(
                                      width: 44,
                                      height: 44,
                                      decoration: BoxDecoration(
                                        color: const Color(0xFFF8FAFC),
                                        borderRadius: BorderRadius.circular(12),
                                      ),
                                      child: const Icon(Icons.calendar_today, color: Color(0xFF94A3B8), size: 20),
                                    ),
                                    title: Text(v.motif, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                                    subtitle: Text(
                                      "${v.date.split('T')[0]} à ${v.heureArriver}",
                                      style: const TextStyle(fontSize: 12, color: Colors.grey),
                                    ),
                                    trailing: Row(
                                      mainAxisSize: MainAxisSize.min,
                                      mainAxisAlignment: MainAxisAlignment.end,
                                      children: [
                                        Container(
                                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                          decoration: BoxDecoration(
                                            color: v.statusBgColor,
                                            borderRadius: BorderRadius.circular(8),
                                          ),
                                          child: Text(
                                            v.statusLabel,
                                            style: TextStyle(
                                              color: v.statusTextColor,
                                              fontSize: 10,
                                              fontWeight: FontWeight.bold,
                                            ),
                                          ),
                                        ),
                                        const SizedBox(width: 4),
                                        const Icon(Icons.chevron_right, color: Colors.grey),
                                      ],
                                    ),
                                    onTap: () {},
                                  );
                                },
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

  Widget _buildStatCard({
    required IconData icon,
    required String title,
    required String value,
    required Color color,
    required Color bgColor,
  }) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: const Color(0xFFF1F5F9)),
      ),
      child: Row(
        children: [
          Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(color: bgColor, borderRadius: BorderRadius.circular(16)),
            child: Icon(icon, color: color, size: 28),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  title,
                  style: const TextStyle(fontSize: 9, fontWeight: FontWeight.w900, color: Color(0xFF94A3B8)),
                  overflow: TextOverflow.ellipsis,
                ),
                Text(
                  value,
                  style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w900, color: Color(0xFF1E293B)),
                ),
              ],
            ),
          )
        ],
      ),
    );
  }
}