import 'dart:convert';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

/// Simple offline cache backed by SharedPreferences.
/// Stores JSON-encoded API responses with TTL-based expiry.
class OfflineCache {
  static const _prefix = 'cache_';
  static const _ttlMs = 10 * 60 * 1000; // 10 minutes

  final SharedPreferences _prefs;

  OfflineCache(this._prefs);

  /// Store a value in the cache.
  Future<void> put(String key, dynamic value) async {
    final envelope = {
      'ts': DateTime.now().millisecondsSinceEpoch,
      'data': value,
    };
    await _prefs.setString('$_prefix$key', jsonEncode(envelope));
  }

  /// Retrieve a cached value. Returns null if missing or expired.
  dynamic get(String key) {
    final raw = _prefs.getString('$_prefix$key');
    if (raw == null) return null;
    try {
      final envelope = jsonDecode(raw) as Map<String, dynamic>;
      final ts = envelope['ts'] as int;
      if (DateTime.now().millisecondsSinceEpoch - ts > _ttlMs) {
        _prefs.remove('$_prefix$key');
        return null;
      }
      return envelope['data'];
    } catch (_) {
      _prefs.remove('$_prefix$key');
      return null;
    }
  }

  /// Clear all cached entries.
  Future<void> clear() async {
    final keys = _prefs.getKeys().where((k) => k.startsWith(_prefix));
    for (final k in keys) {
      await _prefs.remove(k);
    }
  }
}

/// Provider for the offline cache.
final offlineCacheProvider = Provider<OfflineCache>((ref) {
  throw UnimplementedError('Must be overridden with SharedPreferences instance');
});
