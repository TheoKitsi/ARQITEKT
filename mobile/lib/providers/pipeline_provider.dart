import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/pipeline.dart';
import '../services/api_client.dart';
import '../services/offline_cache.dart';

/// Pipeline overview for a project, with offline cache fallback.
final pipelineProvider = FutureProvider.family<PipelineStatus, String>((ref, projectId) async {
  final api = ref.watch(apiClientProvider);
  final cache = ref.read(offlineCacheProvider);
  final cacheKey = 'pipeline_$projectId';
  try {
    final data = await api.getPipeline(projectId);
    await cache.put(cacheKey, data);
    return PipelineStatus.fromJson(data);
  } catch (e) {
    final cached = cache.get(cacheKey);
    if (cached != null) {
      return PipelineStatus.fromJson(Map<String, dynamic>.from(cached));
    }
    rethrow;
  }
});

/// Drift report for a project.
final driftProvider = FutureProvider.family<DriftReport, String>((ref, projectId) async {
  final api = ref.watch(apiClientProvider);
  final data = await api.getDrift(projectId);
  return DriftReport.fromJson(data);
});

/// Confidence scores for all artifacts in a project.
final confidenceProvider = FutureProvider.family<List<ConfidenceScore>, String>((ref, projectId) async {
  final api = ref.watch(apiClientProvider);
  final data = await api.getConfidence(projectId);
  final scores = data['scores'] as List<dynamic>? ?? [];
  return scores.map((s) => ConfidenceScore.fromJson(s as Map<String, dynamic>)).toList();
});
