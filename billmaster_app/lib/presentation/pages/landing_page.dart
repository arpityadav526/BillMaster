import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';

class LandingPage extends StatelessWidget {
  const LandingPage({super.key});

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;
    
    return Scaffold(
      backgroundColor: const Color(0xFF020617), // surface-950
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            backgroundColor: const Color(0xFF020617).withOpacity(0.8),
            pinned: true,
            title: Row(
              children: [
                Container(
                  width: 32,
                  height: 32,
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [Color(0xFF10B981), Color(0xFFF59E0B)],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: const Icon(Icons.receipt_long, color: Colors.white, size: 18),
                ),
                const SizedBox(width: 8),
                Text('BillMaster', style: GoogleFonts.sora(fontWeight: FontWeight.bold, fontSize: 18)),
              ],
            ),
            actions: [
              TextButton(
                onPressed: () => context.go('/login'),
                child: Text('Login', style: GoogleFonts.dmSans(color: const Color(0xFF94A3B8))), // surface-400
              ),
              Padding(
                padding: const EdgeInsets.only(right: 16.0, left: 8.0),
                child: ElevatedButton(
                  onPressed: () => context.go('/register'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF10B981),
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                  ),
                  child: const Text('Get Started'),
                ),
              ),
            ],
          ),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(24.0),
              child: Column(
                children: [
                  const SizedBox(height: 60),
                  Text(
                    'Smart Finance Management',
                    style: GoogleFonts.sora(fontSize: 40, fontWeight: FontWeight.bold, height: 1.2),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'Track expenses, manage receipts, and get AI-powered insights with BillMaster.',
                    style: GoogleFonts.dmSans(fontSize: 16, color: const Color(0xFF94A3B8)),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 32),
                  ElevatedButton(
                    onPressed: () => context.go('/register'),
                    style: ElevatedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
                    ),
                    child: const Text('Start for free', style: TextStyle(fontSize: 16)),
                  ),
                  const SizedBox(height: 100),
                  // Placeholder for Analytics Preview
                  Container(
                    height: 200,
                    decoration: BoxDecoration(
                      color: const Color(0xFF0F172A),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: Colors.white.withOpacity(0.1)),
                    ),
                    child: Center(
                      child: Text('Analytics Preview Placeholder', style: TextStyle(color: Colors.white.withOpacity(0.5))),
                    ),
                  ),
                  const SizedBox(height: 100),
                ],
              ),
            ),
          )
        ],
      ),
    );
  }
}
