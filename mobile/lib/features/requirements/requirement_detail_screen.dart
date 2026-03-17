import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_markdown/flutter_markdown.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../providers/requirements_provider.dart';
import '../../theme/tokens.dart';

class RequirementDetailScreen extends ConsumerWidget {
  final String projectId;
  final String artifactId;

  const RequirementDetailScreen({
    super.key,
    required this.projectId,
    required this.artifactId,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final detailAsync = ref.watch(
      requirementDetailProvider((projectId: projectId, artifactId: artifactId)),
    );

    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(LucideIcons.arrowLeft),
          onPressed: () => Navigator.of(context).pop(),
        ),
      ),
      body: detailAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, _) => Center(child: Text('Fehler: $err')),
        data: (detail) {
          return SingleChildScrollView(
            padding: const EdgeInsets.all(Tokens.space4),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Type + status row
                Row(
                  children: [
                    Chip(
                      label: Text(detail.type),
                      backgroundColor: Tokens.gold.withValues(alpha: 0.15),
                      labelStyle: const TextStyle(
                        color: Tokens.gold,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(width: Tokens.space2),
                    Chip(
                      label: Text(detail.status.toUpperCase()),
                      backgroundColor: Tokens.surfaceBg3,
                    ),
                  ],
                ),
                const SizedBox(height: Tokens.space3),

                // Title
                Text(
                  detail.title,
                  style: Theme.of(context).textTheme.headlineSmall,
                ),

                // ID
                const SizedBox(height: Tokens.space1),
                Text(
                  detail.id,
                  style: TextStyle(
                    fontSize: Tokens.fontSm,
                    color: Tokens.textTertiary,
                    fontFamily: 'JetBrains Mono',
                  ),
                ),

                const SizedBox(height: Tokens.space4),
                const Divider(),
                const SizedBox(height: Tokens.space4),

                // Markdown body
                MarkdownBody(
                  data: detail.body.isNotEmpty
                      ? detail.body
                      : '_Kein Inhalt vorhanden._',
                  styleSheet: MarkdownStyleSheet(
                    p: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          height: 1.6,
                        ),
                    h1: Theme.of(context).textTheme.titleLarge,
                    h2: Theme.of(context).textTheme.titleMedium,
                    h3: Theme.of(context).textTheme.titleSmall,
                    code: TextStyle(
                      fontFamily: 'JetBrains Mono',
                      fontSize: Tokens.fontSm,
                      backgroundColor: Tokens.surfaceBg3,
                      color: Tokens.textPrimary,
                    ),
                    codeblockDecoration: BoxDecoration(
                      color: Tokens.surfaceBg3,
                      borderRadius: BorderRadius.circular(Tokens.radiusMd),
                    ),
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}
