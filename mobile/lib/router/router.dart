import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../features/projects/projects_screen.dart';
import '../features/projects/project_detail_screen.dart';
import '../features/projects/create_project_screen.dart';
import '../features/requirements/requirements_screen.dart';
import '../features/requirements/requirement_detail_screen.dart';
import '../features/chat/chat_screen.dart';
import '../features/capture/capture_screen.dart';
import '../features/feedback/feedback_list_screen.dart';
import '../features/settings/settings_screen.dart';
import '../features/pipeline/pipeline_screen.dart';
import '../features/traceability/traceability_screen.dart';
import '../features/shared/app_shell.dart';

final _rootNavigatorKey = GlobalKey<NavigatorState>();
final _shellNavigatorKey = GlobalKey<NavigatorState>();

final router = GoRouter(
  navigatorKey: _rootNavigatorKey,
  initialLocation: '/projects',
  routes: [
    ShellRoute(
      navigatorKey: _shellNavigatorKey,
      builder: (context, state, child) => AppShell(child: child),
      routes: [
        GoRoute(
          path: '/projects',
          builder: (context, state) => const ProjectsScreen(),
        ),
        GoRoute(
          path: '/capture',
          builder: (context, state) => const CaptureScreen(),
        ),
        GoRoute(
          path: '/settings',
          builder: (context, state) => const SettingsScreen(),
        ),
      ],
    ),
    GoRoute(
      path: '/projects/new',
      parentNavigatorKey: _rootNavigatorKey,
      builder: (context, state) => const CreateProjectScreen(),
    ),
    GoRoute(
      path: '/projects/:id',
      parentNavigatorKey: _rootNavigatorKey,
      builder: (context, state) {
        final id = state.pathParameters['id']!;
        return ProjectDetailScreen(projectId: id);
      },
    ),
    GoRoute(
      path: '/projects/:id/feedback',
      parentNavigatorKey: _rootNavigatorKey,
      builder: (context, state) {
        final id = state.pathParameters['id']!;
        return FeedbackListScreen(projectId: id);
      },
    ),
    GoRoute(
      path: '/projects/:id/requirements',
      parentNavigatorKey: _rootNavigatorKey,
      builder: (context, state) {
        final id = state.pathParameters['id']!;
        return RequirementsScreen(projectId: id);
      },
    ),
    GoRoute(
      path: '/projects/:id/requirements/:artifactId',
      parentNavigatorKey: _rootNavigatorKey,
      builder: (context, state) {
        final projectId = state.pathParameters['id']!;
        final artifactId = state.pathParameters['artifactId']!;
        return RequirementDetailScreen(
          projectId: projectId,
          artifactId: artifactId,
        );
      },
    ),
    GoRoute(
      path: '/projects/:id/chat',
      parentNavigatorKey: _rootNavigatorKey,
      builder: (context, state) {
        final id = state.pathParameters['id']!;
        return ChatScreen(projectId: id);
      },
    ),
    GoRoute(
      path: '/projects/:id/pipeline',
      parentNavigatorKey: _rootNavigatorKey,
      builder: (context, state) {
        final id = state.pathParameters['id']!;
        return PipelineScreen(projectId: id);
      },
    ),
    GoRoute(
      path: '/projects/:id/traceability',
      parentNavigatorKey: _rootNavigatorKey,
      builder: (context, state) {
        final id = state.pathParameters['id']!;
        return TraceabilityScreen(projectId: id);
      },
    ),
  ],
);
