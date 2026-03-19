import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/project.dart';
import '../services/api_client.dart';
import '../services/offline_cache.dart';

/// Fetches all projects from the Hub, with offline cache fallback.
final projectsProvider = FutureProvider<List<Project>>((ref) async {
  final api = ref.watch(apiClientProvider);
  final cache = ref.read(offlineCacheProvider);
  try {
    final data = await api.getProjects();
    final projects = data.map((j) => Project.fromJson(j as Map<String, dynamic>)).toList();
    await cache.put('projects', data);
    return projects;
  } catch (e) {
    final cached = cache.get('projects');
    if (cached != null) {
      return (cached as List).map((j) => Project.fromJson(Map<String, dynamic>.from(j))).toList();
    }
    rethrow;
  }
});

/// Fetches a single project by ID.
final projectProvider = FutureProvider.family<Project, String>((ref, id) async {
  final projects = await ref.watch(projectsProvider.future);
  return projects.firstWhere((p) => p.id == id);
});
