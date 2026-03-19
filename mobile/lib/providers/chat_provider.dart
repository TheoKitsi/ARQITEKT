import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:dio/dio.dart';
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
      String errorMessage;
      if (e is DioException) {
        errorMessage = e.response?.statusCode == 429
            ? 'Zu viele Anfragen. Bitte warten.'
            : 'Verbindung zum Server fehlgeschlagen.';
      } else {
        errorMessage = 'Es ist ein Fehler aufgetreten.';
      }

      state = [
        ...state,
        ChatMessage(
          role: 'assistant',
          content: errorMessage,
          timestamp: DateTime.now(),
        ),
      ];
    }
  }

  void clear() => state = [];

  /// Save the current conversation to the server.
  Future<void> saveConversation(String title) async {
    if (state.isEmpty) return;
    final api = _ref.read(apiClientProvider);
    final messages = state
        .map((m) => {'role': m.role, 'content': m.content})
        .toList();
    await api.saveConversation(_projectId, title: title, messages: messages);
  }

  /// Load a saved conversation from the server.
  Future<void> loadConversation(String conversationId) async {
    final api = _ref.read(apiClientProvider);
    final data = await api.getConversation(_projectId, conversationId);
    final messages = (data['messages'] as List<dynamic>?)
        ?.map((m) => ChatMessage(
              role: (m as Map<String, dynamic>)['role'] as String? ?? 'user',
              content: m['content'] as String? ?? '',
              timestamp: DateTime.now(),
            ))
        .toList() ?? [];
    state = messages;
  }
}
