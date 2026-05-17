import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:fl_chart/fl_chart.dart';

class DashboardPage extends StatelessWidget {
  const DashboardPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF020617),
      appBar: AppBar(
        backgroundColor: const Color(0xFF0F172A),
        title: Text('Dashboard', style: GoogleFonts.sora(fontWeight: FontWeight.bold)),
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications_outlined),
            onPressed: () {},
          ),
          Padding(
            padding: const EdgeInsets.only(right: 16.0),
            child: CircleAvatar(
              backgroundColor: const Color(0xFF10B981),
              child: Text('U', style: GoogleFonts.sora(color: Colors.white, fontWeight: FontWeight.bold)),
            ),
          )
        ],
      ),
      drawer: Drawer(
        backgroundColor: const Color(0xFF0F172A),
        child: ListView(
          padding: EdgeInsets.zero,
          children: [
            DrawerHeader(
              decoration: const BoxDecoration(
                color: Color(0xFF020617),
              ),
              child: Row(
                children: [
                  Container(
                    width: 32,
                    height: 32,
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        colors: [Color(0xFF10B981), Color(0xFFF59E0B)],
                      ),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: const Icon(Icons.receipt_long, color: Colors.white, size: 18),
                  ),
                  const SizedBox(width: 12),
                  Text('BillMaster', style: GoogleFonts.sora(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold)),
                ],
              ),
            ),
            ListTile(
              leading: const Icon(Icons.dashboard, color: Color(0xFF10B981)),
              title: const Text('Dashboard', style: TextStyle(color: Color(0xFF10B981))),
              onTap: () {
                Navigator.pop(context);
              },
            ),
            ListTile(
              leading: const Icon(Icons.logout, color: Color(0xFF94A3B8)),
              title: const Text('Logout', style: TextStyle(color: Color(0xFF94A3B8))),
              onTap: () {
                context.go('/login');
              },
            ),
          ],
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Dashboard', style: GoogleFonts.sora(fontSize: 28, fontWeight: FontWeight.bold, color: Colors.white)),
            const SizedBox(height: 4),
            Text('Welcome back! Here\'s your financial overview.', style: GoogleFonts.dmSans(color: const Color(0xFF94A3B8))),
            const SizedBox(height: 24),
            
            // Stats Grid
            LayoutBuilder(
              builder: (context, constraints) {
                return Wrap(
                  spacing: 16,
                  runSpacing: 16,
                  children: [
                    _buildStatCard('Monthly Salary', '\$5,000.00', 'Primary Income', Icons.account_balance_wallet, constraints.maxWidth),
                    _buildStatCard('Total Spent', '\$2,450.00', '+12% vs last month', Icons.trending_down, constraints.maxWidth),
                    _buildStatCard('Remaining Balance', '\$2,550.00', '51% of salary left', Icons.savings, constraints.maxWidth),
                    _buildStatCard('Savings Target', '\$1,000.00', 'Monthly Goal', Icons.track_changes, constraints.maxWidth),
                  ],
                );
              },
            ),
            const SizedBox(height: 24),
            
            // Charts Area
            Container(
              height: 300,
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: const Color(0xFF0F172A).withOpacity(0.4),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: Colors.white.withOpacity(0.05)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Financial Pulse', style: GoogleFonts.sora(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.white)),
                  Text('INCOME VS EXPENSES • 6 MONTHS', style: GoogleFonts.dmSans(fontSize: 10, fontWeight: FontWeight.bold, color: const Color(0xFF94A3B8))),
                  const SizedBox(height: 24),
                  Expanded(
                    child: LineChart(
                      LineChartData(
                        gridData: const FlGridData(show: false),
                        titlesData: const FlTitlesData(
                          rightTitles: AxisTitles(sideTitles: SideTitles(showTitles: false)),
                          topTitles: AxisTitles(sideTitles: SideTitles(showTitles: false)),
                          bottomTitles: AxisTitles(
                            sideTitles: SideTitles(showTitles: true, reservedSize: 22, interval: 1),
                          ),
                        ),
                        borderData: FlBorderData(show: false),
                        lineBarsData: [
                          LineChartBarData(
                            spots: const [
                              FlSpot(0, 3000),
                              FlSpot(1, 3200),
                              FlSpot(2, 4500),
                              FlSpot(3, 4000),
                              FlSpot(4, 5000),
                              FlSpot(5, 5000),
                            ],
                            isCurved: true,
                            color: const Color(0xFF10B981), // Income
                            barWidth: 3,
                            belowBarData: BarAreaData(show: true, color: const Color(0xFF10B981).withOpacity(0.2)),
                            dotData: const FlDotData(show: false),
                          ),
                          LineChartBarData(
                            spots: const [
                              FlSpot(0, 2000),
                              FlSpot(1, 2500),
                              FlSpot(2, 2100),
                              FlSpot(3, 3000),
                              FlSpot(4, 2400),
                              FlSpot(5, 2450),
                            ],
                            isCurved: true,
                            color: const Color(0xFF3B82F6), // Expenses
                            barWidth: 3,
                            belowBarData: BarAreaData(show: true, color: const Color(0xFF3B82F6).withOpacity(0.2)),
                            dotData: const FlDotData(show: false),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
            
            const SizedBox(height: 24),
            
            // Transactions Table
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: const Color(0xFF0F172A).withOpacity(0.4),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: Colors.white.withOpacity(0.05)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('Recent Transactions', style: GoogleFonts.sora(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white)),
                          Text('Your latest expense activity', style: GoogleFonts.dmSans(fontSize: 12, color: const Color(0xFF94A3B8))),
                        ],
                      ),
                      TextButton(onPressed: () {}, child: const Text('View All', style: TextStyle(color: Color(0xFF34D399)))),
                    ],
                  ),
                  const SizedBox(height: 16),
                  _buildTransaction('Grocery Shopping', 'Food', 'Oct 12', '\$120.50'),
                  _buildTransaction('Netflix Subscription', 'Entertainment', 'Oct 11', '\$15.99'),
                  _buildTransaction('Uber Ride', 'Transport', 'Oct 10', '\$24.00'),
                  _buildTransaction('Electric Bill', 'Bills', 'Oct 08', '\$85.00'),
                ],
              ),
            ),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {},
        backgroundColor: const Color(0xFF10B981),
        child: const Icon(Icons.add, color: Colors.white),
      ),
    );
  }

  Widget _buildStatCard(String title, String value, String subtitle, IconData icon, double maxWidth) {
    double width = maxWidth;
    if (maxWidth > 900) {
      width = (maxWidth - 48) / 4;
    } else if (maxWidth > 600) {
      width = (maxWidth - 16) / 2;
    }
    
    return Container(
      width: width,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: const Color(0xFF0F172A).withOpacity(0.4),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white.withOpacity(0.05)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(title, style: GoogleFonts.dmSans(color: const Color(0xFF94A3B8), fontSize: 14)),
              Icon(icon, color: const Color(0xFF94A3B8), size: 20),
            ],
          ),
          const SizedBox(height: 12),
          Text(value, style: GoogleFonts.sora(color: Colors.white, fontSize: 24, fontWeight: FontWeight.bold)),
          const SizedBox(height: 4),
          Text(subtitle, style: GoogleFonts.dmSans(color: const Color(0xFF34D399), fontSize: 12)),
        ],
      ),
    );
  }

  Widget _buildTransaction(String title, String category, String date, String amount) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 12),
      decoration: BoxDecoration(
        border: Border(bottom: BorderSide(color: Colors.white.withOpacity(0.05))),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Expanded(
            flex: 2,
            child: Text(title, style: GoogleFonts.dmSans(color: Colors.white, fontWeight: FontWeight.w500)),
          ),
          Expanded(
            flex: 1,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                color: const Color(0xFFF59E0B).withOpacity(0.15),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Text(category, textAlign: TextAlign.center, style: const TextStyle(color: Color(0xFFFBBF24), fontSize: 10)),
            ),
          ),
          Expanded(
            flex: 1,
            child: Text(date, textAlign: TextAlign.center, style: GoogleFonts.dmSans(color: const Color(0xFF94A3B8), fontSize: 12)),
          ),
          Expanded(
            flex: 1,
            child: Text(amount, textAlign: TextAlign.right, style: GoogleFonts.dmSans(color: Colors.white, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }
}
