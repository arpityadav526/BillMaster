import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';

import 'presentation/pages/landing_page.dart';
import 'presentation/pages/login_page.dart';
import 'presentation/pages/dashboard_page.dart';

void main() {
  runApp(const BillMasterApp());
}

final _router = GoRouter(
  initialLocation: '/',
  routes: [
    GoRoute(
      path: '/',
      builder: (context, state) => const LandingPage(),
    ),
    GoRoute(
      path: '/login',
      builder: (context, state) => const LoginPage(),
    ),
    GoRoute(
      path: '/register',
      builder: (context, state) => const Scaffold(body: Center(child: Text('Register Page (To Be Implemented)'))),
    ),
    GoRoute(
      path: '/dashboard',
      builder: (context, state) => const DashboardPage(),
    ),
  ],
);

class BillMasterApp extends StatelessWidget {
  const BillMasterApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: 'BillMaster',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        brightness: Brightness.dark,
        scaffoldBackgroundColor: const Color(0xFF020617), // surface-950
        colorScheme: const ColorScheme.dark(
          primary: Color(0xFF10B981), // emerald-500
          surface: Color(0xFF0F172A), // surface-900
          onSurface: Color(0xFFF1F5F9), // surface-100
        ),
        textTheme: GoogleFonts.dmSansTextTheme(
          ThemeData.dark().textTheme,
        ).copyWith(
          displayLarge: GoogleFonts.sora(color: Colors.white, fontWeight: FontWeight.bold),
          displayMedium: GoogleFonts.sora(color: Colors.white, fontWeight: FontWeight.bold),
          displaySmall: GoogleFonts.sora(color: Colors.white, fontWeight: FontWeight.bold),
          headlineLarge: GoogleFonts.sora(color: Colors.white, fontWeight: FontWeight.bold),
          headlineMedium: GoogleFonts.sora(color: Colors.white, fontWeight: FontWeight.bold),
          headlineSmall: GoogleFonts.sora(color: Colors.white, fontWeight: FontWeight.bold),
          titleLarge: GoogleFonts.sora(color: Colors.white, fontWeight: FontWeight.w600),
          titleMedium: GoogleFonts.sora(color: Colors.white, fontWeight: FontWeight.w600),
          titleSmall: GoogleFonts.sora(color: Colors.white, fontWeight: FontWeight.w600),
        ),
        elevatedButtonTheme: ElevatedButtonThemeData(
          style: ElevatedButton.styleFrom(
            backgroundColor: const Color(0xFF10B981),
            foregroundColor: Colors.white,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
          ),
        ),
        useMaterial3: true,
      ),
      routerConfig: _router,
    );
  }
}
