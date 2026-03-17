import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/settings_provider.dart';

/// Central API client that talks to the ARQITEKT Hub backend.
class ApiClient {
  late final Dio _dio;

  ApiClient({required String baseUrl}) {
    _dio = Dio(BaseOptions(
      baseUrl: baseUrl,
      connectTimeout: const Duration(seconds: 10),
      receiveTimeout: const Duration(seconds: 30),
      headers: {'Content-Type': 'application/json'},
    ));
  }

  // ── Projects ─────────────────────────────────────────────────────
  Future<List<dynamic>> getProjects() async {
    final res = await _dio.get('/projects');
    return res.data as List<dynamic>;
  }

  Future<Map<String, dynamic>> getProject(String id) async {
    final res = await _dio.get('/projects/$id');
    return res.data as Map<String, dynamic>;
  }

  // ── Requirements ─────────────────────────────────────────────────
  Future<List<dynamic>> getRequirementsTree(String projectId) async {
    final res = await _dio.get('/projects/$projectId/requirements/tree');
    return res.data as List<dynamic>;
  }

  Future<Map<String, dynamic>> getRequirement(String projectId, String artifactId) async {
    final res = await _dio.get('/projects/$projectId/requirements/$artifactId');
    return res.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> getProjectStats(String projectId) async {
    final res = await _dio.get('/projects/$projectId/requirements/stats');
    return res.data as Map<String, dynamic>;
  }

  Future<List<dynamic>> validateProject(String projectId) async {
    final res = await _dio.get('/projects/$projectId/requirements/validate');
    return res.data as List<dynamic>;
  }

  // ── Chat ─────────────────────────────────────────────────────────
  Future<Map<String, dynamic>> sendMessage(
    String projectId,
    String message, {
    String? model,
    String? context,
  }) async {
    final res = await _dio.post('/projects/$projectId/chat/send', data: {
      'message': message,
      if (model != null) 'model': model,
      if (context != null) 'context': context,
    });
    return res.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> getChatConfig(String projectId) async {
    final res = await _dio.get('/projects/$projectId/chat/config');
    return res.data as Map<String, dynamic>;
  }

  // ── Feedback ─────────────────────────────────────────────────────
  Future<Map<String, dynamic>> createFeedback(
    String projectId, {
    required String title,
    String? description,
    String? severity,
  }) async {
    final res = await _dio.post('/projects/$projectId/feedback', data: {
      'title': title,
      if (description != null) 'description': description,
      if (severity != null) 'severity': severity,
    });
    return res.data as Map<String, dynamic>;
  }

  // ── Hub ──────────────────────────────────────────────────────────
  Future<Map<String, dynamic>> getVersion() async {
    final res = await _dio.get('/hub/version');
    return res.data as Map<String, dynamic>;
  }
}

/// Provider for the API client — re-created when the hub URL changes.
final apiClientProvider = Provider<ApiClient>((ref) {
  final settings = ref.watch(settingsProvider);
  return ApiClient(baseUrl: '${settings.hubUrl}/api');
});
