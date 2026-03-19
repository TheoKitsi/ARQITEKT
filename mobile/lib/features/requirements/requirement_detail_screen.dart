import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_markdown/flutter_markdown.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../providers/requirements_provider.dart';
import '../../services/api_client.dart';
import '../../theme/tokens.dart';

class RequirementDetailScreen extends ConsumerStatefulWidget {
  final String projectId;
  final String artifactId;

  const RequirementDetailScreen({
    super.key,
    required this.projectId,
    required this.artifactId,
  });

  @override
  ConsumerState<RequirementDetailScreen> createState() =>
      _RequirementDetailScreenState();
}

class _RequirementDetailScreenState
    extends ConsumerState<RequirementDetailScreen> {
  static const _statusOrder = ['idea', 'draft', 'review', 'approved', 'implemented'];
  bool _saving = false;

  Future<void> _changeStatus(String currentStatus) async {
    final nextStatuses = _statusOrder
        .where((s) => _statusOrder.indexOf(s) > _statusOrder.indexOf(currentStatus))
        .toList();
    if (nextStatuses.isEmpty) return;

    final selected = await showModalBottomSheet<String>(
      context: context,
      builder: (ctx) => SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Padding(
              padding: const EdgeInsets.all(Tokens.space4),
              child: Text('Status setzen',
                  style: Theme.of(ctx).textTheme.titleMedium),
            ),
            ...nextStatuses.map((s) => ListTile(
                  leading: Icon(LucideIcons.arrowRight, size: 16, color: Tokens.gold),
                  title: Text(s.toUpperCase()),
                  onTap: () => Navigator.pop(ctx, s),
                )),
            const SizedBox(height: Tokens.space2),
          ],
        ),
      ),
    );

    if (selected == null || !mounted) return;

    setState(() => _saving = true);
    try {
      final api = ref.read(apiClientProvider);
      await api.setRequirementStatus(
        widget.projectId,
        artifactId: widget.artifactId,
        status: selected,
      );
      ref.invalidate(requirementDetailProvider(
        (projectId: widget.projectId, artifactId: widget.artifactId),
      ));
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Fehler: $e')),
        );
      }
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final detailAsync = ref.watch(
      requirementDetailProvider(
          (projectId: widget.projectId, artifactId: widget.artifactId)),
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
                    ActionChip(
                      label: _saving
                          ? const SizedBox(
                              width: 14,
                              height: 14,
                              child:
                                  CircularProgressIndicator(strokeWidth: 2),
                            )
                          : Text(detail.status.toUpperCase()),
                      avatar: detail.status != 'implemented'
                          ? const Icon(LucideIcons.arrowUpRight, size: 14)
                          : null,
                      backgroundColor: Tokens.surfaceBg3,
                      onPressed: _saving
                          ? null
                          : () => _changeStatus(detail.status),
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
