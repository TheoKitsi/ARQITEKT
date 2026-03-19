import 'package:flutter/material.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';
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
    final l = AppLocalizations.of(context)!;
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
        destinations: [
          NavigationDestination(
            icon: const Icon(LucideIcons.folderKanban),
            selectedIcon: const Icon(LucideIcons.folderKanban),
            label: l.navProjects,
          ),
          NavigationDestination(
            icon: const Icon(LucideIcons.lightbulb),
            selectedIcon: const Icon(LucideIcons.lightbulb),
            label: l.navCapture,
          ),
          NavigationDestination(
            icon: const Icon(LucideIcons.settings),
            selectedIcon: const Icon(LucideIcons.settings),
            label: l.navSettings,
          ),
        ],
      ),
    );
  }
}
