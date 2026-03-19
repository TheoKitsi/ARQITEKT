import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/pipeline.dart';
import '../services/api_client.dart';

/// Pipeline overview for a project.
final pipelineProvider = FutureProvider.family<PipelineStatus, String>((ref, projectId) async {
  final api = ref.watch(apiClientProvider);
  final data = await api.getPipeline(projectId);
  return PipelineStatus.fromJson(data);
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

/// Orphaned artifacts for a project.
final orphansProvider = FutureProvider.family<List<String>, String>((ref, projectId) async {
  final api = ref.watch(apiClientProvider);
  final data = await api.getOrphans(projectId);
  return (data['orphans'] as List<dynamic>? ?? []).cast<String>();
});
