import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../providers/projects_provider.dart';
import '../../theme/tokens.dart';

class ProjectDetailScreen extends ConsumerWidget {
  final String projectId;
  const ProjectDetailScreen({super.key, required this.projectId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final projectAsync = ref.watch(projectProvider(projectId));

    return projectAsync.when(
      loading: () => const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      ),
      error: (err, _) => Scaffold(
        appBar: AppBar(),
        body: Center(child: Text('Fehler: $err')),
      ),
      data: (project) {
        final config = project.config;

        return Scaffold(
          appBar: AppBar(
            title: Text(config.name),
            leading: IconButton(
              icon: const Icon(LucideIcons.arrowLeft),
              onPressed: () => context.pop(),
            ),
          ),
          body: ListView(
            padding: const EdgeInsets.all(Tokens.space4),
            children: [
              // Project header
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(Tokens.space4),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        config.codename,
                        style: TextStyle(
                          fontSize: Tokens.fontSm,
                          color: Tokens.gold,
                          fontWeight: FontWeight.w600,
                          letterSpacing: 1.2,
                        ),
                      ),
                      const SizedBox(height: Tokens.space1),
                      Text(
                        config.name,
                        style: Theme.of(context).textTheme.headlineSmall,
                      ),
                      if (config.description != null) ...[
                        const SizedBox(height: Tokens.space2),
                        Text(
                          config.description!,
                          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                color: Tokens.textSecondary,
                              ),
                        ),
                      ],
                      if (config.github != null) ...[
                        const SizedBox(height: Tokens.space3),
                        Row(
                          children: [
                            const Icon(LucideIcons.github, size: 16, color: Tokens.textSecondary),
                            const SizedBox(width: Tokens.space2),
                            Text(
                              config.github!,
                              style: TextStyle(fontSize: Tokens.fontSm, color: Tokens.accent),
                            ),
                          ],
                        ),
                      ],
                    ],
                  ),
                ),
              ),

              const SizedBox(height: Tokens.space4),

              // Stats grid
              _StatsGrid(stats: project.stats),

              const SizedBox(height: Tokens.space4),

              // Action tiles
              _ActionTile(
                icon: LucideIcons.gitBranch,
                title: 'Requirements',
                subtitle: '${project.stats.total} Artefakte',
                onTap: () => context.push('/projects/$projectId/requirements'),
              ),
              const SizedBox(height: Tokens.space2),
              _ActionTile(
                icon: LucideIcons.messageSquare,
                title: 'KI Chat',
                subtitle: 'Projektbezogener KI-Assistent',
                onTap: () => context.push('/projects/$projectId/chat'),
              ),
            ],
          ),
        );
      },
    );
  }
}

class _StatsGrid extends StatelessWidget {
  final dynamic stats;
  const _StatsGrid({required this.stats});

  @override
  Widget build(BuildContext context) {
    final items = [
      ('BC', stats.bc, Tokens.gold),
      ('SOL', stats.sol, Tokens.accent),
      ('US', stats.us, Tokens.green),
      ('CMP', stats.cmp, Tokens.purple),
      ('FN', stats.fn, Tokens.orange),
      ('INF', stats.inf, Tokens.yellow),
      ('ADR', stats.adr, Tokens.red),
      ('NTF', stats.ntf, Tokens.textSecondary),
    ];

    return Wrap(
      spacing: Tokens.space2,
      runSpacing: Tokens.space2,
      children: items
          .map((item) => _StatTile(label: item.$1, count: item.$2, color: item.$3))
          .toList(),
    );
  }
}

class _StatTile extends StatelessWidget {
  final String label;
  final int count;
  final Color color;

  const _StatTile({required this.label, required this.count, required this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 80,
      padding: const EdgeInsets.all(Tokens.space3),
      decoration: BoxDecoration(
        color: Tokens.surfaceBg2,
        borderRadius: BorderRadius.circular(Tokens.radiusMd),
        border: Border.all(color: Tokens.borderDefault),
      ),
      child: Column(
        children: [
          Text(
            '$count',
            style: TextStyle(
              fontSize: Tokens.fontXl,
              fontWeight: FontWeight.w700,
              color: color,
            ),
          ),
          Text(
            label,
            style: const TextStyle(
              fontSize: Tokens.fontXs,
              color: Tokens.textSecondary,
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }
}

class _ActionTile extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;
  final VoidCallback onTap;

  const _ActionTile({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      clipBehavior: Clip.antiAlias,
      child: ListTile(
        leading: Icon(icon, color: Tokens.gold),
        title: Text(title),
        subtitle: Text(subtitle, style: const TextStyle(color: Tokens.textSecondary)),
        trailing: const Icon(LucideIcons.chevronRight, color: Tokens.textTertiary),
        onTap: onTap,
      ),
    );
  }
}
