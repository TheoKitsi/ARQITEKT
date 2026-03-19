import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../services/api_client.dart';

/// Traceability matrix for a project.
final traceabilityProvider =
    FutureProvider.family<Map<String, dynamic>, String>((ref, projectId) async {
  final client = ref.read(apiClientProvider);
  return client.getTraceability(projectId);
});

/// Orphaned artifacts for a project.
final orphansProvider =
    FutureProvider.family<Map<String, dynamic>, String>((ref, projectId) async {
  final client = ref.read(apiClientProvider);
  return client.getOrphans(projectId);
});
