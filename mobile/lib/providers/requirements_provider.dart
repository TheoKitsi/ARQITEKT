import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/requirement.dart';
import '../services/api_client.dart';

/// Fetches the requirements tree for a project.
final requirementsTreeProvider =
    FutureProvider.family<List<TreeNode>, String>((ref, projectId) async {
  final api = ref.watch(apiClientProvider);
  final data = await api.getRequirementsTree(projectId);
  return data.map((j) => TreeNode.fromJson(j as Map<String, dynamic>)).toList();
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
