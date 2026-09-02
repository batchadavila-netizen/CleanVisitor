import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';

// Screens
import 'screens/landing_screen.dart';
import 'screens/login_screen.dart';
import 'screens/register_screen.dart';
import 'screens/visiteur_dashboard_screen.dart';
import 'screens/profile_screen.dart';
import 'screens/create_visit_screen.dart';

void main() async {
  // 1. Initialisation des liaisons Flutter
  WidgetsFlutterBinding.ensureInitialized();

  // 2. Chargement des variables d'environnement (.env)
  await dotenv.load(fileName: ".env");

  // 3. Vérification du token de session
  final prefs = await SharedPreferences.getInstance();
  final token = prefs.getString('token');
  
  runApp(MyApp(isLoggedIn: token != null && token.isNotEmpty));
}

class MyApp extends StatelessWidget {
  final bool isLoggedIn;
  const MyApp({super.key, required this.isLoggedIn});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'CleanVisitor',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFF2563EB)),
        useMaterial3: true,
      ),
      initialRoute: isLoggedIn ? '/home' : '/',
      routes: {
        '/': (context) => const LandingScreen(),
        '/login': (context) => const LoginScreen(),
        '/register': (context) => const RegisterScreen(),
        '/home': (context) => const VisiteurDashboardScreen(),
        '/profile': (context) => const ProfileScreen(),
        '/create-visit': (context) => const CreateVisitScreen(),
      },
    );
  }
}