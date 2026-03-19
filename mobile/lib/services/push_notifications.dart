import 'package:flutter_riverpod/flutter_riverpod.dart';

/// Stub push notification service.
/// To enable FCM, add `firebase_messaging` to pubspec.yaml,
/// place google-services.json / GoogleService-Info.plist,
/// and replace stub methods with real implementations.
class PushNotificationService {
  bool _initialized = false;

  /// Initialize push notifications. No-op until FCM is configured.
  Future<void> initialize() async {
    if (_initialized) return;
    _initialized = true;
    // TODO: Replace with FirebaseMessaging.instance setup when FCM is configured.
    // await FirebaseMessaging.instance.requestPermission();
    // final token = await FirebaseMessaging.instance.getToken();
    // Send token to backend: POST /api/devices { token, platform }
  }

  /// Get the current device token, if available.
  Future<String?> getToken() async {
    // TODO: return FirebaseMessaging.instance.getToken();
    return null;
  }

  /// Subscribe to a project's notification topic.
  Future<void> subscribeToProject(String projectId) async {
    // TODO: FirebaseMessaging.instance.subscribeToTopic('project_$projectId');
  }

  /// Unsubscribe from a project's notification topic.
  Future<void> unsubscribeFromProject(String projectId) async {
    // TODO: FirebaseMessaging.instance.unsubscribeFromTopic('project_$projectId');
  }
}

/// Provider for the push notification service.
final pushNotificationProvider = Provider<PushNotificationService>((ref) {
  return PushNotificationService();
});
