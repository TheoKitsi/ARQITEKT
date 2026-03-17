import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/chat.dart';
import '../services/api_client.dart';

/// In-memory chat messages per project.
final chatMessagesProvider =
    StateNotifierProvider.family<ChatMessagesNotifier, List<ChatMessage>, String>(
  (ref, projectId) => ChatMessagesNotifier(ref, projectId),
);

class ChatMessagesNotifier extends StateNotifier<List<ChatMessage>> {
  final Ref _ref;
  final String _projectId;

  ChatMessagesNotifier(this._ref, this._projectId) : super([]);

  Future<void> send(String message, {String? model}) async {
    // Add user message
    state = [
      ...state,
      ChatMessage(role: 'user', content: message, timestamp: DateTime.now()),
    ];

    try {
      final api = _ref.read(apiClientProvider);
      final data = await api.sendMessage(_projectId, message, model: model);
      final response = ChatResponse.fromJson(data);

      state = [
        ...state,
        ChatMessage(role: 'assistant', content: response.reply, timestamp: DateTime.now()),
      ];
    } catch (e) {
      state = [
        ...state,
        ChatMessage(
          role: 'assistant',
          content: 'Error: ${e.toString()}',
          timestamp: DateTime.now(),
        ),
      ];
    }
  }

  void clear() => state = [];
}
