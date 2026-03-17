import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons/lucide_icons.dart';

/// Bottom navigation shell wrapping the main tabs.
class AppShell extends StatelessWidget {
  final Widget child;
  const AppShell({super.key, required this.child});

  int _currentIndex(BuildContext context) {
    final location = GoRouterState.of(context).uri.toString();
    if (location.startsWith('/capture')) return 1;
    if (location.startsWith('/settings')) return 2;
    return 0; // /projects
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: child,
      bottomNavigationBar: NavigationBar(
        selectedIndex: _currentIndex(context),
        onDestinationSelected: (i) {
          switch (i) {
            case 0:
              context.go('/projects');
            case 1:
              context.go('/capture');
            case 2:
              context.go('/settings');
          }
        },
        destinations: const [
          NavigationDestination(
            icon: Icon(LucideIcons.folderKanban),
            selectedIcon: Icon(LucideIcons.folderKanban),
            label: 'Projekte',
          ),
          NavigationDestination(
            icon: Icon(LucideIcons.lightbulb),
            selectedIcon: Icon(LucideIcons.lightbulb),
            label: 'Erfassen',
          ),
          NavigationDestination(
            icon: Icon(LucideIcons.settings),
            selectedIcon: Icon(LucideIcons.settings),
            label: 'Einstellungen',
          ),
        ],
      ),
    );
  }
}
