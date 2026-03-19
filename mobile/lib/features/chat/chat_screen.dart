import 'package:flutter/material.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_markdown/flutter_markdown.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:speech_to_text/speech_to_text.dart' as stt;
import '../../models/chat.dart';
import '../../providers/chat_provider.dart';
import '../../providers/settings_provider.dart';
import '../../theme/tokens.dart';

class ChatScreen extends ConsumerStatefulWidget {
  final String projectId;
  const ChatScreen({super.key, required this.projectId});

  @override
  ConsumerState<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends ConsumerState<ChatScreen> {
  final _controller = TextEditingController();
  final _scrollController = ScrollController();
  bool _sending = false;
  bool _listening = false;
  final _speech = stt.SpeechToText();

  @override
  void dispose() {
    _controller.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  Future<void> _send() async {
    final text = _controller.text.trim();
    if (text.isEmpty || _sending) return;

    _controller.clear();
    setState(() => _sending = true);

    await ref.read(chatMessagesProvider(widget.projectId).notifier).send(text);

    setState(() => _sending = false);
    _scrollToBottom();
  }

  Future<void> _toggleVoice() async {
    if (_listening) {
      await _speech.stop();
      setState(() => _listening = false);
      return;
    }

    final available = await _speech.initialize();
    if (!available) return;

    setState(() => _listening = true);
    final settingsAsync = ref.read(settingsProvider);
    final lang = settingsAsync.valueOrNull?.language ?? 'de';
    final localeId = lang == 'en' ? 'en_US' : 'de_DE';
    await _speech.listen(
      onResult: (result) {
        _controller.text = result.recognizedWords;
        if (result.finalResult) {
          setState(() => _listening = false);
        }
      },
      localeId: localeId,
    );
  }

  @override
  Widget build(BuildContext context) {
    final messages = ref.watch(chatMessagesProvider(widget.projectId));

    return Scaffold(
      appBar: AppBar(
        title: Text(AppLocalizations.of(context)!.aiChat),
        leading: IconButton(
          icon: const Icon(LucideIcons.arrowLeft),
          onPressed: () => Navigator.of(context).pop(),
        ),
        actions: [
          if (messages.isNotEmpty)
            IconButton(
              icon: const Icon(LucideIcons.trash2),
              onPressed: () {
                ref.read(chatMessagesProvider(widget.projectId).notifier).clear();
              },
            ),
        ],
      ),
      body: Column(
        children: [
          // Messages
          Expanded(
            child: messages.isEmpty
                ? _EmptyChat()
                : ListView.builder(
                    controller: _scrollController,
                    padding: const EdgeInsets.all(Tokens.space4),
                    itemCount: messages.length,
                    itemBuilder: (context, i) => _MessageBubble(message: messages[i]),
                  ),
          ),

          // Input bar
          Container(
            padding: const EdgeInsets.all(Tokens.space3),
            decoration: const BoxDecoration(
              color: Tokens.surfaceBg2,
              border: Border(top: BorderSide(color: Tokens.borderDefault)),
            ),
            child: SafeArea(
              top: false,
              child: Row(
                children: [
                  // Voice input
                  IconButton(
                    icon: Icon(
                      _listening ? LucideIcons.micOff : LucideIcons.mic,
                      color: _listening ? Tokens.red : Tokens.textSecondary,
                    ),
                    onPressed: _toggleVoice,
                  ),
                  // Text field
                  Expanded(
                    child: TextField(
                      controller: _controller,
                      maxLines: 4,
                      minLines: 1,
                      textInputAction: TextInputAction.send,
                      onSubmitted: (_) => _send(),
                      decoration: InputDecoration(
                        hintText: AppLocalizations.of(context)!.chatHint,
                        border: InputBorder.none,
                        enabledBorder: InputBorder.none,
                        focusedBorder: InputBorder.none,
                        fillColor: Tokens.surfaceBg3,
                        contentPadding: EdgeInsets.symmetric(
                          horizontal: Tokens.space3,
                          vertical: Tokens.space2,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: Tokens.space2),
                  // Send button
                  IconButton.filled(
                    onPressed: _sending ? null : _send,
                    icon: _sending
                        ? const SizedBox(
                            width: 20,
                            height: 20,
                            child: CircularProgressIndicator(strokeWidth: 2),
                          )
                        : const Icon(LucideIcons.send, size: 20),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _EmptyChat extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(LucideIcons.messageSquare, size: 64, color: Tokens.textTertiary),
          const SizedBox(height: Tokens.space4),
          Text(
            AppLocalizations.of(context)!.aiAssistant,
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  color: Tokens.textSecondary,
                ),
          ),
          const SizedBox(height: Tokens.space2),
          Text(
            AppLocalizations.of(context)!.askAboutProject,
            style: const TextStyle(color: Tokens.textTertiary),
          ),
        ],
      ),
    );
  }
}

class _MessageBubble extends StatelessWidget {
  final ChatMessage message;
  const _MessageBubble({required this.message});

  @override
  Widget build(BuildContext context) {
    final isUser = message.role == 'user';

    return Padding(
      padding: const EdgeInsets.only(bottom: Tokens.space3),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: isUser ? MainAxisAlignment.end : MainAxisAlignment.start,
        children: [
          if (!isUser) ...[
            CircleAvatar(
              radius: 16,
              backgroundColor: Tokens.gold.withValues(alpha: 0.15),
              child: const Icon(LucideIcons.bot, size: 16, color: Tokens.gold),
            ),
            const SizedBox(width: Tokens.space2),
          ],
          Flexible(
            child: Container(
              padding: const EdgeInsets.all(Tokens.space3),
              decoration: BoxDecoration(
                color: isUser ? Tokens.gold.withValues(alpha: 0.15) : Tokens.surfaceBg3,
                borderRadius: BorderRadius.circular(Tokens.radiusLg),
              ),
              child: isUser
                  ? Text(message.content)
                  : MarkdownBody(
                      data: message.content,
                      styleSheet: MarkdownStyleSheet(
                        p: Theme.of(context).textTheme.bodyMedium,
                        code: TextStyle(
                          fontFamily: 'JetBrains Mono',
                          fontSize: Tokens.fontSm,
                          backgroundColor: Tokens.surfaceBg4,
                        ),
                      ),
                    ),
            ),
          ),
          if (isUser) ...[
            const SizedBox(width: Tokens.space2),
            CircleAvatar(
              radius: 16,
              backgroundColor: Tokens.surfaceBg3,
              child: const Icon(LucideIcons.user, size: 16, color: Tokens.textSecondary),
            ),
          ],
        ],
      ),
    );
  }
}
