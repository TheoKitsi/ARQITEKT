import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../providers/projects_provider.dart';
import '../../theme/tokens.dart';
import 'widgets/project_card.dart';

class ProjectsScreen extends ConsumerWidget {
  const ProjectsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final projectsAsync = ref.watch(projectsProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('ARQITEKT'),
        actions: [
          IconButton(
            icon: const Icon(LucideIcons.refreshCw),
            onPressed: () => ref.invalidate(projectsProvider),
          ),
        ],
      ),
      body: projectsAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, _) => _ErrorView(
          message: err.toString(),
          onRetry: () => ref.invalidate(projectsProvider),
        ),
        data: (projects) {
          if (projects.isEmpty) {
            return Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(LucideIcons.folderOpen, size: 64, color: Tokens.textTertiary),
                  const SizedBox(height: Tokens.space4),
                  Text(
                    'Keine Projekte',
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                          color: Tokens.textSecondary,
                        ),
                  ),
                  const SizedBox(height: Tokens.space2),
                  Text(
                    'Erstelle Projekte im Hub Dashboard',
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          color: Tokens.textTertiary,
                        ),
                  ),
                ],
              ),
            );
          }

          return RefreshIndicator(
            onRefresh: () async => ref.invalidate(projectsProvider),
            child: ListView.builder(
              padding: const EdgeInsets.all(Tokens.space4),
              itemCount: projects.length,
              itemBuilder: (context, i) {
                final project = projects[i];
                return Padding(
                  padding: const EdgeInsets.only(bottom: Tokens.space3),
                  child: ProjectCard(
                    project: project,
                    onTap: () => context.push('/projects/${project.id}'),
                  ),
                );
              },
            ),
          );
        },
      ),
    );
  }
}

class _ErrorView extends StatelessWidget {
  final String message;
  final VoidCallback onRetry;

  const _ErrorView({required this.message, required this.onRetry});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(Tokens.space6),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(LucideIcons.wifiOff, size: 48, color: Tokens.red),
            const SizedBox(height: Tokens.space4),
            Text(
              'Verbindung fehlgeschlagen',
              style: Theme.of(context).textTheme.titleMedium,
            ),
            const SizedBox(height: Tokens.space2),
            Text(
              message,
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: Tokens.textSecondary,
                  ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: Tokens.space4),
            FilledButton.icon(
              onPressed: onRetry,
              icon: const Icon(LucideIcons.refreshCw, size: 16),
              label: const Text('Erneut versuchen'),
            ),
          ],
        ),
      ),
    );
  }
}
