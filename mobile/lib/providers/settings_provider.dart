import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

/// App settings stored in SharedPreferences.
class AppSettings {
  final String hubUrl;
  final String language;

  const AppSettings({
    this.hubUrl = 'http://localhost:3334',
    this.language = 'de',
  });

  AppSettings copyWith({String? hubUrl, String? language}) {
    return AppSettings(
      hubUrl: hubUrl ?? this.hubUrl,
      language: language ?? this.language,
    );
  }
}

/// Settings notifier — loads/saves to SharedPreferences.
class SettingsNotifier extends Notifier<AppSettings> {
  static const _keyHubUrl = 'hub_url';
  static const _keyLanguage = 'language';

  @override
  AppSettings build() {
    _load();
    return const AppSettings();
  }

  Future<void> _load() async {
    final prefs = await SharedPreferences.getInstance();
    state = AppSettings(
      hubUrl: prefs.getString(_keyHubUrl) ?? 'http://localhost:3334',
      language: prefs.getString(_keyLanguage) ?? 'de',
    );
  }

  Future<void> setHubUrl(String url) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_keyHubUrl, url);
    state = state.copyWith(hubUrl: url);
  }

  Future<void> setLanguage(String lang) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_keyLanguage, lang);
    state = state.copyWith(language: lang);
  }
}

final settingsProvider = NotifierProvider<SettingsNotifier, AppSettings>(
  SettingsNotifier.new,
);
