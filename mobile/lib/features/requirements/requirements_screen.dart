import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../models/requirement.dart';
import '../../providers/requirements_provider.dart';
import '../../theme/tokens.dart';

class RequirementsScreen extends ConsumerWidget {
  final String projectId;
  const RequirementsScreen({super.key, required this.projectId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final treeAsync = ref.watch(requirementsTreeProvider(projectId));

    return Scaffold(
      appBar: AppBar(
        title: const Text('Requirements'),
        leading: IconButton(
          icon: const Icon(LucideIcons.arrowLeft),
          onPressed: () => context.pop(),
        ),
      ),
      body: treeAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, _) => Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(LucideIcons.alertTriangle, size: 48, color: Tokens.yellow),
              const SizedBox(height: Tokens.space4),
              Text('Fehler: $err', textAlign: TextAlign.center),
              const SizedBox(height: Tokens.space4),
              FilledButton(
                onPressed: () => ref.invalidate(requirementsTreeProvider(projectId)),
                child: const Text('Erneut versuchen'),
              ),
            ],
          ),
        ),
        data: (tree) {
          if (tree.isEmpty) {
            return const Center(
              child: Text(
                'Keine Requirements vorhanden',
                style: TextStyle(color: Tokens.textSecondary),
              ),
            );
          }

          return ListView.builder(
            padding: const EdgeInsets.all(Tokens.space4),
            itemCount: tree.length,
            itemBuilder: (context, i) => _TreeNodeTile(
              node: tree[i],
              projectId: projectId,
              depth: 0,
            ),
          );
        },
      ),
    );
  }
}

class _TreeNodeTile extends StatelessWidget {
  final TreeNode node;
  final String projectId;
  final int depth;

  const _TreeNodeTile({
    required this.node,
    required this.projectId,
    required this.depth,
  });

  Color _typeColor(String type) {
    return switch (type) {
      'BC' => Tokens.gold,
      'SOL' => Tokens.accent,
      'US' => Tokens.green,
      'CMP' => Tokens.purple,
      'FN' => Tokens.orange,
      'INF' => Tokens.yellow,
      'ADR' => Tokens.red,
      'NTF' => Tokens.textSecondary,
      'CONV' => Tokens.accent,
      'FBK' => Tokens.purple,
      _ => Tokens.textSecondary,
    };
  }

  Color _statusColor(String status) {
    return switch (status) {
      'idea' => Tokens.textTertiary,
      'draft' => Tokens.yellow,
      'review' => Tokens.orange,
      'approved' => Tokens.green,
      'implemented' => Tokens.accent,
      _ => Tokens.textTertiary,
    };
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: EdgeInsets.only(left: depth * Tokens.space4),
          child: Card(
            margin: const EdgeInsets.only(bottom: Tokens.space2),
            child: InkWell(
              onTap: () => context.push(
                '/projects/$projectId/requirements/${node.id}',
              ),
              borderRadius: BorderRadius.circular(Tokens.radiusLg),
              child: Padding(
                padding: const EdgeInsets.symmetric(
                  horizontal: Tokens.space3,
                  vertical: Tokens.space3,
                ),
                child: Row(
                  children: [
                    // Type badge
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: _typeColor(node.type).withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(Tokens.radiusSm),
                      ),
                      child: Text(
                        node.type,
                        style: TextStyle(
                          fontSize: Tokens.fontXs,
                          fontWeight: FontWeight.w600,
                          color: _typeColor(node.type),
                        ),
                      ),
                    ),
                    const SizedBox(width: Tokens.space3),
                    // Title
                    Expanded(
                      child: Text(
                        node.title,
                        style: Theme.of(context).textTheme.bodyMedium,
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    const SizedBox(width: Tokens.space2),
                    // Status dot
                    Container(
                      width: 8,
                      height: 8,
                      decoration: BoxDecoration(
                        color: _statusColor(node.status),
                        shape: BoxShape.circle,
                      ),
                    ),
                    const SizedBox(width: Tokens.space2),
                    const Icon(LucideIcons.chevronRight, size: 16, color: Tokens.textTertiary),
                  ],
                ),
              ),
            ),
          ),
        ),
        // Render children recursively
        ...node.children.map((child) => _TreeNodeTile(
              node: child,
              projectId: projectId,
              depth: depth + 1,
            )),
      ],
    );
  }
}
