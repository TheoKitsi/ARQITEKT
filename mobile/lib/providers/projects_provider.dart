import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/project.dart';
import '../services/api_client.dart';

/// Fetches all projects from the Hub.
final projectsProvider = FutureProvider<List<Project>>((ref) async {
  final api = ref.watch(apiClientProvider);
  final data = await api.getProjects();
  return data.map((j) => Project.fromJson(j as Map<String, dynamic>)).toList();
});

/// Fetches a single project by ID.
final projectProvider = FutureProvider.family<Project, String>((ref, id) async {
  final projects = await ref.watch(projectsProvider.future);
  return projects.firstWhere((p) => p.id == id);
});
