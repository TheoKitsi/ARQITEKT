/// Chat message model.
class ChatMessage {
  final String role;
  final String content;
  final DateTime timestamp;

  const ChatMessage({
    required this.role,
    required this.content,
    required this.timestamp,
  });

  factory ChatMessage.fromJson(Map<String, dynamic> json) {
    return ChatMessage(
      role: json['role'] as String? ?? 'user',
      content: json['content'] as String? ?? '',
      timestamp: DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() => {
        'role': role,
        'content': content,
      };
}

/// Chat send response from the server.
class ChatResponse {
  final String reply;
  final String? model;

  const ChatResponse({required this.reply, this.model});

  factory ChatResponse.fromJson(Map<String, dynamic> json) {
    return ChatResponse(
      reply: json['reply'] as String? ?? json['content'] as String? ?? '',
      model: json['model'] as String?,
    );
  }
}
