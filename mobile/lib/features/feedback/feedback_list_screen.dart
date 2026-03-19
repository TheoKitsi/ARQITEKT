import 'package:flutter/material.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../services/api_client.dart';
import '../../theme/tokens.dart';

/// Provider for loading feedback items for a project.
final feedbackListProvider =
    FutureProvider.family<List<Map<String, dynamic>>, String>((ref, projectId) async {
  final api = ref.watch(apiClientProvider);
  final items = await api.getFeedbackList(projectId);
  return items.cast<Map<String, dynamic>>();
});

class FeedbackListScreen extends ConsumerWidget {
  final String projectId;
  const FeedbackListScreen({super.key, required this.projectId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final feedbackAsync = ref.watch(feedbackListProvider(projectId));

    return Scaffold(
      appBar: AppBar(
        title: Text(AppLocalizations.of(context)!.feedback),
        leading: IconButton(
          icon: const Icon(LucideIcons.arrowLeft),
          onPressed: () => Navigator.of(context).pop(),
        ),
        actions: [
          IconButton(
            icon: const Icon(LucideIcons.refreshCw),
            onPressed: () => ref.invalidate(feedbackListProvider(projectId)),
          ),
        ],
      ),
      body: feedbackAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, _) => Center(child: Text(AppLocalizations.of(context)!.errorPrefix(err.toString()))),
        data: (items) {
          if (items.isEmpty) {
            return Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(LucideIcons.inbox, size: 48, color: Tokens.textTertiary),
                  const SizedBox(height: Tokens.space4),
                  Text(
                    AppLocalizations.of(context)!.noFeedback,
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                          color: Tokens.textSecondary,
                        ),
                  ),
                ],
              ),
            );
          }

          return ListView.builder(
            padding: const EdgeInsets.all(Tokens.space4),
            itemCount: items.length,
            itemBuilder: (context, i) => _FeedbackCard(item: items[i]),
          );
        },
      ),
    );
  }
}

class _FeedbackCard extends StatelessWidget {
  final Map<String, dynamic> item;
  const _FeedbackCard({required this.item});

  @override
  Widget build(BuildContext context) {
    final title = item['title'] as String? ?? 'Untitled';
    final severity = item['severity'] as String? ?? 'medium';
    final status = item['status'] as String? ?? 'open';
    final description = item['description'] as String?;
    final createdAt = item['createdAt'] as String?;

    final (severityIcon, severityColor) = _severityDecoration(severity);

    return Card(
      margin: const EdgeInsets.only(bottom: Tokens.space2),
      child: ListTile(
        leading: Icon(severityIcon, color: severityColor, size: 20),
        title: Text(title, style: const TextStyle(fontWeight: FontWeight.w600)),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (description != null && description.isNotEmpty) ...[
              const SizedBox(height: Tokens.space1),
              Text(
                description,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                style: TextStyle(
                  fontSize: Tokens.fontSm,
                  color: Tokens.textSecondary,
                ),
              ),
            ],
            const SizedBox(height: Tokens.space1),
            Row(
              children: [
                Chip(
                  label: Text(severity.toUpperCase()),
                  labelStyle: TextStyle(fontSize: Tokens.fontXs, color: severityColor),
                  backgroundColor: severityColor.withValues(alpha: 0.12),
                  visualDensity: VisualDensity.compact,
                  materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                ),
                const SizedBox(width: Tokens.space2),
                Chip(
                  label: Text(status.toUpperCase()),
                  labelStyle: const TextStyle(fontSize: Tokens.fontXs),
                  visualDensity: VisualDensity.compact,
                  materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                ),
                if (createdAt != null) ...[
                  const Spacer(),
                  Text(
                    _formatDate(createdAt),
                    style: TextStyle(
                      fontSize: Tokens.fontXs,
                      color: Tokens.textTertiary,
                    ),
                  ),
                ],
              ],
            ),
          ],
        ),
        isThreeLine: description != null && description.isNotEmpty,
      ),
    );
  }

  (IconData, Color) _severityDecoration(String severity) {
    return switch (severity) {
      'critical' => (LucideIcons.alertOctagon, Tokens.red),
      'high' => (LucideIcons.alertTriangle, Tokens.orange),
      'medium' => (LucideIcons.info, Tokens.yellow),
      'low' => (LucideIcons.messageCircle, Tokens.textSecondary),
      _ => (LucideIcons.messageCircle, Tokens.textSecondary),
    };
  }

  String _formatDate(String iso) {
    try {
      final dt = DateTime.parse(iso);
      return '${dt.day.toString().padLeft(2, '0')}.${dt.month.toString().padLeft(2, '0')}.${dt.year}';
    } catch (_) {
      return iso;
    }
  }
}
