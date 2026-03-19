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

  Future<Map<String, dynamic>> createProject({
    required String name,
    String? description,
  }) async {
    final res = await _dio.post('/projects', data: {
      'name': name,
      if (description != null) 'description': description,
    });
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

  Future<Map<String, dynamic>> setRequirementStatus(
    String projectId, {
    required String artifactId,
    required String status,
  }) async {
    final res = await _dio.put('/projects/$projectId/set-status', data: {
      'artifactId': artifactId,
      'status': status,
    });
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
  Future<List<dynamic>> getFeedbackList(String projectId) async {
    final res = await _dio.get('/projects/$projectId/feedback');
    final data = res.data as Map<String, dynamic>;
    return data['items'] as List<dynamic>? ?? [];
  }

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

  // ── Pipeline ─────────────────────────────────────────────────────
  Future<Map<String, dynamic>> getPipeline(String projectId) async {
    final res = await _dio.get('/projects/$projectId/pipeline');
    return res.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> evaluateGate(String projectId, String gateId) async {
    final res = await _dio.post('/projects/$projectId/pipeline/gate/$gateId');
    return res.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> getConfidence(String projectId) async {
    final res = await _dio.get('/projects/$projectId/pipeline/confidence');
    return res.data as Map<String, dynamic>;
  }

  // ── Baseline & Drift ─────────────────────────────────────────────
  Future<Map<String, dynamic>> setBaseline(String projectId) async {
    final res = await _dio.post('/projects/$projectId/baseline');
    return res.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> getDrift(String projectId) async {
    final res = await _dio.get('/projects/$projectId/drift');
    return res.data as Map<String, dynamic>;
  }

  // ── Traceability ─────────────────────────────────────────────────
  Future<Map<String, dynamic>> getTraceability(String projectId) async {
    final res = await _dio.get('/projects/$projectId/traceability');
    return res.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> getOrphans(String projectId) async {
    final res = await _dio.get('/projects/$projectId/traceability/orphans');
    return res.data as Map<String, dynamic>;
  }

  // ── Probing ──────────────────────────────────────────────────────
  Future<Map<String, dynamic>> startProbing(
    String projectId, {
    required String artifactId,
  }) async {
    final res = await _dio.post('/projects/$projectId/probing/analyze', data: {
      'artifactId': artifactId,
    });
    return res.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> getProbingQuestions(
    String projectId, {
    String? artifactId,
  }) async {
    final res = await _dio.get(
      '/projects/$projectId/probing/questions',
      queryParameters: {if (artifactId != null) 'artifactId': artifactId},
    );
    return res.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> answerProbingQuestion(
    String projectId, {
    required String artifactId,
    required String questionId,
    required String answer,
  }) async {
    final res = await _dio.post('/projects/$projectId/probing/answer', data: {
      'artifactId': artifactId,
      'questionId': questionId,
      'answer': answer,
    });
    return res.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> skipProbingQuestion(
    String projectId, {
    required String artifactId,
    required String questionId,
    required String reason,
  }) async {
    final res = await _dio.post('/projects/$projectId/probing/skip', data: {
      'artifactId': artifactId,
      'questionId': questionId,
      'reason': reason,
    });
    return res.data as Map<String, dynamic>;
  }
}

/// Provider for the API client — re-created when the hub URL changes.
final apiClientProvider = Provider<ApiClient>((ref) {
  final settingsAsync = ref.watch(settingsProvider);
  final settings = settingsAsync.valueOrNull ?? const AppSettings();
  return ApiClient(baseUrl: '${settings.hubUrl}/api');
});
