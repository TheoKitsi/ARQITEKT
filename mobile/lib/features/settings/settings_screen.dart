import 'package:flutter/material.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../providers/settings_provider.dart';
import '../../services/api_client.dart';
import '../../theme/tokens.dart';

class SettingsScreen extends ConsumerStatefulWidget {
  const SettingsScreen({super.key});

  @override
  ConsumerState<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends ConsumerState<SettingsScreen> {
  final _urlController = TextEditingController();
  String? _hubVersion;
  bool _testing = false;

  @override
  void initState() {
    super.initState();
    final settingsAsync = ref.read(settingsProvider);
    final settings = settingsAsync.valueOrNull ?? const AppSettings();
    _urlController.text = settings.hubUrl;
  }

  @override
  void dispose() {
    _urlController.dispose();
    super.dispose();
  }

  Future<void> _testConnection() async {
    setState(() {
      _testing = true;
      _hubVersion = null;
    });

    try {
      final api = ApiClient(baseUrl: '${_urlController.text.trim()}/api');
      final data = await api.getVersion();
      setState(() => _hubVersion = data['version'] as String?);

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(AppLocalizations.of(context)!.connectedHub(_hubVersion!)),
            backgroundColor: Tokens.green,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(AppLocalizations.of(context)!.connectionFailedDetail(e.toString())),
            backgroundColor: Tokens.red,
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _testing = false);
    }
  }

  Future<void> _save() async {
    final url = _urlController.text.trim();
    if (url.isEmpty) return;
    await ref.read(settingsProvider.notifier).setHubUrl(url);
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(AppLocalizations.of(context)!.saved)),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final settingsAsync = ref.watch(settingsProvider);
    final settings = settingsAsync.valueOrNull ?? const AppSettings();
    final l = AppLocalizations.of(context)!;

    return Scaffold(
      appBar: AppBar(title: Text(l.settings)),
      body: ListView(
        padding: const EdgeInsets.all(Tokens.space4),
        children: [
          // Hub Connection section
          Text(
            l.hubConnection,
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  color: Tokens.gold,
                ),
          ),
          const SizedBox(height: Tokens.space3),

          TextField(
            controller: _urlController,
            decoration: InputDecoration(
              labelText: l.hubUrl,
              prefixIcon: const Icon(LucideIcons.link),
              hintText: l.hubUrlHint,
              suffixIcon: _testing
                  ? const Padding(
                      padding: EdgeInsets.all(12),
                      child: SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      ),
                    )
                  : IconButton(
                      icon: const Icon(LucideIcons.zap),
                      onPressed: _testConnection,
                      tooltip: l.testConnection,
                    ),
            ),
          ),

          if (_hubVersion != null) ...[
            const SizedBox(height: Tokens.space2),
            Row(
              children: [
                const Icon(LucideIcons.checkCircle, size: 16, color: Tokens.green),
                const SizedBox(width: Tokens.space2),
                Text(
                  'Hub v$_hubVersion',
                  style: const TextStyle(color: Tokens.green, fontSize: Tokens.fontSm),
                ),
              ],
            ),
          ],

          const SizedBox(height: Tokens.space4),

          // Save button
          FilledButton.icon(
            onPressed: _save,
            icon: const Icon(LucideIcons.save, size: 18),
            label: Text(l.save),
          ),

          const SizedBox(height: Tokens.space8),

          // Language section
          Text(
            l.language,
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  color: Tokens.gold,
                ),
          ),
          const SizedBox(height: Tokens.space3),

          Card(
            child: Column(
              children: [
                RadioListTile<String>(
                  title: Text(l.german),
                  value: 'de',
                  groupValue: settings.language,
                  onChanged: (v) => ref.read(settingsProvider.notifier).setLanguage(v!),
                  activeColor: Tokens.gold,
                ),
                const Divider(height: 1),
                RadioListTile<String>(
                  title: Text(l.english),
                  value: 'en',
                  groupValue: settings.language,
                  onChanged: (v) => ref.read(settingsProvider.notifier).setLanguage(v!),
                  activeColor: Tokens.gold,
                ),
              ],
            ),
          ),

          const SizedBox(height: Tokens.space8),

          // About section
          Text(
            l.info,
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  color: Tokens.gold,
                ),
          ),
          const SizedBox(height: Tokens.space3),

          Card(
            child: Padding(
              padding: const EdgeInsets.all(Tokens.space4),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      const Icon(LucideIcons.shield, color: Tokens.gold),
                      const SizedBox(width: Tokens.space3),
                      Text(
                        l.appVersion,
                        style: Theme.of(context).textTheme.titleSmall,
                      ),
                    ],
                  ),
                  const SizedBox(height: Tokens.space3),
                  Text(
                    l.appDescription,
                    style: const TextStyle(color: Tokens.textSecondary),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
