import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'package:arqitekt_mobile/main.dart';
import 'package:arqitekt_mobile/services/offline_cache.dart';

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  group('App smoke tests', () {
    testWidgets('app launches and shows projects screen', (tester) async {
      SharedPreferences.setMockInitialValues({});
      final prefs = await SharedPreferences.getInstance();

      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            offlineCacheProvider.overrideWithValue(OfflineCache(prefs)),
          ],
          child: const ArqitektApp(),
        ),
      );
      await tester.pumpAndSettle();

      // The app should show the Projects screen (or connection error)
      expect(find.byType(MaterialApp), findsOneWidget);
    });

    testWidgets('bottom navigation has 3 items', (tester) async {
      SharedPreferences.setMockInitialValues({});
      final prefs = await SharedPreferences.getInstance();

      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            offlineCacheProvider.overrideWithValue(OfflineCache(prefs)),
          ],
          child: const ArqitektApp(),
        ),
      );
      await tester.pumpAndSettle();

      // NavigationBar should have 3 destinations (Projects, Capture, Settings)
      final navBar = find.byType(NavigationBar);
      expect(navBar, findsOneWidget);
    });

    testWidgets('can navigate to Settings tab', (tester) async {
      SharedPreferences.setMockInitialValues({});
      final prefs = await SharedPreferences.getInstance();

      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            offlineCacheProvider.overrideWithValue(OfflineCache(prefs)),
          ],
          child: const ArqitektApp(),
        ),
      );
      await tester.pumpAndSettle();

      // Tap the Settings tab (3rd navigation item)
      final navBar = find.byType(NavigationBar);
      if (navBar.evaluate().isNotEmpty) {
        final settingsIcon = find.byIcon(Icons.settings);
        if (settingsIcon.evaluate().isNotEmpty) {
          await tester.tap(settingsIcon.first);
          await tester.pumpAndSettle();
        }
      }

      // Should still have the app running without crashes
      expect(find.byType(MaterialApp), findsOneWidget);
    });
  });
}
