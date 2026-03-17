import 'package:flutter/material.dart';
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
    final settings = ref.read(settingsProvider);
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
            content: Text('Verbunden! Hub v$_hubVersion'),
            backgroundColor: Tokens.green,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Verbindung fehlgeschlagen: $e'),
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
        const SnackBar(content: Text('Gespeichert!')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final settings = ref.watch(settingsProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Einstellungen')),
      body: ListView(
        padding: const EdgeInsets.all(Tokens.space4),
        children: [
          // Hub Connection section
          Text(
            'Hub Verbindung',
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  color: Tokens.gold,
                ),
          ),
          const SizedBox(height: Tokens.space3),

          TextField(
            controller: _urlController,
            decoration: InputDecoration(
              labelText: 'Hub URL',
              prefixIcon: const Icon(LucideIcons.link),
              hintText: 'http://localhost:3334',
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
                      tooltip: 'Verbindung testen',
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
            label: const Text('Speichern'),
          ),

          const SizedBox(height: Tokens.space8),

          // Language section
          Text(
            'Sprache',
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  color: Tokens.gold,
                ),
          ),
          const SizedBox(height: Tokens.space3),

          Card(
            child: Column(
              children: [
                RadioListTile<String>(
                  title: const Text('Deutsch'),
                  value: 'de',
                  groupValue: settings.language,
                  onChanged: (v) => ref.read(settingsProvider.notifier).setLanguage(v!),
                  activeColor: Tokens.gold,
                ),
                const Divider(height: 1),
                RadioListTile<String>(
                  title: const Text('English'),
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
            'Info',
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
                        'ARQITEKT Mobile v1.0.0',
                        style: Theme.of(context).textTheme.titleSmall,
                      ),
                    ],
                  ),
                  const SizedBox(height: Tokens.space3),
                  const Text(
                    'KI-powered Requirements Engineering Framework\n'
                    'Von der Idee zur Applikation.',
                    style: TextStyle(color: Tokens.textSecondary),
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
