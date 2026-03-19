import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/requirement.dart';
import '../services/api_client.dart';
import '../services/offline_cache.dart';

/// Fetches the requirements tree for a project, with offline cache fallback.
final requirementsTreeProvider =
    FutureProvider.family<List<TreeNode>, String>((ref, projectId) async {
  final api = ref.watch(apiClientProvider);
  final cache = ref.read(offlineCacheProvider);
  final cacheKey = 'requirements_tree_$projectId';
  try {
    final data = await api.getRequirementsTree(projectId);
    await cache.put(cacheKey, data);
    return data.map((j) => TreeNode.fromJson(j as Map<String, dynamic>)).toList();
  } catch (e) {
    final cached = cache.get(cacheKey);
    if (cached != null) {
      return (cached as List).map((j) => TreeNode.fromJson(Map<String, dynamic>.from(j))).toList();
    }
    rethrow;
  }
});

/// Fetches a single requirement's detail (with markdown body).
final requirementDetailProvider =
    FutureProvider.family<RequirementDetail, ({String projectId, String artifactId})>(
  (ref, args) async {
    final api = ref.watch(apiClientProvider);
    final data = await api.getRequirement(args.projectId, args.artifactId);
    return RequirementDetail.fromJson(data);
  },
);
