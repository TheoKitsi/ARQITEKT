import 'package:flutter/material.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../providers/chat_provider.dart';
import '../../services/api_client.dart';
import '../../theme/tokens.dart';

/// Lists saved conversations and allows loading them back into the chat.
class ConversationHistoryScreen extends ConsumerStatefulWidget {
  final String projectId;
  const ConversationHistoryScreen({super.key, required this.projectId});

  @override
  ConsumerState<ConversationHistoryScreen> createState() =>
      _ConversationHistoryScreenState();
}

class _ConversationHistoryScreenState
    extends ConsumerState<ConversationHistoryScreen> {
  List<Map<String, dynamic>> _conversations = [];
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _fetchConversations();
  }

  Future<void> _fetchConversations() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final api = ref.read(apiClientProvider);
      final data = await api.listConversations(widget.projectId);
      setState(() {
        _conversations = data
            .whereType<Map<String, dynamic>>()
            .toList()
          ..sort((a, b) {
            final aDate = a['createdAt'] as String? ?? '';
            final bDate = b['createdAt'] as String? ?? '';
            return bDate.compareTo(aDate);
          });
        _loading = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
        _loading = false;
      });
    }
  }

  Future<void> _loadConversation(String id) async {
    await ref
        .read(chatMessagesProvider(widget.projectId).notifier)
        .loadConversation(id);
    if (mounted) {
      Navigator.of(context).pop();
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;

    return Scaffold(
      appBar: AppBar(
        title: Text(l10n.conversationHistory),
        leading: IconButton(
          icon: const Icon(LucideIcons.arrowLeft),
          onPressed: () => Navigator.of(context).pop(),
        ),
        actions: [
          IconButton(
            icon: const Icon(LucideIcons.refreshCw),
            onPressed: _fetchConversations,
          ),
        ],
      ),
      body: _buildBody(l10n),
    );
  }

  Widget _buildBody(AppLocalizations l10n) {
    if (_loading) {
      return const Center(child: CircularProgressIndicator());
    }

    if (_error != null) {
      return Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(LucideIcons.alertTriangle, size: 48, color: Tokens.red),
            const SizedBox(height: Tokens.space3),
            Text(_error!, style: const TextStyle(color: Tokens.textSecondary)),
            const SizedBox(height: Tokens.space3),
            FilledButton(
              onPressed: _fetchConversations,
              child: Text(l10n.retry),
            ),
          ],
        ),
      );
    }

    if (_conversations.isEmpty) {
      return Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(LucideIcons.messageSquare,
                size: 64, color: Tokens.textTertiary),
            const SizedBox(height: Tokens.space4),
            Text(
              l10n.noConversations,
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    color: Tokens.textSecondary,
                  ),
            ),
          ],
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: _fetchConversations,
      child: ListView.builder(
        padding: const EdgeInsets.all(Tokens.space4),
        itemCount: _conversations.length,
        itemBuilder: (context, index) {
          final conv = _conversations[index];
          final title = conv['title'] as String? ?? l10n.conversationHistory;
          final id = conv['id'] as String? ?? '';
          final createdAt = conv['createdAt'] as String? ?? '';
          final msgCount = (conv['messages'] as List?)?.length ?? 0;

          return Card(
            margin: const EdgeInsets.only(bottom: Tokens.space3),
            color: Tokens.surfaceBg2,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(Tokens.radiusLg),
              side: const BorderSide(color: Tokens.borderDefault),
            ),
            child: ListTile(
              contentPadding: const EdgeInsets.symmetric(
                horizontal: Tokens.space4,
                vertical: Tokens.space2,
              ),
              leading: CircleAvatar(
                backgroundColor: Tokens.gold.withValues(alpha: 0.15),
                child:
                    const Icon(LucideIcons.messageCircle, color: Tokens.gold, size: 20),
              ),
              title: Text(
                title,
                style: const TextStyle(
                  color: Tokens.textPrimary,
                  fontWeight: FontWeight.w600,
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
              subtitle: Text(
                '$msgCount messages  $createdAt',
                style: const TextStyle(
                  color: Tokens.textTertiary,
                  fontSize: Tokens.fontXs,
                ),
              ),
              trailing: IconButton(
                icon: const Icon(LucideIcons.download, color: Tokens.accent),
                onPressed: id.isNotEmpty ? () => _loadConversation(id) : null,
              ),
            ),
          );
        },
      ),
    );
  }
}
