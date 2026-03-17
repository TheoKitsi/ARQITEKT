import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../../models/project.dart';
import '../../../theme/tokens.dart';

class ProjectCard extends StatelessWidget {
  final Project project;
  final VoidCallback onTap;

  const ProjectCard({super.key, required this.project, required this.onTap});

  Color _lifecycleColor(String lifecycle) {
    return switch (lifecycle) {
      'planning' => Tokens.accent,
      'ready' => Tokens.yellow,
      'building' => Tokens.orange,
      'built' => Tokens.green,
      'running' => Tokens.green,
      'deployed' => Tokens.purple,
      _ => Tokens.textSecondary,
    };
  }

  IconData _lifecycleIcon(String lifecycle) {
    return switch (lifecycle) {
      'planning' => LucideIcons.pencil,
      'ready' => LucideIcons.checkCircle,
      'building' => LucideIcons.hammer,
      'built' => LucideIcons.box,
      'running' => LucideIcons.play,
      'deployed' => LucideIcons.rocket,
      _ => LucideIcons.circle,
    };
  }

  @override
  Widget build(BuildContext context) {
    final config = project.config;
    final lifecycle = config.lifecycle;

    return Card(
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.all(Tokens.space4),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header: name + lifecycle badge
              Row(
                children: [
                  Expanded(
                    child: Text(
                      config.name,
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(
                            fontWeight: FontWeight.w600,
                          ),
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: Tokens.space2,
                      vertical: Tokens.space1,
                    ),
                    decoration: BoxDecoration(
                      color: _lifecycleColor(lifecycle).withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(Tokens.radiusSm),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(
                          _lifecycleIcon(lifecycle),
                          size: 14,
                          color: _lifecycleColor(lifecycle),
                        ),
                        const SizedBox(width: 4),
                        Text(
                          lifecycle.toUpperCase(),
                          style: TextStyle(
                            fontSize: Tokens.fontXs,
                            fontWeight: FontWeight.w600,
                            color: _lifecycleColor(lifecycle),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),

              if (config.description != null && config.description!.isNotEmpty) ...[
                const SizedBox(height: Tokens.space2),
                Text(
                  config.description!,
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: Tokens.textSecondary,
                      ),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
              ],

              const SizedBox(height: Tokens.space3),

              // Stats row
              Row(
                children: [
                  _StatChip('SOL', project.stats.sol),
                  const SizedBox(width: Tokens.space2),
                  _StatChip('US', project.stats.us),
                  const SizedBox(width: Tokens.space2),
                  _StatChip('CMP', project.stats.cmp),
                  const SizedBox(width: Tokens.space2),
                  _StatChip('FN', project.stats.fn),
                  const Spacer(),
                  Text(
                    '${project.stats.total} Artefakte',
                    style: TextStyle(
                      fontSize: Tokens.fontXs,
                      color: Tokens.textTertiary,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _StatChip extends StatelessWidget {
  final String label;
  final int count;

  const _StatChip(this.label, this.count);

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
      decoration: BoxDecoration(
        color: Tokens.surfaceBg3,
        borderRadius: BorderRadius.circular(Tokens.radiusSm),
      ),
      child: Text(
        '$label $count',
        style: const TextStyle(
          fontSize: Tokens.fontXs,
          color: Tokens.textSecondary,
          fontWeight: FontWeight.w500,
        ),
      ),
    );
  }
}
